/// <reference types="https://deno.land/x/types/index.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

interface ReminderResult {
  type: 'birthday' | 'anniversary';
  recipient: string;
  partner: string;
  daysUntil: number;
  success: boolean;
  error?: string;
}

// Helper function to get days offset from frequency
const getFrequencyDays = (frequency: string): number => {
  const frequencyMap: Record<string, number> = {
    '1_day': 1,
    '3_days': 3,
    '1_week': 7,
    '2_weeks': 14,
    '1_month': 30,
    'none': -1
  };
  return frequencyMap[frequency] || 7;
};

// Check if a reminder should be sent today
const shouldSendReminder = (eventDate: string, frequency: string): boolean => {
  const daysOffset = getFrequencyDays(frequency);
  if (daysOffset === -1) return false;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Parse event date
  const parts = eventDate.split('-');
  const eventMonth = parts.length === 3 ? parseInt(parts[1]) : parseInt(parts[0]);
  const eventDay = parts.length === 3 ? parseInt(parts[2]) : parseInt(parts[1]);
  
  // Calculate event date for this year
  let eventThisYear = new Date(today.getFullYear(), eventMonth - 1, eventDay);
  if (eventThisYear < today) {
    eventThisYear = new Date(today.getFullYear() + 1, eventMonth - 1, eventDay);
  }
  
  // Calculate reminder date
  const reminderDate = new Date(eventThisYear);
  reminderDate.setDate(eventThisYear.getDate() - daysOffset);
  const reminderDateString = reminderDate.toISOString().split('T')[0];
  
  // Send if today is reminder date OR event date
  return todayString === reminderDateString || todayString === eventThisYear.toISOString().split('T')[0];
};

// Send reminder email
const sendReminderEmail = async (
  recipientEmail: string,
  recipientName: string,
  partnerName: string,
  eventType: 'birthday' | 'anniversary',
  daysUntil: number
): Promise<boolean> => {
  try {
    const subject = daysUntil === 0 
      ? `🎉 It's ${partnerName}'s ${eventType === 'birthday' ? 'Birthday' : 'Anniversary'} today!`
      : `📅 ${partnerName}'s ${eventType === 'birthday' ? 'Birthday' : 'Anniversary'} in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fefcfa;">
        <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 30px; text-align: center; border-radius: 12px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${recipientName},<br><br>
            ${daysUntil === 0 
              ? `Today is ${partnerName}'s ${eventType === 'birthday' ? 'birthday' : 'anniversary'}! 🎉`
              : `${partnerName}'s ${eventType === 'birthday' ? 'birthday' : 'anniversary'} is coming up in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. 📅`
            }
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Take a moment to celebrate this special person in your life. 
            Whether it's a simple message, a call, or planning something special, 
            your attention and care will mean the world to them.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          Sent with care from Careloom 💕
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [recipientEmail],
      subject,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json().catch(() => ({}));
    const { debug, forceSend, scheduled, testDateLogic } = requestBody;

    console.log(`=== Birthday Reminder Function Started ===`);
    console.log(`Mode: debug=${debug}, forceSend=${forceSend}, scheduled=${scheduled}`);

    // Test date logic if requested
    if (testDateLogic) {
      const testDates = [
        { date: '1990-05-15', frequency: '1_week' },
        { date: '1990-05-15', frequency: '3_days' },
        { date: '1990-05-15', frequency: '1_day' }
      ];
      
      const testResults = testDates.map(test => ({
        ...test,
        shouldSend: shouldSendReminder(test.date, test.frequency),
        today: new Date().toISOString().split('T')[0]
      }));
      
      return new Response(JSON.stringify({ success: true, testResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fetch relationships
    const { data: relationships, error: fetchError } = await supabase
      .from('relationships')
      .select(`
        id, name, birthday, anniversary,
        birthday_notification_frequency, anniversary_notification_frequency,
        profile_id, profiles!inner(email, full_name)
      `)
      .not('profiles.email', 'is', null);

    if (fetchError) throw fetchError;

    const results: ReminderResult[] = [];
    const debugInfo: any[] = [];

    // Process each relationship
    for (const rel of relationships || []) {
      const recipientEmail = rel.profiles.email;
      
      // Check birthday reminders
      if (rel.birthday && rel.birthday_notification_frequency !== 'none') {
        const shouldSend = forceSend || shouldSendReminder(rel.birthday, rel.birthday_notification_frequency);
        
        if (debug) {
          debugInfo.push({
            name: rel.name,
            type: 'birthday',
            date: rel.birthday,
            frequency: rel.birthday_notification_frequency,
            shouldSend,
            email: recipientEmail
          });
        }

        if (shouldSend && !debug) {
          const daysUntil = getFrequencyDays(rel.birthday_notification_frequency);
          const success = await sendReminderEmail(
            recipientEmail,
            rel.profiles.full_name,
            rel.name,
            'birthday',
            daysUntil
          );

          if (success) {
            // Log the sent reminder
            await supabase.from('reminder_logs').insert({
              relationship_id: rel.id,
              reminder_type: 'birthday',
              reminder_date: new Date().toISOString().split('T')[0],
              event_date: rel.birthday
            });

            results.push({
              type: 'birthday',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: true
            });
          } else {
            results.push({
              type: 'birthday',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: false,
              error: 'Failed to send email'
            });
          }
        }
      }

      // Check anniversary reminders
      if (rel.anniversary && rel.anniversary_notification_frequency !== 'none') {
        const shouldSend = forceSend || shouldSendReminder(rel.anniversary, rel.anniversary_notification_frequency);
        
        if (debug) {
          debugInfo.push({
            name: rel.name,
            type: 'anniversary',
            date: rel.anniversary,
            frequency: rel.anniversary_notification_frequency,
            shouldSend,
            email: recipientEmail
          });
        }

        if (shouldSend && !debug) {
          const daysUntil = getFrequencyDays(rel.anniversary_notification_frequency);
          const success = await sendReminderEmail(
            recipientEmail,
            rel.profiles.full_name,
            rel.name,
            'anniversary',
            daysUntil
          );

          if (success) {
            await supabase.from('reminder_logs').insert({
              relationship_id: rel.id,
              reminder_type: 'anniversary',
              reminder_date: new Date().toISOString().split('T')[0],
              event_date: rel.anniversary
            });

            results.push({
              type: 'anniversary',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: true
            });
          } else {
            results.push({
              type: 'anniversary',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: false,
              error: 'Failed to send email'
            });
          }
        }
      }
    }

    const response = debug ? { debugInfo } : { results };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
