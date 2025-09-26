-- Update the date ideas cron job to run on Thursday 10:25 PM EST (Friday 2:25 AM UTC)
-- Note: EST in September is actually EDT (UTC-4), so Thursday 10:25 PM EDT = Friday 2:25 AM UTC

CREATE OR REPLACE FUNCTION public.setup_date_ideas_cron()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Try to unschedule any existing date ideas job, ignore if it doesn't exist
  BEGIN
    PERFORM cron.unschedule('weekly-date-ideas');
  EXCEPTION 
    WHEN OTHERS THEN
      -- Job doesn't exist, continue
      NULL;
  END;
  
  -- Schedule the cron job to run every Thursday at 10:25 PM EST/EDT
  -- (Friday 2:25 AM UTC since EST/EDT is UTC-4 in September)
  PERFORM cron.schedule(
    'weekly-date-ideas',
    '25 2 * * 5',
    $cron$
    SELECT http_post(
      'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-date-ideas',
      '{"scheduled": true}',
      'application/json'
    );
    $cron$
  );
  
  RETURN 'Weekly date ideas cron job rescheduled for Thursday 10:25 PM EST (Friday 2:25 AM UTC)';
END;
$function$;