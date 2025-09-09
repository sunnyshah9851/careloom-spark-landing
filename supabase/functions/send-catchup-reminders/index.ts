import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CatchupResult {
  userId: string;
  userEmail: string;
  friendsCount: number;
  success: boolean;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Catch-up reminders function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scheduled } = await req.json();
    console.log('Scheduled execution:', scheduled);

    // Get all users with profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, city');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles.length} users to check`);

    const results: CatchupResult[] = [];

    for (const profile of profiles) {
      if (!profile.city) {
        console.log(`Skipping user ${profile.email} - no city set`);
        continue;
      }

      try {
        // Get friends in different cities
        const { data: friends, error: friendsError } = await supabase
          .from('relationships')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('relationship_type', 'friend')
          .neq('city', profile.city)
          .not('city', 'is', null);

        if (friendsError) {
          console.error(`Error fetching friends for ${profile.email}:`, friendsError);
          results.push({
            userId: profile.id,
            userEmail: profile.email,
            friendsCount: 0,
            success: false,
            error: friendsError.message,
          });
          continue;
        }

        if (!friends || friends.length === 0) {
          console.log(`No friends in different cities for ${profile.email}`);
          continue;
        }

        // Check if we've sent reminders for these friends in the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const friendsNeedingReminders = [];

        for (const friend of friends) {
          const { data: lastReminder } = await supabase
            .from('catchup_reminder_logs')
            .select('sent_at')
            .eq('user_id', profile.id)
            .eq('relationship_id', friend.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          if (!lastReminder || new Date(lastReminder.sent_at) < threeMonthsAgo) {
            friendsNeedingReminders.push(friend);
          }
        }

        if (friendsNeedingReminders.length === 0) {
          console.log(`No catch-up reminders needed for ${profile.email}`);
          continue;
        }

        // Send catch-up reminder email
        const friendsList = friendsNeedingReminders
          .map(friend => `• ${friend.name} in ${friend.city}`)
          .join('\n');

        const emailContent = `
          <h2>Time to Catch Up! 🌍</h2>
          <p>Hi ${profile.full_name || 'there'}!</p>
          <p>It's been a while since you connected with some of your friends who live in different cities. Here are some people you might want to reach out to:</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${friendsNeedingReminders.map(friend => `
              <div style="margin-bottom: 10px;">
                <strong>${friend.name}</strong> in ${friend.city}
                ${friend.phone_number ? `<br><span style="color: #666;">📱 ${friend.phone_number}</span>` : ''}
                ${friend.email ? `<br><span style="color: #666;">✉️ ${friend.email}</span>` : ''}
              </div>
            `).join('')}
          </div>
          <p>A simple "Hey, how are you?" message can brighten someone's day and strengthen your connection!</p>
          <p>Happy connecting! 💝</p>
          <p><em>This is your quarterly catch-up reminder. You can manage your notification preferences in your Careloom settings.</em></p>
        `;

        const { error: emailError } = await resend.emails.send({
          from: 'Careloom <reminders@careloom.app>',
          to: [profile.email],
          subject: `Time to catch up with ${friendsNeedingReminders.length} friend${friendsNeedingReminders.length > 1 ? 's' : ''} 🌍`,
          html: emailContent,
        });

        if (emailError) {
          console.error(`Failed to send catch-up email to ${profile.email}:`, emailError);
          results.push({
            userId: profile.id,
            userEmail: profile.email,
            friendsCount: friendsNeedingReminders.length,
            success: false,
            error: emailError.message,
          });
          continue;
        }

        // Log the reminders
        for (const friend of friendsNeedingReminders) {
          await supabase
            .from('catchup_reminder_logs')
            .insert({
              user_id: profile.id,
              relationship_id: friend.id,
            });
        }

        console.log(`Sent catch-up reminder to ${profile.email} for ${friendsNeedingReminders.length} friends`);
        results.push({
          userId: profile.id,
          userEmail: profile.email,
          friendsCount: friendsNeedingReminders.length,
          success: true,
        });

      } catch (error) {
        console.error(`Error processing user ${profile.email}:`, error);
        results.push({
          userId: profile.id,
          userEmail: profile.email,
          friendsCount: 0,
          success: false,
          error: error.message,
        });
      }
    }

    const summary = {
      totalUsers: profiles.length,
      emailsSent: results.filter(r => r.success).length,
      errors: results.filter(r => !r.success).length,
      results: results,
    };

    console.log('Catch-up reminders summary:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in catch-up reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);