-- Create table to track catch-up reminders
CREATE TABLE public.catchup_reminder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  relationship_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catchup_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own catchup reminder logs" 
ON public.catchup_reminder_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert catchup reminder logs" 
ON public.catchup_reminder_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to set up catch-up cron job
CREATE OR REPLACE FUNCTION public.setup_catchup_cron()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Try to unschedule any existing catchup job, ignore if it doesn't exist
  BEGIN
    PERFORM cron.unschedule('quarterly-catchup-reminders');
  EXCEPTION 
    WHEN OTHERS THEN
      -- Job doesn't exist, continue
      NULL;
  END;
  
  -- Schedule the cron job to run monthly on the 1st at 10:00 AM UTC
  -- (we'll check internally if 3 months have passed)
  PERFORM cron.schedule(
    'quarterly-catchup-reminders',
    '0 10 1 * *',
    $cron$
    SELECT http_post(
      'https://xzpnizupsygzilcibstc.supabase.co/functions/v1/send-catchup-reminders',
      '{"scheduled": true}',
      'application/json'
    );
    $cron$
  );
  
  RETURN 'Catch-up cron job scheduled successfully';
END;
$function$;