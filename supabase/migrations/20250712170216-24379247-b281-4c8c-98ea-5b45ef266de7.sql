-- Fix the cron job to use the correct http_post function
CREATE OR REPLACE FUNCTION setup_reminder_cron()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to unschedule any existing reminder job, ignore if it doesn't exist
  BEGIN
    PERFORM cron.unschedule('daily-birthday-reminders');
  EXCEPTION 
    WHEN OTHERS THEN
      -- Job doesn't exist, continue
      NULL;
  END;
  
  -- Schedule the cron job to run daily at 9:00 AM UTC using the correct http_post function
  PERFORM cron.schedule(
    'daily-birthday-reminders',
    '0 9 * * *',
    'SELECT public.http_post(''https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-birthday-reminders'', ''{"scheduled": true}'', ''application/json'');'
  );
  
  RETURN 'Cron job scheduled successfully with correct http_post function';
END;
$$;

-- Run the function to update the cron job
SELECT setup_reminder_cron();