
-- Enable the net extension to allow HTTP requests from cron jobs
CREATE EXTENSION IF NOT EXISTS net;

-- Also ensure pg_cron is enabled (should already be enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Update the setup_reminder_cron function to use the correct net.http_post syntax
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
  
  -- Try to unschedule any existing date ideas job, ignore if it doesn't exist
  BEGIN
    PERFORM cron.unschedule('daily-date-ideas');
  EXCEPTION 
    WHEN OTHERS THEN
      -- Job doesn't exist, continue
      NULL;
  END;
  
  -- Schedule the birthday reminders cron job to run daily at 9:00 AM UTC
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
  
  -- Schedule the date ideas cron job to run daily at 10:00 AM UTC (1 hour after birthday reminders)
  PERFORM cron.schedule(
    'daily-date-ideas',
    '0 10 * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-date-ideas',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cG5penVwc3lnemlsY2lic3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAzNTY3MiwiZXhwIjoyMDY1NjExNjcyfQ.IJ3OECkWMKQdpvYZBSfNe4zYQhpJqjzG8AjRpZMqGz8"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    );
    $cron$
  );
  
  RETURN 'Both cron jobs scheduled successfully with net extension enabled';
END;
$$;

-- Run the function to set up both cron jobs
SELECT setup_reminder_cron();
