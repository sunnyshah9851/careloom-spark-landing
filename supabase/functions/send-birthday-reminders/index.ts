
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
  birthday_notification_frequency: string;
  anniversary_notification_frequency: string;
  profile_id: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

// Helper function to get days offset from frequency
const getFrequencyDays = (frequency: string): number => {
  switch (frequency) {
    case '1_day': return 1;
    case '3_days': return 3;
    case '1_week': return 7;
    case '2_weeks': return 14;
    case '1_month': return 30;
    case 'none': return -1; // -1 means no notifications
    default: return 7; // default to 1 week
  }
};

// Fixed function to check if a date matches the reminder criteria
const shouldSendReminder = (eventDate: string, frequency: string): boolean => {
  const daysOffset = getFrequencyDays(frequency);
  if (daysOffset === -1) return false; // No notifications
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC
  
  const currentYear = today.getUTCFullYear();
  
  // Create the event date for this year in UTC
  const eventThisYear = new Date(`${currentYear}-${eventDate.slice(5)}T00:00:00.000Z`);
  
  // Calculate the reminder date (X days before the event)
  const reminderDate = new Date(eventThisYear);
  reminderDate.setUTCDate(eventThisYear.getUTCDate() - daysOffset);
  
  console.log(`Debug shouldSendReminder:`, {
    eventDate,
    frequency,
    daysOffset,
    today: today.toISOString().split('T')[0],
    eventThisYear: eventThisYear.toISOString().split('T')[0],
    reminderDate: reminderDate.toISOString().split('T')[0],
    shouldSend: today.getTime() === reminderDate.getTime()
  });
  
  // Check if today is the reminder date
  return today.getTime() === reminderDate.getTime();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isDebug = url.searchParams.get('debug') === 'true';
    
    console.log(`=== Birthday Reminder Function Started ===`);
    console.log(`Execution time: ${new Date().toISOString()}`);
    console.log(`Debug mode: ${isDebug}`);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    console.log(`Today: ${today.toISOString().split('T')[0]} (UTC)`);

    // Fetch all relationships with their notification preferences
    const { data: relationships, error: fetchError } = await supabase
      .from('relationships')
      .select(`
        id,
        name,
        birthday,
        anniversary,
        birthday_notification_frequency,
        anniversary_notification_frequency,
        profile_id,
        profiles!inner(email, full_name)
      `)
      .not('profiles.email', 'is', null);

    if (fetchError) {
      console.error('Error fetching relationships:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${relationships?.length || 0} relationships to check`);

    const emailsSent = [];
    const debugInfo = [];

    for (const relationship of relationships || []) {
      const rel = relationship as Relationship;
      
      console.log(`\n--- Checking relationship: ${rel.name} ---`);
      console.log(`Profile: ${rel.profiles.full_name} (${rel.profiles.email})`);
      
      // Check for birthday reminder
      if (rel.birthday) {
        console.log(`Birthday: ${rel.birthday}, Frequency: ${rel.birthday_notification_frequency}`);
        
        const shouldSend = shouldSendReminder(rel.birthday, rel.birthday_notification_frequency);
        console.log(`Should send birthday reminder: ${shouldSend}`);
        
        if (isDebug) {
          debugInfo.push({
            name: rel.name,
            type: 'birthday',
            date: rel.birthday,
            frequency: rel.birthday_notification_frequency,
            shouldSend,
            email: rel.profiles.email
          });
        }

        if (shouldSend && !isDebug) {
          const birthdayThisYear = `${currentYear}-${rel.birthday.slice(5)}`;
          const daysUntil = getFrequencyDays(rel.birthday_notification_frequency);
          
          console.log(`Checking for existing birthday log for ${rel.name}...`);
          
          // Check if we already sent a reminder for this birthday this year
          const { data: existingBirthdayLog } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('relationship_id', rel.id)
            .eq('reminder_type', 'birthday')
            .eq('event_date', birthdayThisYear)
            .gte('sent_at', `${currentYear}-01-01`)
            .single();

          if (!existingBirthdayLog) {
            console.log(`Sending birthday reminder for ${rel.name}...`);
            
            // Send birthday reminder
            const emailResult = await sendReminderEmail(
              rel.profiles.email,
              rel.profiles.full_name,
              rel.name,
              'birthday',
              daysUntil,
              new Date(birthdayThisYear)
            );

            if (emailResult.success) {
              console.log(`Birthday email sent successfully for ${rel.name}`);
              
              // Log the sent reminder
              const { error: logError } = await supabase
                .from('reminder_logs')
                .insert({
                  relationship_id: rel.id,
                  reminder_type: 'birthday',
                  reminder_date: today.toISOString().split('T')[0],
                  event_date: birthdayThisYear
                });

              if (logError) {
                console.error(`Error logging birthday reminder for ${rel.name}:`, logError);
              } else {
                console.log(`Birthday reminder logged successfully for ${rel.name}`);
              }

              emailsSent.push({
                type: 'birthday',
                recipient: rel.profiles.email,
                partner: rel.name,
                daysUntil
              });
            } else {
              console.error(`Failed to send birthday email for ${rel.name}:`, emailResult.error);
            }
          } else {
            console.log(`Birthday reminder already sent for ${rel.name} this year`);
          }
        }
      } else {
        console.log(`No birthday set for ${rel.name}`);
      }

      // Check for anniversary reminder
      if (rel.anniversary) {
        console.log(`Anniversary: ${rel.anniversary}, Frequency: ${rel.anniversary_notification_frequency}`);
        
        const shouldSend = shouldSendReminder(rel.anniversary, rel.anniversary_notification_frequency);
        console.log(`Should send anniversary reminder: ${shouldSend}`);
        
        if (isDebug) {
          debugInfo.push({
            name: rel.name,
            type: 'anniversary',
            date: rel.anniversary,
            frequency: rel.anniversary_notification_frequency,
            shouldSend,
            email: rel.profiles.email
          });
        }

        if (shouldSend && !isDebug) {
          const anniversaryThisYear = `${currentYear}-${rel.anniversary.slice(5)}`;
          const daysUntil = getFrequencyDays(rel.anniversary_notification_frequency);
          
          console.log(`Checking for existing anniversary log for ${rel.name}...`);
          
          // Check if we already sent a reminder for this anniversary this year
          const { data: existingAnniversaryLog } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('relationship_id', rel.id)
            .eq('reminder_type', 'anniversary')
            .eq('event_date', anniversaryThisYear)
            .gte('sent_at', `${currentYear}-01-01`)
            .single();

          if (!existingAnniversaryLog) {
            console.log(`Sending anniversary reminder for ${rel.name}...`);
            
            // Send anniversary reminder
            const emailResult = await sendReminderEmail(
              rel.profiles.email,
              rel.profiles.full_name,
              rel.name,
              'anniversary',
              daysUntil,
              new Date(anniversaryThisYear)
            );

            if (emailResult.success) {
              console.log(`Anniversary email sent successfully for ${rel.name}`);
              
              // Log the sent reminder
              const { error: logError } = await supabase
                .from('reminder_logs')
                .insert({
                  relationship_id: rel.id,
                  reminder_type: 'anniversary',
                  reminder_date: today.toISOString().split('T')[0],
                  event_date: anniversaryThisYear
                });

              if (logError) {
                console.error(`Error logging anniversary reminder for ${rel.name}:`, logError);
              } else {
                console.log(`Anniversary reminder logged successfully for ${rel.name}`);
              }

              emailsSent.push({
                type: 'anniversary',
                recipient: rel.profiles.email,
                partner: rel.name,
                daysUntil
              });
            } else {
              console.error(`Failed to send anniversary email for ${rel.name}:`, emailResult.error);
            }
          } else {
            console.log(`Anniversary reminder already sent for ${rel.name} this year`);
          }
        }
      } else {
        console.log(`No anniversary set for ${rel.name}`);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Successfully sent ${emailsSent.length} reminder emails`);
    console.log(`Function execution completed at: ${new Date().toISOString()}`);

    if (isDebug) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          debug: true,
          today: today.toISOString().split('T')[0],
          debugInfo,
          message: 'Debug mode - no emails sent'
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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
  daysUntil: number,
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
    
    const daysText = daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
    const emoji = eventType === 'birthday' ? '🎂' : '💕';

    console.log(`Attempting to send ${eventType} email to ${recipientEmail} for ${partnerName}`);

    const emailResponse = await resend.emails.send({
      from: "Careloom <reminders@lovable.app>",
      to: [recipientEmail],
      subject: `${emoji} Reminder: ${partnerName}'s ${eventTypeDisplay} is ${daysText}!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdf2f8;">
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #fce7f3;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #be185d; font-size: 28px; margin: 0; font-weight: 700;">${emoji} Special Day Reminder</h1>
            </div>
            
            <div style="background: #fdf2f8; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #ec4899;">
              <h2 style="color: #881337; margin: 0 0 12px 0; font-size: 20px;">Hi ${recipientName}!</h2>
              <p style="color: #4c1d95; font-size: 16px; line-height: 1.6; margin: 0;">
                This is a friendly reminder that <strong>${partnerName}'s ${eventType}</strong> is ${daysText} on <strong>${dateString}</strong>.
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
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                You're receiving this because you set up a reminder ${daysUntil === 1 ? '1 day' : daysUntil + ' days'} before ${partnerName}'s ${eventType}.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`${eventTypeDisplay} reminder email sent successfully:`, emailResponse);
    return { success: true };

  } catch (error: any) {
    console.error(`Error sending ${eventType} reminder email:`, error);
    return { success: false, error: error.message };
  }
}

serve(handler);
