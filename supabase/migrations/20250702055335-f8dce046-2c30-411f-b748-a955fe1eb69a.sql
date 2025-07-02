
-- Drop the existing check constraints
ALTER TABLE public.relationships 
DROP CONSTRAINT IF EXISTS birthday_notification_frequency_check,
DROP CONSTRAINT IF EXISTS anniversary_notification_frequency_check;

-- Add new check constraints with the correct values
ALTER TABLE public.relationships 
ADD CONSTRAINT birthday_notification_frequency_check 
CHECK (birthday_notification_frequency IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none'));

ALTER TABLE public.relationships 
ADD CONSTRAINT anniversary_notification_frequency_check 
CHECK (anniversary_notification_frequency IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none'));

-- Update default values for new records
ALTER TABLE public.relationships 
ALTER COLUMN birthday_notification_frequency SET DEFAULT '1_week',
ALTER COLUMN anniversary_notification_frequency SET DEFAULT '1_week';
