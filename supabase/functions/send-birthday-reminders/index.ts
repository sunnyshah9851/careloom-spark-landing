import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
  email: string | null;
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
    case 'none': return -1;
    default: return 7;
  }
};

// Corrected function to check if a date matches the reminder criteria
const shouldSendReminder = (eventDate: string, frequency: string): boolean => {
  const daysOffset = getFrequencyDays(frequency);
  if (daysOffset === -1) return false;
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const currentYear = today.getUTCFullYear();
  
  // Parse the event date (format: YYYY-MM-DD or MM-DD)
  let eventMonth: number, eventDay: number;
  if (eventDate.includes('-')) {
    const parts = eventDate.split('-');
    if (parts.length === 3) {
      // Full date format YYYY-MM-DD
      eventMonth = parseInt(parts[1]);
      eventDay = parseInt(parts[2]);
    } else {
      // MM-DD format
      eventMonth = parseInt(parts[0]);
      eventDay = parseInt(parts[1]);
    }
  } else {
    console.error('Invalid date format:', eventDate);
    return false;
  }
  
  // Create the event date for this year
  let eventThisYear = new Date(currentYear, eventMonth - 1, eventDay);
  eventThisYear.setUTCHours(0, 0, 0, 0);
  
  // If the event already passed this year, use next year's date
  if (eventThisYear < today) {
    eventThisYear = new Date(currentYear + 1, eventMonth - 1, eventDay);
    eventThisYear.setUTCHours(0, 0, 0, 0);
  }
  
  // Calculate the reminder date (X days before the event)
  const reminderDate = new Date(eventThisYear);
  reminderDate.setDate(eventThisYear.getDate() - daysOffset);
  
  const shouldSend = today.getTime() === reminderDate.getTime();
  
  console.log(`Debug shouldSendReminder:`, {
    eventDate,
    frequency,
    daysOffset,
    today: today.toISOString().split('T')[0],
    eventThisYear: eventThisYear.toISOString().split('T')[0],
    reminderDate: reminderDate.toISOString().split('T')[0],
    shouldSend
  });
  
  return shouldSend;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`=== Birthday Reminder Function Started ===`);
    console.log(`Execution time: ${new Date().toISOString()}`);
    console.log(`Function called from: ${req.headers.get('user-agent') || 'unknown'}`);
    
    // Parse request
    let requestBody: any = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch (e) {
      console.log('No request body or invalid JSON');
    }
    
    const isDebug = requestBody.debug === true;
    const isForceSend = requestBody.forceSend === true;
    const isScheduled = requestBody.scheduled === true;
    
    console.log(`Mode: debug=${isDebug}, forceSend=${isForceSend}, scheduled=${isScheduled}`);
    
    const today = new Date();
    console.log(`Today: ${today.toISOString().split('T')[0]} (UTC)`);

    // Fetch all relationships with their notification preferences
    console.log('Fetching relationships...');
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
        email,
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
    const emailErrors = [];

    for (const relationship of relationships || []) {
      const rel = relationship as Relationship;
      
      console.log(`\n--- Checking relationship: ${rel.name} ---`);
      console.log(`Profile: ${rel.profiles.full_name} (${rel.profiles.email})`);
      console.log(`Relationship email: ${rel.email}`);
      
      // Always send to the profile owner's email
      const recipientEmail = rel.profiles.email;
      console.log(`Will send to profile owner: ${recipientEmail}`);
      
      // Check for birthday reminder
      if (rel.birthday) {
        console.log(`Birthday: ${rel.birthday}, Frequency: ${rel.birthday_notification_frequency}`);
        
        const shouldSend = isForceSend || shouldSendReminder(rel.birthday, rel.birthday_notification_frequency);
        console.log(`Should send birthday reminder: ${shouldSend} (force: ${isForceSend})`);
        
        if (isDebug) {
          debugInfo.push({
            name: rel.name,
            type: 'birthday',
            date: rel.birthday,
            frequency: rel.birthday_notification_frequency,
            shouldSend,
            email: recipientEmail,
            profileOwner: rel.profiles.email
          });
        }

        if (shouldSend && !isDebug) {
          const currentYear = today.getFullYear();
          const birthdayThisYear = `${currentYear}-${rel.birthday.slice(5)}`;
          const daysUntil = getFrequencyDays(rel.birthday_notification_frequency);
          
          console.log(`Sending birthday reminder for ${rel.name} to ${recipientEmail}...`);
          
          // Send birthday reminder to the profile owner
          const emailResult = await sendReminderEmail(
            recipientEmail,
            rel.profiles.full_name, // Profile owner's name (who receives the reminder)
            rel.name, // The person whose birthday it is
            'birthday',
            daysUntil,
            new Date(birthdayThisYear)
          );

          if (emailResult.success) {
            console.log(`Birthday email sent successfully for ${rel.name} to ${recipientEmail}`);
            
            // Log the sent reminder (only if not force send)
            if (!isForceSend) {
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
              }
            }

            emailsSent.push({
              type: 'birthday',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              forceSent: isForceSend
            });
          } else {
            console.error(`Failed to send birthday email for ${rel.name}:`, emailResult.error);
            emailErrors.push({
              type: 'birthday',
              recipient: recipientEmail,
              partner: rel.name,
              error: emailResult.error
            });
          }
        }
      }

      // Similar logic for anniversary reminders
      if (rel.anniversary) {
        console.log(`Anniversary: ${rel.anniversary}, Frequency: ${rel.anniversary_notification_frequency}`);
        
        const shouldSend = isForceSend || shouldSendReminder(rel.anniversary, rel.anniversary_notification_frequency);
        console.log(`Should send anniversary reminder: ${shouldSend} (force: ${isForceSend})`);
        
        if (isDebug) {
          debugInfo.push({
            name: rel.name,
            type: 'anniversary',
            date: rel.anniversary,
            frequency: rel.anniversary_notification_frequency,
            shouldSend,
            email: recipientEmail,
            profileOwner: rel.profiles.email
          });
        }

        if (shouldSend && !isDebug) {
          const currentYear = today.getFullYear();
          const anniversaryThisYear = `${currentYear}-${rel.anniversary.slice(5)}`;
          const daysUntil = getFrequencyDays(rel.anniversary_notification_frequency);
          
          console.log(`Sending anniversary reminder for ${rel.name} to ${recipientEmail}...`);
          
          const emailResult = await sendReminderEmail(
            recipientEmail,
            rel.profiles.full_name,
            rel.name,
            'anniversary',
            daysUntil,
            new Date(anniversaryThisYear)
          );

          if (emailResult.success) {
            console.log(`Anniversary email sent successfully for ${rel.name} to ${recipientEmail}`);
            
            if (!isForceSend) {
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
              }
            }

            emailsSent.push({
              type: 'anniversary',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              forceSent: isForceSend
            });
          } else {
            console.error(`Failed to send anniversary email for ${rel.name}:`, emailResult.error);
            emailErrors.push({
              type: 'anniversary',
              recipient: recipientEmail,
              partner: rel.name,
              error: emailResult.error
            });
          }
        }
      }
    }

    console.log(`\n=== Function Summary ===`);
    console.log(`Successfully sent ${emailsSent.length} reminder emails`);
    console.log(`Failed to send ${emailErrors.length} emails`);
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
        emailErrors: emailErrors.length,
        details: emailsSent,
        errors: emailErrors.length > 0 ? emailErrors : undefined
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-birthday-reminders function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendReminderEmail(
  recipientEmail: string,
  profileOwnerName: string,
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

    console.log(`Sending ${eventType} email to ${recipientEmail} for ${partnerName}`);

    const emailResponse = await resend.emails.send({
      from: "Careloom <onboarding@resend.dev>",  // Using Resend's default verified domain
      to: [recipientEmail],
      subject: `${partnerName}'s ${eventTypeDisplay} is ${daysText}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Hi there!</h2>
          
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            This is a friendly reminder that <strong>${partnerName}'s ${eventType}</strong> is ${daysText} on <strong>${dateString}</strong>.
          </p>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Some ideas to make it special:</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              ${eventType === 'birthday' ? `
                <li>Plan a surprise celebration</li>
                <li>Choose a thoughtful gift</li>
                <li>Write a heartfelt card</li>
              ` : `
                <li>Plan a romantic dinner</li>
                <li>Recreate your first date</li>
                <li>Create a photo album of memories</li>
              `}
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Sent with care from Careloom (set up by ${profileOwnerName})
          </p>
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
