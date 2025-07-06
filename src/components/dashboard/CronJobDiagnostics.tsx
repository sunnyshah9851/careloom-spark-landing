
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
      
      // Since we can't directly query cron tables, let's check if setup function works
      const { data: setupResult, error: setupError } = await supabase.rpc('setup_reminder_cron');
      
      if (setupError) {
        console.error('Error calling setup function:', setupError);
        throw new Error(`Setup function failed: ${setupError.message}`);
      }

      // Test calling the actual functions to see if they work
      const birthdayTest = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true, test: true }
      });

      const dateIdeasTest = await supabase.functions.invoke('send-date-ideas', {
        body: { scheduled: true, test: true }
      });

      const diagnosticResults = {
        setupResult,
        birthdayFunctionWorking: !birthdayTest.error,
        birthdayTestData: birthdayTest.data || birthdayTest.error,
        dateIdeasFunctionWorking: !dateIdeasTest.error,
        dateIdeasTestData: dateIdeasTest.data || dateIdeasTest.error,
        timestamp: new Date().toISOString()
      };

      console.log('=== DIAGNOSTIC RESULTS ===');
      console.log('Setup Result:', setupResult);
      console.log('Birthday Function Test:', birthdayTest);
      console.log('Date Ideas Function Test:', dateIdeasTest);

      setDiagnostics(diagnosticResults);

      toast({
        title: "Diagnostics Complete",
        description: `Setup function result: ${setupResult}. Functions tested.`,
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {diagnostics.birthdayFunctionWorking ? '✅' : '❌'}
                  </div>
                  <div className="text-green-800">Birthday Function</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {diagnostics.birthdayFunctionWorking ? 'Working' : 'Error'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {diagnostics.dateIdeasFunctionWorking ? '✅' : '❌'}
                  </div>
                  <div className="text-purple-800">Date Ideas Function</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {diagnostics.dateIdeasFunctionWorking ? 'Working' : 'Error'}
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Result */}
            {diagnostics.setupResult && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-2 text-green-900">✅ Setup Function Result:</h3>
                <div className="text-sm text-green-800">
                  {diagnostics.setupResult}
                </div>
              </div>
            )}

            {/* Function Test Results */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">🧪 Function Test Results:</h3>
              
              <div className={`p-4 rounded-lg border-l-4 ${
                diagnostics.birthdayFunctionWorking 
                  ? 'bg-green-50 border-green-400' 
                  : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Birthday Reminders Function</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(diagnostics.birthdayTestData, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    diagnostics.birthdayFunctionWorking 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {diagnostics.birthdayFunctionWorking ? '✅ WORKING' : '❌ ERROR'}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-l-4 ${
                diagnostics.dateIdeasFunctionWorking 
                  ? 'bg-green-50 border-green-400' 
                  : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Date Ideas Function</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(diagnostics.dateIdeasTestData, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    diagnostics.dateIdeasFunctionWorking 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {diagnostics.dateIdeasFunctionWorking ? '✅ WORKING' : '❌ ERROR'}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {diagnostics.error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold mb-2 text-red-900">❌ Diagnostic Error:</h3>
                <div className="text-sm text-red-800">
                  {diagnostics.error}
                </div>
              </div>
            )}

            {/* Troubleshooting Steps */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-900">💡 Why Cron Jobs May Not Be Running:</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                <li><strong>Supabase Tier Limitation:</strong> Free tier may not support pg_cron extension</li>
                <li><strong>Extension Not Enabled:</strong> pg_cron and net extensions need to be enabled</li>
                <li><strong>Job Not Scheduled:</strong> The setup function may not have created the scheduled jobs</li>
                <li><strong>Authentication Issues:</strong> Service role key may be incorrect in cron job</li>
                <li><strong>URL Issues:</strong> The function URLs in the cron job may be wrong</li>
                <li><strong>Manual Testing Works:</strong> If manual tests work but cron doesn't, it's likely a scheduling issue</li>
              </ol>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">🚀 Next Steps:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Check your Supabase project settings to see if pg_cron is available</li>
                <li>Consider upgrading to a paid Supabase tier if you're on the free tier</li>
                <li>Contact Supabase support to confirm cron job availability</li>
                <li>For now, you can manually trigger emails using the test page</li>
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
