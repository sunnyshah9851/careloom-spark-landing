
-- Add columns for birthday and anniversary notification frequencies to the relationships table
ALTER TABLE public.relationships 
ADD COLUMN birthday_notification_frequency TEXT DEFAULT 'weekly',
ADD COLUMN anniversary_notification_frequency TEXT DEFAULT 'weekly';

-- Add check constraints to ensure valid frequency values
ALTER TABLE public.relationships 
ADD CONSTRAINT birthday_notification_frequency_check 
CHECK (birthday_notification_frequency IN ('daily', 'weekly', 'monthly', 'none'));

ALTER TABLE public.relationships 
ADD CONSTRAINT anniversary_notification_frequency_check 
CHECK (anniversary_notification_frequency IN ('daily', 'weekly', 'monthly', 'none'));
