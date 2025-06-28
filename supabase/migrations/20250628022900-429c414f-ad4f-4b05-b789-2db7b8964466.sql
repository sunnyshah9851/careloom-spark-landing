
-- First, let's create the new schema structure

-- Update the profiles table to match the new structure
ALTER TABLE public.profiles DROP COLUMN IF EXISTS partner_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_birthday;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS partner_birthday;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS anniversary_date;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS reminder_frequency;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS updated_at;

-- Drop the old relationships table since we're restructuring it
DROP TABLE IF EXISTS public.relationships CASCADE;

-- Create the new relationships table
CREATE TABLE public.relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  birthday DATE,
  anniversary DATE,
  notes TEXT,
  last_nudge_sent TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the events table for tracking nudges and reminders
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on the new tables
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for relationships table
CREATE POLICY "Users can view their own relationships" 
  ON public.relationships 
  FOR SELECT 
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own relationships" 
  ON public.relationships 
  FOR INSERT 
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own relationships" 
  ON public.relationships 
  FOR UPDATE 
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own relationships" 
  ON public.relationships 
  FOR DELETE 
  USING (profile_id = auth.uid());

-- Create RLS policies for events table
CREATE POLICY "Users can view events for their relationships" 
  ON public.events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = events.relationship_id 
      AND relationships.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for their relationships" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = events.relationship_id 
      AND relationships.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events for their relationships" 
  ON public.events 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = events.relationship_id 
      AND relationships.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events for their relationships" 
  ON public.events 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = events.relationship_id 
      AND relationships.profile_id = auth.uid()
    )
  );

-- Drop the thoughtful_actions table since it's being replaced by events
DROP TABLE IF EXISTS public.thoughtful_actions CASCADE;
