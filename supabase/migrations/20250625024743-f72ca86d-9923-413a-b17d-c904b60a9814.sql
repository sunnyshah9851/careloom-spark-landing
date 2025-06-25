
-- Clear existing thoughtful actions data to reset the count
DELETE FROM public.thoughtful_actions;

-- Verify the table structure is correct
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'thoughtful_actions' 
  AND table_schema = 'public';
