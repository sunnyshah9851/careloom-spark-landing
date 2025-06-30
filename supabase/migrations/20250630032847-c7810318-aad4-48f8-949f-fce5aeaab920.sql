
-- Create a table for user feedback
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  current_url TEXT NOT NULL,
  liked TEXT,
  disliked TEXT,
  pricing_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to INSERT their own feedback
CREATE POLICY "Users can create their own feedback" 
  ON public.feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to SELECT their own feedback (optional for admin purposes)
CREATE POLICY "Users can view their own feedback" 
  ON public.feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);
