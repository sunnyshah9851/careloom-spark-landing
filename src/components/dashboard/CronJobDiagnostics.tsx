
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CronJobDiagnostics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsLoading(true);
    setDiagnostics(null);
    
    try {
      console.log('=== RUNNING CRON JOB DIAGNOSTICS ===');
      
      // Check if cron jobs exist and their status
      const { data: cronJobs, error: cronError } = await supabase
        .rpc('sql', {
          query: `
            SELECT 
              jobname, 
              schedule, 
              command, 
              active,
              created_at,
              updated_at
            FROM cron.job 
            WHERE jobname IN ('daily-birthday-reminders', 'daily-date-ideas');
          `
        });

      if (cronError) {
        console.error('Error checking cron jobs:', cronError);
        throw new Error(`Cron job check failed: ${cronError.message}`);
      }

      // Check cron job history/logs
      const { data: cronHistory, error: historyError } = await supabase
        .rpc('sql', {
          query: `
            SELECT 
              jobid,
              runid,
              job_pid,
              database,
              username,
              command,
              status,
              return_message,
              start_time,
              end_time
            FROM cron.job_run_details 
            WHERE command LIKE '%send-birthday-reminders%' OR command LIKE '%send-date-ideas%'
            ORDER BY start_time DESC 
            LIMIT 20;
          `
        });

      if (historyError) {
        console.error('Error checking cron history:', historyError);
        // Don't throw here, as this might not be available in all Supabase tiers
      }

      // Check if extensions are enabled
      const { data: extensions, error: extError } = await supabase
        .rpc('sql', {
          query: `
            SELECT extname, extversion 
            FROM pg_extension 
            WHERE extname IN ('pg_cron', 'pg_net', 'http');
          `
        });

      if (extError) {
        console.error('Error checking extensions:', extError);
        throw new Error(`Extension check failed: ${extError.message}`);
      }

      const diagnosticResults = {
        cronJobs: cronJobs || [],
        cronHistory: cronHistory || [],
        extensions: extensions || [],
        timestamp: new Date().toISOString()
      };

      console.log('=== DIAGNOSTIC RESULTS ===');
      console.log('Cron Jobs:', cronJobs);
      console.log('Cron History:', cronHistory);
      console.log('Extensions:', extensions);

      setDiagnostics(diagnosticResults);

      const activeJobs = cronJobs?.filter(job => job.active) || [];
      toast({
        title: "Diagnostics Complete",
        description: `Found ${cronJobs?.length || 0} scheduled jobs, ${activeJobs.length} active. ${extensions?.length || 0} extensions enabled.`,
      });

    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setDiagnostics({ error: err.message });
      toast({
        title: "Diagnostic Failed",
        description: `Could not run diagnostics: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recreateCronJobs = async () => {
    try {
      console.log('=== RECREATING CRON JOBS ===');
      
      const { data, error } = await supabase.rpc('setup_reminder_cron');
      
      if (error) {
        throw error;
      }

      console.log('Cron jobs recreated:', data);
      toast({
        title: "Success",
        description: "Cron jobs have been recreated successfully!",
      });

      // Refresh diagnostics
      setTimeout(() => runDiagnostics(), 1000);
      
    } catch (err: any) {
      console.error('Error recreating cron jobs:', err);
      toast({
        title: "Error",
        description: `Failed to recreate cron jobs: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>🔧 Cron Job Diagnostics</CardTitle>
        <CardDescription>
          Diagnose why your automated birthday reminders and date ideas aren't running
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Diagnostics...' : '🔍 Run Cron Diagnostics'}
          </Button>
          
          <Button 
            onClick={recreateCronJobs}
            variant="outline"
            className="w-full"
          >
            🔄 Recreate Cron Jobs
          </Button>
        </div>
        
        {diagnostics && (
          <div className="mt-6 space-y-6">
            {/* System Status */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-900">📊 System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {diagnostics.extensions?.length || 0}
                  </div>
                  <div className="text-blue-800">Extensions Enabled</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {diagnostics.extensions?.map((ext: any) => ext.extname).join(', ') || 'None'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {diagnostics.cronJobs?.length || 0}
                  </div>
                  <div className="text-green-800">Scheduled Jobs</div>
                </div>
                <div className="text-center p-3 bg-white rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {diagnostics.cronJobs?.filter((job: any) => job.active).length || 0}
                  </div>
                  <div className="text-purple-800">Active Jobs</div>
                </div>
              </div>
            </div>

            {/* Cron Jobs Details */}
            {diagnostics.cronJobs && diagnostics.cronJobs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">📅 Scheduled Cron Jobs:</h3>
                {diagnostics.cronJobs.map((job: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      job.active 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.jobname}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <div><strong>Schedule:</strong> {job.schedule}</div>
                          <div><strong>Created:</strong> {job.created_at}</div>
                          <div className="mt-2"><strong>Command:</strong></div>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {job.command}
                          </pre>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.active ? '✅ ACTIVE' : '❌ INACTIVE'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cron History */}
            {diagnostics.cronHistory && diagnostics.cronHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">📜 Recent Cron Executions:</h3>
                {diagnostics.cronHistory.slice(0, 5).map((run: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-l-4 ${
                      run.status === 'succeeded' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span><strong>Started:</strong> {run.start_time}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          run.status === 'succeeded' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                      {run.return_message && (
                        <div className="mt-2">
                          <strong>Result:</strong> {run.return_message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {diagnostics.error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold mb-2 text-red-900">❌ Diagnostic Error:</h3>
                <div className="text-sm text-red-800">
                  {diagnostics.error}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-900">💡 Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                <li>Check if pg_cron and net extensions are enabled</li>
                <li>Verify cron jobs are active and have correct schedules</li>
                <li>Ensure your Supabase project tier supports cron jobs</li>
                <li>Check if there are any execution errors in the history</li>
                <li>Try recreating the cron jobs if they appear inactive</li>
                <li>Contact Supabase support if cron jobs are not available in your tier</li>
              </ol>
            </div>

            {/* Raw Data */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🔍 Raw Diagnostic Data:</h3>
              <pre className="text-sm overflow-auto whitespace-pre-wrap max-h-64">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
