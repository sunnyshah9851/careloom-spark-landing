
-- Create a relationships table to store partner information
CREATE TABLE public.relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_first_name TEXT NOT NULL,
  partner_last_name TEXT NOT NULL,
  partner_birthday DATE,
  anniversary_date DATE,
  reminder_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for relationships
CREATE POLICY "Users can view their own relationships" 
  ON public.relationships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own relationships" 
  ON public.relationships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationships" 
  ON public.relationships 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relationships" 
  ON public.relationships 
  FOR DELETE 
  USING (auth.uid() = user_id);
