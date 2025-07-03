
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    
    // Fetch all relationships with birthdays
    const { data: relationships, error: fetchError } = await supabase
      .from('relationships')
      .select(`
        id,
        name,
        birthday,
        birthday_notification_frequency,
        profile_id,
        profiles!inner(email, full_name)
      `)
      .not('birthday', 'is', null)
      .not('profiles.email', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const today = new Date();
    const debugInfo = {
      envCheck,
      today: today.toISOString().split('T')[0],
      totalRelationships: relationships?.length || 0,
      relationshipsWithBirthdays: relationships?.filter(r => r.birthday).length || 0,
      relationships: relationships?.map(rel => ({
        name: rel.name,
        birthday: rel.birthday,
        frequency: rel.birthday_notification_frequency,
        email: rel.profiles.email,
        shouldSendToday: checkIfShouldSendToday(rel.birthday, rel.birthday_notification_frequency)
      })) || []
    };

    // Test calling the actual birthday reminder function
    const testResult = await fetch(`${supabaseUrl}/functions/v1/send-birthday-reminders?debug=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ debug: true })
    });

    const testResponse = await testResult.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        debug: debugInfo,
        testResult: testResponse
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

function checkIfShouldSendToday(birthday: string, frequency: string): boolean {
  const getFrequencyDays = (freq: string): number => {
    switch (freq) {
      case '1_day': return 1;
      case '3_days': return 3;
      case '1_week': return 7;
      case '2_weeks': return 14;
      case '1_month': return 30;
      case 'none': return -1;
      default: return 7;
    }
  };

  const daysOffset = getFrequencyDays(frequency);
  if (daysOffset === -1) return false;
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const currentYear = today.getUTCFullYear();
  const eventThisYear = new Date(`${currentYear}-${birthday.slice(5)}T00:00:00.000Z`);
  const reminderDate = new Date(eventThisYear);
  reminderDate.setUTCDate(eventThisYear.getUTCDate() - daysOffset);
  
  return today.getTime() === reminderDate.getTime();
}

serve(handler);
