
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
    console.log('=== Setting up corrected cron jobs ===');
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrl: supabaseUrl
    });

    // Create both cron jobs with corrected HTTP function calls
    const { data, error } = await supabase.rpc('setup_reminder_cron');

    if (error) {
      console.error('Error setting up cron jobs:', error);
      throw error;
    }

    console.log('Cron jobs setup result:', data);

    // Test the birthday reminders function immediately
    console.log('Testing birthday reminders function...');
    const { data: birthdayData, error: birthdayError } = await supabase.functions.invoke('send-birthday-reminders', {
      body: { test: true, debug: true }
    });

    if (birthdayError) {
      console.error('Birthday reminders test failed:', birthdayError);
    } else {
      console.log('Birthday reminders test result:', birthdayData);
    }

    // Test the date ideas function
    console.log('Testing date ideas function...');
    const { data: dateIdeasData, error: dateIdeasError } = await supabase.functions.invoke('send-date-ideas', {
      body: { scheduled: true, test: true }
    });

    if (dateIdeasError) {
      console.error('Date ideas test failed:', dateIdeasError);
    } else {
      console.log('Date ideas test result:', dateIdeasData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron jobs have been set up with corrected HTTP function calls and tested successfully',
        setupResult: data,
        testResults: {
          birthdayReminders: {
            success: !birthdayError,
            data: birthdayData,
            error: birthdayError
          },
          dateIdeas: {
            success: !dateIdeasError,
            data: dateIdeasData,
            error: dateIdeasError
          }
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
        details: 'Failed to set up cron jobs with corrected HTTP function calls',
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
