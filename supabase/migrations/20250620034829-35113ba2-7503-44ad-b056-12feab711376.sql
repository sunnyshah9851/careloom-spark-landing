
-- Create a table to track thoughtful actions/interactions
CREATE TABLE public.thoughtful_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'suggestion_viewed', 'date_idea_used', 'event_acknowledged', etc.
  action_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.thoughtful_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for thoughtful_actions
CREATE POLICY "Users can view their own actions" 
  ON public.thoughtful_actions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own actions" 
  ON public.thoughtful_actions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add an index for better performance
CREATE INDEX idx_thoughtful_actions_user_created 
  ON public.thoughtful_actions(user_id, created_at DESC);
