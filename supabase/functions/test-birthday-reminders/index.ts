
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  console.error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Debug Birthday Reminder Function ===');
    
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey,
    };
    
    // Fetch all relationships with birthdays and anniversaries
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
      throw fetchError;
    }

    const today = new Date();
    
    // Generate forecast for next 3 days
    const forecast = [];
    for (let i = 0; i <= 3; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      forecastDate.setUTCHours(0, 0, 0, 0);
      
      const dateString = forecastDate.toISOString().split('T')[0];
      const dayEmails = [];
      
      relationships?.forEach(rel => {
        // Check birthday reminders
        if (rel.birthday) {
          const shouldSend = checkIfShouldSendOnDate(rel.birthday, rel.birthday_notification_frequency, forecastDate);
          if (shouldSend) {
            dayEmails.push({
              type: 'birthday',
              recipient: rel.profiles.email,
              recipientName: rel.profiles.full_name,
              partner: rel.name,
              eventDate: rel.birthday,
              frequency: rel.birthday_notification_frequency,
              scheduledTime: '09:00 UTC (Birthday Reminders)',
              fullDateTime: `${dateString}T09:00:00.000Z`
            });
          }
        }
        
        // Check anniversary reminders
        if (rel.anniversary) {
          const shouldSend = checkIfShouldSendOnDate(rel.anniversary, rel.anniversary_notification_frequency, forecastDate);
          if (shouldSend) {
            dayEmails.push({
              type: 'anniversary',
              recipient: rel.profiles.email,
              recipientName: rel.profiles.full_name,
              partner: rel.name,
              eventDate: rel.anniversary,
              frequency: rel.anniversary_notification_frequency,
              scheduledTime: '09:00 UTC (Birthday Reminders)',
              fullDateTime: `${dateString}T09:00:00.000Z`
            });
          }
        }
        
        // Check date ideas (only for romantic relationships)
        if (rel.date_ideas_frequency && rel.date_ideas_frequency !== 'never') {
          const shouldSendDateIdeas = checkIfShouldSendDateIdeasOnDate(rel.date_ideas_frequency, forecastDate);
          if (shouldSendDateIdeas) {
            dayEmails.push({
              type: 'date_ideas',
              recipient: rel.profiles.email,
              recipientName: rel.profiles.full_name,
              partner: rel.name,
              frequency: rel.date_ideas_frequency,
              scheduledTime: '10:00 UTC (Date Ideas)',
              fullDateTime: `${dateString}T10:00:00.000Z`
            });
          }
        }
      });
      
      if (dayEmails.length > 0 || i === 0) { // Always include today even if no emails
        forecast.push({
          date: dateString,
          dayName: forecastDate.toLocaleDateString('en-US', { weekday: 'long' }),
          isToday: i === 0,
          emailCount: dayEmails.length,
          emails: dayEmails
        });
      }
    }

    const debugInfo = {
      envCheck,
      today: today.toISOString().split('T')[0],
      totalRelationships: relationships?.length || 0,
      relationshipsWithBirthdays: relationships?.filter(r => r.birthday).length || 0,
      relationshipsWithAnniversaries: relationships?.filter(r => r.anniversary).length || 0,
      relationshipsWithDateIdeas: relationships?.filter(r => r.date_ideas_frequency && r.date_ideas_frequency !== 'never').length || 0,
      forecast,
      relationships: relationships?.map(rel => ({
        name: rel.name,
        birthday: rel.birthday,
        anniversary: rel.anniversary,
        birthdayFrequency: rel.birthday_notification_frequency,
        anniversaryFrequency: rel.anniversary_notification_frequency,
        dateIdeasFrequency: rel.date_ideas_frequency,
        email: rel.profiles.email,
        shouldSendBirthdayToday: rel.birthday ? checkIfShouldSendOnDate(rel.birthday, rel.birthday_notification_frequency, today) : false,
        shouldSendAnniversaryToday: rel.anniversary ? checkIfShouldSendOnDate(rel.anniversary, rel.anniversary_notification_frequency, today) : false,
        shouldSendDateIdeasToday: rel.date_ideas_frequency && rel.date_ideas_frequency !== 'never' ? checkIfShouldSendDateIdeasOnDate(rel.date_ideas_frequency, today) : false
      })) || []
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        debug: debugInfo
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in test function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getFrequencyDays(frequency: string): number {
  switch (frequency) {
    case '1_day': return 1;
    case '3_days': return 3;
    case '1_week': return 7;
    case '2_weeks': return 14;
    case '1_month': return 30;
    case 'none': return -1;
    default: return 7;
  }
}

function checkIfShouldSendOnDate(eventDate: string, frequency: string, checkDate: Date): boolean {
  const daysOffset = getFrequencyDays(frequency);
  if (daysOffset === -1) return false;
  
  const normalizedCheckDate = new Date(checkDate);
  normalizedCheckDate.setUTCHours(0, 0, 0, 0);
  
  const currentYear = normalizedCheckDate.getUTCFullYear();
  const eventThisYear = new Date(`${currentYear}-${eventDate.slice(5)}T00:00:00.000Z`);
  const reminderDate = new Date(eventThisYear);
  reminderDate.setUTCDate(eventThisYear.getUTCDate() - daysOffset);
  
  return normalizedCheckDate.getTime() === reminderDate.getTime();
}

function checkIfShouldSendDateIdeasOnDate(frequency: string, checkDate: Date): boolean {
  const normalizedCheckDate = new Date(checkDate);
  normalizedCheckDate.setUTCHours(0, 0, 0, 0);
  
  const dayOfWeek = normalizedCheckDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  
  switch (frequency) {
    case 'weekly':
      return dayOfWeek === 1; // Monday
    case 'biweekly':
      // Every other Monday - use week number
      const weekNumber = Math.floor((normalizedCheckDate.getTime() - new Date(normalizedCheckDate.getUTCFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      return dayOfWeek === 1 && weekNumber % 2 === 0;
    case 'monthly':
      // First Monday of each month
      const firstOfMonth = new Date(normalizedCheckDate.getUTCFullYear(), normalizedCheckDate.getUTCMonth(), 1);
      const firstMonday = new Date(firstOfMonth);
      firstMonday.setUTCDate(1 + (8 - firstOfMonth.getUTCDay()) % 7);
      return normalizedCheckDate.getTime() === firstMonday.getTime();
    case 'never':
    default:
      return false;
  }
}

serve(handler);
