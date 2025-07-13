-- Fix the cron job to include proper authorization headers
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
  
  -- Schedule the cron job to run daily at 9:00 AM UTC with proper authorization
  PERFORM cron.schedule(
    'daily-birthday-reminders',
    '0 9 * * *',
    $$
    SELECT net.http_post(
      url := 'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-birthday-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cG5penVwc3lnemlsY2lic3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAzNTY3MiwiZXhwIjoyMDY1NjExNjcyfQ.IJ3OECkWMKQdpvYZBSfNe4zYQhpJqjzG8AjRpZMqGz8'
      ),
      body := '{"scheduled": true}'::jsonb
    );
    $$
  );
  
  RETURN 'Cron job scheduled successfully with proper authorization headers';
END;
$$;

-- Run the function to update the cron job
SELECT setup_reminder_cron();