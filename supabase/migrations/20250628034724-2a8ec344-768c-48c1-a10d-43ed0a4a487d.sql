
-- Add a table to track sent reminders to avoid duplicates
CREATE TABLE public.reminder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL, -- 'birthday' or 'anniversary'
  reminder_date DATE NOT NULL,
  event_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for reminder_logs
CREATE POLICY "Users can view their own reminder logs" 
  ON public.reminder_logs 
  FOR SELECT 
  USING (
    relationship_id IN (
      SELECT id FROM public.relationships WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "System can insert reminder logs" 
  ON public.reminder_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Add reminder preferences to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nudge_frequency TEXT DEFAULT 'weekly';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;
