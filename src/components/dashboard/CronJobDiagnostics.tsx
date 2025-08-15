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
      console.log('=== RUNNING COMPREHENSIVE CRON JOB DIAGNOSTICS ===');
      
      // Use the new comprehensive diagnostic function
      const { data: diagnosticData, error: diagnosticError } = await supabase.functions.invoke('cron-job-diagnostics', {
        body: {}
      });

      if (diagnosticError) {
        console.error('Diagnostic function error:', diagnosticError);
        throw new Error(`Diagnostic function failed: ${diagnosticError.message}`);
      }

      console.log('=== COMPREHENSIVE DIAGNOSTIC RESULTS ===');
      console.log('Diagnostic Results:', diagnosticData);

      setDiagnostics(diagnosticData);
      
      toast({
        title: "Diagnostics Complete!",
        description: `Found ${diagnosticData?.diagnostics?.relationships?.count || 0} relationships with reminders enabled.`,
      });

    } catch (err: any) {
      console.error('Diagnostics error:', err);
      setDiagnostics({ error: err.message });
      toast({
        title: "Diagnostics Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runSetupFunction = async () => {
    try {
      const { data, error } = await supabase.rpc('setup_reminder_cron');
      
      if (error) {
        toast({
          title: "Setup Failed",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Setup Successful",
          description: data,
        });
      }
    } catch (err: any) {
      toast({
        title: "Setup Failed",
        description: `Exception: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  const testBirthdayFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true, test: true }
      });

      if (error) {
        toast({
          title: "Test Failed",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Test Successful",
          description: `Found ${data?.debugInfo?.length || 0} relationships to check.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Test Failed",
        description: `Exception: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🔧 Cron Job Diagnostics</CardTitle>
        <CardDescription>
          Comprehensive diagnostics for birthday and anniversary reminder cron jobs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Running...' : '🔍 Run Full Diagnostics'}
          </Button>
          
          <Button 
            onClick={runSetupFunction} 
            variant="outline"
            className="border-orange-500 text-orange-700 hover:bg-orange-50"
          >
            ⚙️ Setup Cron Jobs
          </Button>
          
          <Button 
            onClick={testBirthdayFunction} 
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50"
          >
            🧪 Test Birthday Function
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📊 Diagnostic Results</h3>
            
            {/* Environment Check */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Environment</h4>
              <div className="text-sm space-y-1">
                <div>✅ Supabase URL: {diagnostics.diagnostics?.environment?.hasSupabaseUrl ? 'Configured' : 'Missing'}</div>
                <div>✅ Service Key: {diagnostics.diagnostics?.environment?.hasServiceKey ? 'Configured' : 'Missing'}</div>
              </div>
            </div>

            {/* Cron Jobs Status */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Cron Jobs Status</h4>
              {diagnostics.diagnostics?.cronJobs?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.cronJobs.error}</div>
              ) : diagnostics.diagnostics?.cronJobs?.length > 0 ? (
                <div className="text-sm space-y-1">
                  {diagnostics.diagnostics.cronJobs.map((job: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>{job.jobname}</span>
                      <span className="text-gray-500">({job.schedule})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-600 text-sm">⚠️ No active cron jobs found</div>
              )}
            </div>

            {/* Setup Function */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium mb-2">Setup Function</h4>
              {diagnostics.diagnostics?.setupFunction?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.setupFunction.error}</div>
              ) : (
                <div className="text-green-600 text-sm">✅ Working: {diagnostics.diagnostics.setupFunction.result}</div>
              )}
            </div>

            {/* Birthday Function */}
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Birthday Reminders Function</h4>
              {diagnostics.diagnostics?.birthdayFunction?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.birthdayFunction.error}</div>
              ) : (
                <div className="text-green-600 text-sm">
                  ✅ Working: Found {diagnostics.diagnostics.birthdayFunction.relationshipsFound} relationships
                </div>
              )}
            </div>

            {/* Date Ideas Function */}
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Date Ideas Function</h4>
              {diagnostics.diagnostics?.dateIdeasFunction?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.dateIdeasFunction.error}</div>
              ) : (
                <div className="text-green-600 text-sm">✅ Working</div>
              )}
            </div>

            {/* Extensions */}
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium mb-2">Database Extensions</h4>
              {diagnostics.diagnostics?.extensions?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.extensions.error}</div>
              ) : (
                <div className="text-sm space-y-1">
                  {diagnostics.diagnostics.extensions?.map((ext: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>{ext.extname}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Relationships */}
            <div className="p-3 bg-indigo-50 rounded-lg">
              <h4 className="font-medium mb-2">Relationships with Reminders</h4>
              {diagnostics.diagnostics?.relationships?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.relationships.error}</div>
              ) : (
                <div className="text-sm">
                  <div className="mb-2">📊 Total: {diagnostics.diagnostics.relationships.count} relationships</div>
                  {diagnostics.diagnostics.relationships.count > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer hover:text-blue-600">View Details</summary>
                      <div className="mt-2 space-y-1">
                        {diagnostics.diagnostics.relationships.data.map((rel: any, index: number) => (
                          <div key={index} className="pl-4 border-l-2 border-gray-300">
                            <div><strong>{rel.name}</strong></div>
                            <div className="text-gray-600">
                              Birthday: {rel.birthday || 'None'} ({rel.birthday_notification_frequency || 'none'})
                            </div>
                            <div className="text-gray-600">
                              Anniversary: {rel.anniversary || 'None'} ({rel.anniversary_notification_frequency || 'none'})
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Recent Logs */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Recent Reminder Logs</h4>
              {diagnostics.diagnostics?.recentLogs?.error ? (
                <div className="text-red-600 text-sm">❌ Error: {diagnostics.diagnostics.recentLogs.error}</div>
              ) : (
                <div className="text-sm">
                  <div className="mb-2">📝 Last 7 days: {diagnostics.diagnostics.recentLogs.count} reminders sent</div>
                  {diagnostics.diagnostics.recentLogs.count > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer hover:text-blue-600">View Details</summary>
                      <div className="mt-2 space-y-1">
                        {diagnostics.diagnostics.recentLogs.data.map((log: any, index: number) => (
                          <div key={index} className="pl-4 border-l-2 border-gray-300">
                            <div><strong>{log.reminder_type}</strong> - {new Date(log.sent_at).toLocaleDateString()}</div>
                            <div className="text-gray-600">Event: {log.event_date}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Troubleshooting Steps */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-900">💡 Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                <li><strong>Check Cron Jobs:</strong> Ensure cron jobs are active and scheduled correctly</li>
                <li><strong>Verify Extensions:</strong> pg_cron and http extensions must be enabled</li>
                <li><strong>Test Functions:</strong> Birthday and date ideas functions should work manually</li>
                <li><strong>Check Relationships:</strong> Verify relationships have reminder frequencies set</li>
                <li><strong>Review Logs:</strong> Check for recent reminder activity</li>
                <li><strong>Environment Variables:</strong> Ensure all required env vars are set</li>
              </ol>
            </div>

            {/* Common Issues */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold mb-2 text-red-900">🚨 Common Issues:</h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li><strong>Missing Extensions:</strong> pg_cron or http extensions not enabled</li>
                <li><strong>Function Errors:</strong> Edge functions failing due to missing env vars</li>
                <li><strong>No Relationships:</strong> No relationships configured with reminder frequencies</li>
                <li><strong>Cron Job Inactive:</strong> Cron jobs not scheduled or disabled</li>
                <li><strong>Database Permissions:</strong> Service role key doesn't have required permissions</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
