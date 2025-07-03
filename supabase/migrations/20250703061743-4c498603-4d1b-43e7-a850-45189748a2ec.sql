
-- Add date_ideas_frequency column to relationships table
ALTER TABLE public.relationships 
ADD COLUMN date_ideas_frequency TEXT DEFAULT 'weekly';

-- Add a comment to document the column
COMMENT ON COLUMN public.relationships.date_ideas_frequency IS 'Frequency for sending date ideas nudges: weekly, biweekly, monthly, or never';
