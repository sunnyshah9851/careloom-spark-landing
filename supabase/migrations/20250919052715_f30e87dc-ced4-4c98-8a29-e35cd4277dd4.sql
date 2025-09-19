-- Add date_ideas_frequency column back to relationships table for partner/spouse date night ideas
ALTER TABLE public.relationships ADD COLUMN date_ideas_frequency text DEFAULT 'none';

-- Add date_idea_logs table to track sent emails and prevent duplicates
CREATE TABLE public.date_idea_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  relationship_id uuid NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  week_of date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on date_idea_logs
ALTER TABLE public.date_idea_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for date_idea_logs
CREATE POLICY "Users can view their own date idea logs" 
ON public.date_idea_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert date idea logs" 
ON public.date_idea_logs 
FOR INSERT 
WITH CHECK (true);