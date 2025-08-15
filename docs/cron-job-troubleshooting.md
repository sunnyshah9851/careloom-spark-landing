# Birthday & Anniversary Reminder Cron Job Troubleshooting Guide

## Problem Description
Birthday and anniversary reminders are not being sent automatically via the scheduled cron jobs, even though the functions work when tested manually.

## Current Setup
- **Cron Job Schedule**: Daily at 9:00 AM UTC (`0 9 * * *`)
- **Function**: `send-birthday-reminders` edge function
- **Database**: Supabase with pg_cron extension
- **HTTP Method**: Uses `http_post` function for cron job calls

## Diagnostic Steps

### 1. Check Cron Job Status
Run this SQL in your Supabase SQL editor:

```sql
-- Check active cron jobs
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  last_run,
  next_run
FROM cron.job 
WHERE active = true;

-- Check recent run history
SELECT 
  jobid,
  run_status,
  run_start,
  run_end,
  run_return_message
FROM cron.job_run_details 
ORDER BY run_start DESC 
LIMIT 10;
```

### 2. Verify Extensions
Ensure required extensions are enabled:

```sql
-- Check pg_cron extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_cron';

-- Check http extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'http';
```

### 3. Test Edge Function Manually
Test if the function works when called directly:

```typescript
// In your frontend or via Supabase dashboard
const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
  body: { debug: true, test: true }
});
```

### 4. Check Environment Variables
Verify the edge function has all required environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### 5. Check Relationships Data
Ensure there are relationships with reminder frequencies set:

```sql
SELECT 
  COUNT(*) as total_relationships,
  COUNT(CASE WHEN birthday_notification_frequency != 'none' THEN 1 END) as birthday_reminders_enabled,
  COUNT(CASE WHEN anniversary_notification_frequency != 'none' THEN 1 END) as anniversary_reminders_enabled
FROM relationships r
JOIN profiles p ON r.profile_id = p.id
WHERE p.email IS NOT NULL;
```

## Common Issues & Solutions

### Issue 1: Cron Jobs Not Running
**Symptoms**: No cron jobs listed in `cron.job` table
**Solution**: 
```sql
-- Recreate the cron jobs
SELECT setup_reminder_cron();
```

### Issue 2: Function Failing
**Symptoms**: Cron jobs running but functions failing
**Solution**: Check edge function logs in Supabase dashboard

### Issue 3: No Relationships Found
**Symptoms**: Function runs but finds no relationships to process
**Solution**: Verify relationships have reminder frequencies set and profiles have emails

### Issue 4: HTTP Function Errors
**Symptoms**: Cron job fails with HTTP function errors
**Solution**: Ensure `http` extension is enabled and working

### Issue 5: Permission Issues
**Symptoms**: Function fails due to database permission errors
**Solution**: Verify service role key has required permissions

## Manual Testing

### Test Birthday Function
```typescript
// Test with debug mode
const result = await supabase.functions.invoke('send-birthday-reminders', {
  body: { 
    debug: true, 
    test: true,
    forceSend: true  // Force send regardless of date
  }
});
```

### Test Date Ideas Function
```typescript
const result = await supabase.functions.invoke('send-date-ideas', {
  body: { 
    scheduled: true, 
    test: true 
  }
});
```

## Debugging Tools

### 1. Use the Diagnostic Component
The `CronJobDiagnostics` component provides comprehensive diagnostics:
- Cron job status
- Function health checks
- Database extension status
- Relationship data analysis
- Recent reminder logs

### 2. Check Edge Function Logs
In Supabase dashboard:
1. Go to Edge Functions
2. Select `send-birthday-reminders`
3. Check Logs tab for execution details

### 3. Monitor Cron Job Execution
```sql
-- Watch cron job execution in real-time
SELECT 
  jobid,
  run_status,
  run_start,
  run_end,
  run_return_message
FROM cron.job_run_details 
WHERE run_start >= NOW() - INTERVAL '1 hour'
ORDER BY run_start DESC;
```

## Fixing the Cron Jobs

### Step 1: Reset Cron Jobs
```sql
-- Drop existing jobs
SELECT cron.unschedule('daily-birthday-reminders');
SELECT cron.unschedule('daily-date-ideas');

-- Recreate jobs
SELECT setup_reminder_cron();
```

### Step 2: Verify Job Creation
```sql
-- Check if jobs were created
SELECT * FROM cron.job WHERE active = true;
```

### Step 3: Test Manual Execution
```sql
-- Test the cron job command manually
SELECT http_post(
  'https://your-project.supabase.co/functions/v1/send-birthday-reminders',
  '{"scheduled": true}',
  'application/json'
);
```

## Expected Behavior

### When Working Correctly:
1. **9:00 AM UTC Daily**: Birthday reminders function executes
2. **10:00 AM UTC Daily**: Date ideas function executes
3. **Logs**: Functions create entries in `reminder_logs` table
4. **Emails**: Users receive birthday/anniversary reminders

### Debug Output:
Functions should log:
- Number of relationships found
- Which reminders should be sent
- Email sending results
- Any errors encountered

## Next Steps

1. **Run Diagnostics**: Use the diagnostic component to identify the specific issue
2. **Check Logs**: Review edge function logs for error details
3. **Verify Data**: Ensure relationships and profiles are properly configured
4. **Test Functions**: Verify functions work when called manually
5. **Monitor Execution**: Watch cron job execution over the next few days

## Support

If issues persist after following this guide:
1. Check Supabase status page for service issues
2. Review edge function logs for specific error messages
3. Verify all environment variables are correctly set
4. Test with a simple cron job to isolate the issue 