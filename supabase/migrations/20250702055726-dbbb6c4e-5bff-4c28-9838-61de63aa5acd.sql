
-- Update all existing relationships to use the new frequency values
UPDATE public.relationships 
SET 
  birthday_notification_frequency = CASE 
    WHEN birthday_notification_frequency = 'daily' THEN '1_day'
    WHEN birthday_notification_frequency = 'weekly' THEN '1_week' 
    WHEN birthday_notification_frequency = 'monthly' THEN '1_month'
    WHEN birthday_notification_frequency = 'none' THEN 'none'
    WHEN birthday_notification_frequency IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none') THEN birthday_notification_frequency
    ELSE '1_week'
  END,
  anniversary_notification_frequency = CASE 
    WHEN anniversary_notification_frequency = 'daily' THEN '1_day'
    WHEN anniversary_notification_frequency = 'weekly' THEN '1_week'
    WHEN anniversary_notification_frequency = 'monthly' THEN '1_month' 
    WHEN anniversary_notification_frequency = 'none' THEN 'none'
    WHEN anniversary_notification_frequency IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none') THEN anniversary_notification_frequency
    ELSE '1_week'
  END
WHERE 
  birthday_notification_frequency NOT IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none')
  OR anniversary_notification_frequency NOT IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', 'none')
  OR birthday_notification_frequency IS NULL
  OR anniversary_notification_frequency IS NULL;
