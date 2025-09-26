import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CRON JOB DIAGNOSTICS STARTED ===');

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      }
    };

    // 1. Check current cron job status
    try {
      const { data: cronJobs, error: cronError } = await supabase
        .from('cron.job')
        .select('*')
        .eq('active', true);

      diagnostics.cronJobs = cronError ? { error: cronError.message } : cronJobs;
    } catch (e) {
      console.error('Error checking cron jobs:', e);
      diagnostics.cronJobs = { error: (e as any).message };
    }

    // 2. Check if the setup function exists and works
    try {
      const { data: setupResult, error: setupError } = await supabase.rpc('setup_reminder_cron');
      diagnostics.setupFunction = setupError ? { error: setupError.message } : { result: setupResult };
    } catch (e) {
      console.error('Error testing setup function:', e);
      diagnostics.setupFunction = { error: (e as any).message };
    }

    // 3. Check if the birthday reminders function works
    try {
      const { data: birthdayData, error: birthdayError } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true, test: true }
      });

      diagnostics.birthdayFunction = birthdayError ? 
        { error: birthdayError.message } : 
        { success: true, data: birthdayData, relationshipsFound: birthdayData?.debugInfo?.length || 0 };
    } catch (e) {
      console.error('Error testing birthday function:', e);
      diagnostics.birthdayFunction = { error: (e as any).message };
    }

    // 4. Check if the date ideas function works
    try {
      const { data: dateIdeasData, error: dateIdeasError } = await supabase.functions.invoke('send-date-ideas', {
        body: { scheduled: true, test: true }
      });

      diagnostics.dateIdeasFunction = dateIdeasError ? 
        { error: dateIdeasError.message } : 
        { success: true, data: dateIdeasData };
    } catch (e) {
      console.error('Error testing date ideas function:', e);
      diagnostics.dateIdeasFunction = { error: (e as any).message };
    }

    // 5. Check database extensions
    try {
      const { data: extensions, error: extError } = await supabase
        .from('pg_extension')
        .select('extname')
        .in('extname', ['pg_cron', 'http', 'net']);

      diagnostics.extensions = extError ? { error: extError.message } : extensions;
    } catch (e) {
      console.error('Error checking extensions:', e);
      diagnostics.extensions = { error: (e as any).message };
    }

    // 6. Check if there are any relationships with reminders enabled
    try {
      const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select(`
          id, name, birthday, anniversary,
          birthday_notification_frequency, anniversary_notification_frequency,
          profiles!inner(email, full_name)
        `)
        .not('profiles.email', 'is', null)
        .or('birthday_notification_frequency.neq.none,anniversary_notification_frequency.neq.none');

      diagnostics.relationships = relError ? 
        { error: relError.message } : 
        { count: relationships?.length || 0, data: relationships };
    } catch (e) {
      console.error('Error checking relationships:', e);
      diagnostics.relationships = { error: (e as any).message };
    }

    // 7. Check if there are any recent reminder logs
    try {
      const { data: logs, error: logError } = await supabase
        .from('reminder_logs')
        .select('*')
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('sent_at', { ascending: false })
        .limit(10);

      diagnostics.recentLogs = logError ? 
        { error: logError.message } : 
        { count: logs?.length || 0, data: logs };
    } catch (e) {
      console.error('Error checking recent logs:', e);
      diagnostics.recentLogs = { error: (e as any).message };
    }

    console.log('=== DIAGNOSTICS COMPLETE ===');

    return new Response(
      JSON.stringify({
        success: true,
        diagnostics
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Diagnostics failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as any).message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);