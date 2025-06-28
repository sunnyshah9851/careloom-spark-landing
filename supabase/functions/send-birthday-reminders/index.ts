
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  console.error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Relationship {
  id: string;
  name: string;
  birthday: string | null;
  anniversary: string | null;
  profile_id: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting birthday/anniversary reminder check...');

    // Calculate the date 3 days from now
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);
    const reminderDateStr = reminderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get current year for date comparisons
    const currentYear = new Date().getFullYear();

    // Fetch relationships with upcoming birthdays or anniversaries
    const { data: relationships, error: fetchError } = await supabase
      .from('relationships')
      .select(`
        id,
        name,
        birthday,
        anniversary,
        profile_id,
        profiles!inner(email, full_name)
      `)
      .or(`birthday.eq.${reminderDateStr.slice(5)},anniversary.eq.${reminderDateStr.slice(5)}`) // Match MM-DD format
      .not('profiles.email', 'is', null);

    if (fetchError) {
      console.error('Error fetching relationships:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${relationships?.length || 0} potential reminders`);

    const emailsSent = [];

    for (const relationship of relationships || []) {
      const rel = relationship as Relationship;
      
      // Check for birthday reminder
      if (rel.birthday && rel.birthday.slice(5) === reminderDateStr.slice(5)) {
        const birthdayThisYear = `${currentYear}-${rel.birthday.slice(5)}`;
        
        // Check if we already sent a reminder for this birthday this year
        const { data: existingBirthdayLog } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('relationship_id', rel.id)
          .eq('reminder_type', 'birthday')
          .eq('event_date', birthdayThisYear)
          .eq('reminder_date', reminderDateStr)
          .single();

        if (!existingBirthdayLog) {
          // Send birthday reminder
          const emailResult = await sendReminderEmail(
            rel.profiles.email,
            rel.profiles.full_name,
            rel.name,
            'birthday',
            reminderDate
          );

          if (emailResult.success) {
            // Log the sent reminder
            await supabase
              .from('reminder_logs')
              .insert({
                relationship_id: rel.id,
                reminder_type: 'birthday',
                reminder_date: reminderDateStr,
                event_date: birthdayThisYear
              });

            emailsSent.push({
              type: 'birthday',
              recipient: rel.profiles.email,
              partner: rel.name
            });
          }
        }
      }

      // Check for anniversary reminder
      if (rel.anniversary && rel.anniversary.slice(5) === reminderDateStr.slice(5)) {
        const anniversaryThisYear = `${currentYear}-${rel.anniversary.slice(5)}`;
        
        // Check if we already sent a reminder for this anniversary this year
        const { data: existingAnniversaryLog } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('relationship_id', rel.id)
          .eq('reminder_type', 'anniversary')
          .eq('event_date', anniversaryThisYear)
          .eq('reminder_date', reminderDateStr)
          .single();

        if (!existingAnniversaryLog) {
          // Send anniversary reminder
          const emailResult = await sendReminderEmail(
            rel.profiles.email,
            rel.profiles.full_name,
            rel.name,
            'anniversary',
            reminderDate
          );

          if (emailResult.success) {
            // Log the sent reminder
            await supabase
              .from('reminder_logs')
              .insert({
                relationship_id: rel.id,
                reminder_type: 'anniversary',
                reminder_date: reminderDateStr,
                event_date: anniversaryThisYear
              });

            emailsSent.push({
              type: 'anniversary',
              recipient: rel.profiles.email,
              partner: rel.name
            });
          }
        }
      }
    }

    console.log(`Successfully sent ${emailsSent.length} reminder emails`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: emailsSent.length,
        details: emailsSent 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-birthday-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendReminderEmail(
  recipientEmail: string,
  recipientName: string,
  partnerName: string,
  eventType: 'birthday' | 'anniversary',
  eventDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const eventTypeDisplay = eventType === 'birthday' ? 'Birthday' : 'Anniversary';
    const dateString = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailResponse = await resend.emails.send({
      from: "Careloom <reminders@lovable.app>",
      to: [recipientEmail],
      subject: `🎉 Reminder: ${partnerName}'s ${eventTypeDisplay} is in 3 days!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdf2f8;">
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #fce7f3;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #be185d; font-size: 28px; margin: 0; font-weight: 700;">🎉 Special Day Reminder</h1>
            </div>
            
            <div style="background: #fdf2f8; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #ec4899;">
              <h2 style="color: #881337; margin: 0 0 12px 0; font-size: 20px;">Hi ${recipientName}!</h2>
              <p style="color: #4c1d95; font-size: 16px; line-height: 1.6; margin: 0;">
                This is a friendly reminder that <strong>${partnerName}'s ${eventType}</strong> is coming up in just <strong>3 days</strong> on <strong>${dateString}</strong>.
              </p>
            </div>

            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #14532d; margin: 0 0 12px 0; font-size: 18px;">💡 Some ideas to make it special:</h3>
              <ul style="color: #166534; font-size: 14px; line-height: 1.6; margin: 8px 0; padding-left: 20px;">
                ${eventType === 'birthday' ? `
                  <li>Plan a surprise celebration</li>
                  <li>Choose a thoughtful gift</li>
                  <li>Write a heartfelt card or message</li>
                  <li>Organize a gathering with friends and family</li>
                ` : `
                  <li>Plan a romantic dinner</li>
                  <li>Recreate your first date</li>
                  <li>Create a photo album of memories</li>
                  <li>Plan a special getaway</li>
                `}
              </ul>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Sent with love from <span style="color: #ec4899; font-weight: 600;">Careloom</span> 💖
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`${eventTypeDisplay} reminder email sent to ${recipientEmail} for ${partnerName}`);
    return { success: true };

  } catch (error: any) {
    console.error(`Error sending ${eventType} reminder email:`, error);
    return { success: false, error: error.message };
  }
}

serve(handler);
