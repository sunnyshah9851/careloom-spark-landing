-- Remove the date_ideas_frequency column from relationships table
ALTER TABLE public.relationships DROP COLUMN IF EXISTS date_ideas_frequency;