
-- Drop the existing check constraints
ALTER TABLE public.relationships 
DROP CONSTRAINT IF EXISTS birthday_notification_frequency_check,
DROP CONSTRAINT IF EXISTS anniversary_notification_frequency_check;

-- Add new check constraints with the clearer time-based options
ALTER TABLE public.relationships 
ADD CONSTRAINT birthday_notification_frequency_check 
CHECK (birthday_notification_frequency IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none'));

ALTER TABLE public.relationships 
ADD CONSTRAINT anniversary_notification_frequency_check 
CHECK (anniversary_notification_frequency IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none'));

-- Update existing data to migrate from old values to new values
UPDATE public.relationships 
SET birthday_notification_frequency = CASE 
  WHEN birthday_notification_frequency = 'daily' THEN '1_day'
  WHEN birthday_notification_frequency = 'weekly' THEN '1_week' 
  WHEN birthday_notification_frequency = 'monthly' THEN '1_month'
  WHEN birthday_notification_frequency = 'none' THEN 'none'
  ELSE '1_week'
END;

UPDATE public.relationships 
SET anniversary_notification_frequency = CASE 
  WHEN anniversary_notification_frequency = 'daily' THEN '1_day'
  WHEN anniversary_notification_frequency = 'weekly' THEN '1_week'
  WHEN anniversary_notification_frequency = 'monthly' THEN '1_month' 
  WHEN anniversary_notification_frequency = 'none' THEN 'none'
  ELSE '1_week'
END;

-- Update default values for new records
ALTER TABLE public.relationships 
ALTER COLUMN birthday_notification_frequency SET DEFAULT '1_week',
ALTER COLUMN anniversary_notification_frequency SET DEFAULT '1_week';
