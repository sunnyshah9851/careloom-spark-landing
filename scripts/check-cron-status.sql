-- Check current cron job status
-- Run this in your Supabase SQL editor to diagnose cron job issues

-- 1. Check if pg_cron extension is enabled
SELECT 
  extname,
  extversion,
  extrelocatable
FROM pg_extension 
WHERE extname = 'pg_cron';

-- 2. Check current active cron jobs
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  last_run,
  next_run,
  command
FROM cron.job 
WHERE active = true
ORDER BY jobname;

-- 3. Check cron job run history (last 10 runs)
SELECT 
  jobid,
  job_pid,
  runid,
  job_runid,
  run_status,
  run_start,
  run_end,
  run_duration,
  run_return_message
FROM cron.job_run_details 
ORDER BY run_start DESC 
LIMIT 10;

-- 4. Check if the setup function exists
SELECT 
  proname,
  prosrc,
  proconfig
FROM pg_proc 
WHERE proname = 'setup_reminder_cron';

-- 5. Check if http extension is available
SELECT 
  extname,
  extversion
FROM pg_extension 
WHERE extname IN ('http', 'net');

-- 6. Check for any cron job errors
SELECT 
  jobid,
  job_pid,
  runid,
  job_runid,
  run_status,
  run_start,
  run_end,
  run_return_message
FROM cron.job_run_details 
WHERE run_status = 'failed'
ORDER BY run_start DESC 
LIMIT 5;

-- 7. Check if there are any relationships with reminders enabled
SELECT 
  COUNT(*) as total_relationships,
  COUNT(CASE WHEN birthday_notification_frequency != 'none' THEN 1 END) as birthday_reminders_enabled,
  COUNT(CASE WHEN anniversary_notification_frequency != 'none' THEN 1 END) as anniversary_reminders_enabled
FROM relationships r
JOIN profiles p ON r.profile_id = p.id
WHERE p.email IS NOT NULL;

-- 8. Check recent reminder logs
SELECT 
  COUNT(*) as recent_reminders,
  MIN(sent_at) as earliest_recent,
  MAX(sent_at) as latest_recent
FROM reminder_logs 
WHERE sent_at >= NOW() - INTERVAL '7 days';

-- 9. Test the setup function manually
-- SELECT setup_reminder_cron();

-- 10. Check cron job permissions
SELECT 
  schemaname,
  tablename,
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'job' 
AND table_schema = 'cron'; 