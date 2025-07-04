
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    console.log('=== Setting up cron jobs ===');
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrl: supabaseUrl
    });

    // Create both cron jobs that run daily
    const { data, error } = await supabase.rpc('setup_reminder_cron');

    if (error) {
      console.error('Error setting up cron jobs:', error);
      throw error;
    }

    console.log('Cron jobs setup result:', data);

    // Test the birthday reminders function immediately
    console.log('Testing birthday reminders function...');
    const testBirthdayResult = await fetch(`${supabaseUrl}/functions/v1/send-birthday-reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true, debug: true })
    });

    const birthdayTestData = await testBirthdayResult.text();
    console.log('Birthday reminders test result:', birthdayTestData);

    // Test the date ideas function
    console.log('Testing date ideas function...');
    const testDateIdeasResult = await fetch(`${supabaseUrl}/functions/v1/send-date-ideas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scheduled: true })
    });

    const dateIdeasTestData = await testDateIdeasResult.text();
    console.log('Date ideas test result:', dateIdeasTestData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron jobs have been set up and tested successfully',
        data,
        testResults: {
          birthdayReminders: birthdayTestData,
          dateIdeas: dateIdeasTestData
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in setup-cron-job function:', error);
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

serve(handler);
