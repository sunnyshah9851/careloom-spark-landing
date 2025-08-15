import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DebugCronPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('cron-job-diagnostics', {
        body: {}
      });

      if (error) {
        throw new Error(`Diagnostic function failed: ${error.message}`);
      }

      setResults(data);
      toast({
        title: "Diagnostics Complete!",
        description: "Check the results below to identify the issue.",
      });

    } catch (err: any) {
      console.error('Diagnostics error:', err);
      setResults({ error: err.message });
      toast({
        title: "Diagnostics Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testBirthdayFunction = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true, test: true, forceSend: true }
      });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      setResults({ birthdayTest: data });
      toast({
        title: "Birthday Function Test Complete!",
        description: `Found ${data?.debugInfo?.length || 0} relationships to check.`,
      });

    } catch (err: any) {
      console.error('Test error:', err);
      setResults({ error: err.message });
      toast({
        title: "Test Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDateIdeasFunction = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-date-ideas', {
        body: { scheduled: true, test: true }
      });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      setResults({ dateIdeasTest: data });
      toast({
        title: "Date Ideas Function Test Complete!",
        description: "Function executed successfully.",
      });

    } catch (err: any) {
      console.error('Test error:', err);
      setResults({ error: err.message });
      toast({
        title: "Test Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDateLogic = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { testDateLogic: true }
      });

      if (error) {
        throw new Error(`Date logic test failed: ${error.message}`);
      }

      setResults({ dateLogicTest: data });
      toast({
        title: "Date Logic Test Complete!",
        description: `Tested ${data?.testResults?.length || 0} date scenarios.`,
      });

    } catch (err: any) {
      console.error('Date logic test error:', err);
      setResults({ error: err.message });
      toast({
        title: "Date Logic Test Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupCronJobs = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('setup_reminder_cron');
      
      if (error) {
        throw new Error(`Setup failed: ${error.message}`);
      }

      toast({
        title: "Cron Jobs Setup Complete!",
        description: data,
      });

      setTimeout(() => runDiagnostics(), 1000);

    } catch (err: any) {
      console.error('Setup error:', err);
      toast({
        title: "Setup Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true, test: true, forceSend: true, testEmail }
      });

      if (error) {
        throw new Error(`Test email failed: ${error.message}`);
      }

      toast({
        title: "Test Email Sent!",
        description: "Check the email address for the test reminder.",
      });

    } catch (err: any) {
      console.error('Test email error:', err);
      toast({
        title: "Test Email Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Cron Job Debug Page</h1>
        <p className="text-gray-600">
          Debug and test birthday/anniversary reminder cron jobs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 Control Panel</CardTitle>
            <CardDescription>
              Test and configure cron jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Running...' : '🔍 Run Full Diagnostics'}
            </Button>
            
            <Button 
              onClick={setupCronJobs} 
              disabled={isLoading}
              variant="outline"
              className="w-full border-orange-500 text-orange-700 hover:bg-orange-50"
            >
              ⚙️ Setup/Reset Cron Jobs
            </Button>
            
            <Button 
              onClick={testBirthdayFunction} 
              disabled={isLoading}
              variant="outline"
              className="w-full border-green-500 text-green-700 hover:bg-green-50"
            >
              🧪 Test Birthday Function
            </Button>
            
            <Button 
              onClick={testDateIdeasFunction} 
              disabled={isLoading}
              variant="outline"
              className="w-full border-purple-500 text-purple-700 hover:bg-purple-50"
            >
              🧪 Test Date Ideas Function
            </Button>

            <Button 
              onClick={testDateLogic} 
              disabled={isLoading}
              variant="outline"
              className="w-full border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              📅 Test Date Logic
            </Button>

            <div className="pt-4 border-t">
              <Label htmlFor="testEmail" className="text-sm font-medium">
                Test Email Address
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button 
                  onClick={sendTestEmail}
                  disabled={isLoading || !testEmail}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  📧 Send Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Results</CardTitle>
            <CardDescription>
              Diagnostic and test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results && (
              <div className="space-y-4">
                {results.error && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">❌ Error</h4>
                    <div className="text-sm text-red-800">{results.error}</div>
                  </div>
                )}

                {results.diagnostics && (
                  <div className="space-y-3">
                    <h4 className="font-medium">🔍 Diagnostic Results</h4>
                    
                    {/* Environment */}
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium mb-1">Environment:</div>
                      <div>✅ Supabase URL: {results.diagnostics.environment?.hasSupabaseUrl ? 'Configured' : 'Missing'}</div>
                      <div>✅ Service Key: {results.diagnostics.environment?.hasServiceKey ? 'Configured' : 'Missing'}</div>
                    </div>

                    {/* Cron Jobs */}
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium mb-1">Cron Jobs:</div>
                      {results.diagnostics.cronJobs?.error ? (
                        <div className="text-red-600">❌ {results.diagnostics.cronJobs.error}</div>
                      ) : results.diagnostics.cronJobs?.length > 0 ? (
                        <div>
                          {results.diagnostics.cronJobs.map((job: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>{job.jobname}</span>
                              <span className="text-gray-500">({job.schedule})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-yellow-600">⚠️ No active cron jobs</div>
                      )}
                    </div>

                    {/* Functions */}
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <div className="font-medium mb-1">Functions:</div>
                      <div>Birthday: {results.diagnostics.birthdayFunction?.error ? '❌' : '✅'} {results.diagnostics.birthdayFunction?.error || 'Working'}</div>
                      <div>Date Ideas: {results.diagnostics.dateIdeasFunction?.error ? '❌' : '✅'} {results.diagnostics.dateIdeasFunction?.error || 'Working'}</div>
                    </div>

                    {/* Relationships */}
                    <div className="p-2 bg-indigo-50 rounded text-sm">
                      <div className="font-medium mb-1">Relationships:</div>
                      <div>Total: {results.diagnostics.relationships?.count || 0}</div>
                    </div>
                  </div>
                )}

                {results.birthdayTest && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">🧪 Birthday Function Test</h4>
                    <div className="text-sm text-green-800">
                      Found {results.birthdayTest.debugInfo?.length || 0} relationships to check
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-green-700">View Details</summary>
                      <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(results.birthdayTest, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {results.dateIdeasTest && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">🧪 Date Ideas Function Test</h4>
                    <div className="text-sm text-purple-800">
                      Function executed successfully
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-purple-700">View Details</summary>
                      <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(results.dateIdeasTest, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {results.dateLogicTest && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">📅 Date Logic Test</h4>
                    <div className="text-sm text-blue-800">
                      Tested {results.dateLogicTest.testResults?.length || 0} date scenarios
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-blue-700">View Date Logic Results</summary>
                      <div className="mt-2 space-y-2">
                        {results.dateLogicTest.testResults?.map((test: any, index: number) => (
                          <div key={index} className="text-xs bg-white p-2 rounded border">
                            <div className="font-medium">
                              {test.date} ({test.frequency})
                            </div>
                            <div className={`text-xs ${test.shouldSend ? 'text-green-600' : 'text-red-600'}`}>
                              Should Send: {test.shouldSend ? '✅ YES' : '❌ NO'}
                            </div>
                            <div className="text-gray-500">Today: {test.today}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                {/* Raw Data */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    View Raw Data
                  </summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {!results && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🔍</div>
                <div>Run diagnostics to see results</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 