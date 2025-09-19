-- Create function to set up date ideas cron job
CREATE OR REPLACE FUNCTION public.setup_date_ideas_cron()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to unschedule any existing date ideas job, ignore if it doesn't exist
  BEGIN
    PERFORM cron.unschedule('weekly-date-ideas');
  EXCEPTION 
    WHEN OTHERS THEN
      -- Job doesn't exist, continue
      NULL;
  END;
  
  -- Schedule the cron job to run every Monday at 10:00 AM UTC
  PERFORM cron.schedule(
    'weekly-date-ideas',
    '0 10 * * 1',
    $cron$
    SELECT http_post(
      'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-date-ideas',
      '{"scheduled": true}',
      'application/json'
    );
    $cron$
  );
  
  RETURN 'Weekly date ideas cron job scheduled successfully for Mondays at 10:00 AM UTC';
END;
$$;

-- Execute the function to set up the cron job
SELECT public.setup_date_ideas_cron();