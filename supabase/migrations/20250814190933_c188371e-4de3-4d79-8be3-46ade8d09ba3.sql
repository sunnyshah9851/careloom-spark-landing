-- Drop the existing cron job
SELECT cron.unschedule('daily-birthday-reminders');

-- Update the setup_reminder_cron function to use the standard http extension
CREATE OR REPLACE FUNCTION public.setup_reminder_cron()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Try to unschedule any existing reminder job, ignore if it doesn't exist
  BEGIN
    PERFORM cron.unschedule('daily-birthday-reminders');
  EXCEPTION 
    WHEN OTHERS THEN
      -- Job doesn't exist, continue
      NULL;
  END;
  
  -- Schedule the cron job to run daily at 9:00 AM UTC using the standard http extension
  PERFORM cron.schedule(
    'daily-birthday-reminders',
    '0 9 * * *',
    $cron$
    SELECT http_post(
      'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-birthday-reminders',
      '{"scheduled": true}',
      'application/json'
    );
    $cron$
  );
  
  RETURN 'Cron job scheduled successfully with http_post';
END;
$function$;

-- Recreate the cron job with the fixed function
SELECT public.setup_reminder_cron();