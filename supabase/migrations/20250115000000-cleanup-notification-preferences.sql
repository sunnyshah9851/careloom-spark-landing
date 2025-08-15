-- Clean up redundant notification preferences table
-- The system now uses notification frequencies directly on relationships table

-- Drop the notification_preferences table and related functions/triggers
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

-- Drop the function that was creating default notification preferences
DROP FUNCTION IF EXISTS public.handle_new_user_notification_preferences() CASCADE;

-- Drop the function that was updating timestamps
DROP FUNCTION IF EXISTS public.update_notification_preferences_updated_at() CASCADE;

-- The notification system now works directly with:
-- 1. relationships.birthday_notification_frequency (1_day, 3_days, 1_week, 2_weeks, 1_month, none)
-- 2. relationships.anniversary_notification_frequency (1_day, 3_days, 1_week, 2_weeks, 1_month, none)
-- 3. relationships.date_ideas_frequency (daily, weekly, biweekly, monthly, never)
-- 4. profiles.nudge_frequency (daily, weekly, monthly, never)

-- This simplifies the system and removes the need for a separate preferences table 