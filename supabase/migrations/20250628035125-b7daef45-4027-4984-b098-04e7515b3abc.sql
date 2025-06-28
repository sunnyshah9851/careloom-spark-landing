
-- Create function to set up the cron job with proper error handling
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
  
  -- Schedule the cron job to run daily at 9:00 AM UTC
  PERFORM cron.schedule(
    'daily-birthday-reminders',
    '0 9 * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-birthday-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cG5penVwc3lnemlsY2lic3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAzNTY3MiwiZXhwIjoyMDY1NjExNjcyfQ.IJ3OECkWMKQdpvYZBSfNe4zYQhpJqjzG8AjRpZMqGz8"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    );
    $cron$
  );
  
  RETURN 'Cron job scheduled successfully';
END;
$$;

-- Run the function to set up the cron job
SELECT setup_reminder_cron();
