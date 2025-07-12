import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const EmailNotificationTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const testEmailNotifications = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('=== TESTING EMAIL NOTIFICATIONS ===');
      
      // First, check if user has relationships with birthdays/anniversaries
      const { data: relationships, error: relationshipsError } = await supabase
        .from('relationships')
        .select(`
          id,
          name,
          birthday,
          anniversary,
          birthday_notification_frequency,
          anniversary_notification_frequency,
          email,
          profiles!inner(email, full_name)
        `)
        .eq('profile_id', user?.id);

      if (relationshipsError) {
        throw new Error(`Failed to fetch relationships: ${relationshipsError.message}`);
      }

      console.log('Found relationships:', relationships);

      // Test the birthday reminder function with debug mode
      const { data: birthdayResult, error: birthdayError } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true, test: true }
      });

      console.log('Birthday function result:', { data: birthdayResult, error: birthdayError });

      // Test manually calling the function for immediate sending
      const { data: manualResult, error: manualError } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { scheduled: true, force: true }
      });

      console.log('Manual function result:', { data: manualResult, error: manualError });

      const results = {
        relationshipsCount: relationships?.length || 0,
        relationships: relationships,
        birthdayFunctionTest: {
          success: !birthdayError,
          data: birthdayResult,
          error: birthdayError
        },
        manualTest: {
          success: !manualError,
          data: manualResult,
          error: manualError
        },
        timestamp: new Date().toISOString()
      };

      setTestResults(results);

      toast({
        title: "Email Test Complete",
        description: `Found ${relationships?.length || 0} relationships. Check results below.`,
      });

    } catch (err: any) {
      console.error('Email test error:', err);
      setTestResults({ error: err.message });
      toast({
        title: "Email Test Failed",
        description: `Could not test email notifications: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>📧 Email Notification Tester</CardTitle>
        <CardDescription>
          Test your birthday and anniversary email notifications to diagnose delivery issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testEmailNotifications} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing Email Notifications...' : '🧪 Test Email Notifications'}
        </Button>
        
        {testResults && (
          <div className="mt-6 space-y-4">
            {testResults.error ? (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold mb-2 text-red-900">❌ Test Error:</h3>
                <div className="text-sm text-red-800">{testResults.error}</div>
              </div>
            ) : (
              <>
                {/* Relationships Found */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-900">
                    📊 Your Relationships ({testResults.relationshipsCount})
                  </h3>
                  {testResults.relationshipsCount === 0 ? (
                    <div className="text-sm text-red-600">
                      ⚠️ No relationships found with birthdays or anniversaries. Add some relationships first!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {testResults.relationships?.map((rel: any) => (
                        <div key={rel.id} className="text-sm bg-white p-2 rounded border">
                          <div><strong>{rel.name}</strong></div>
                          {rel.birthday && (
                            <div>🎂 Birthday: {rel.birthday} (notify: {rel.birthday_notification_frequency})</div>
                          )}
                          {rel.anniversary && (
                            <div>💕 Anniversary: {rel.anniversary} (notify: {rel.anniversary_notification_frequency})</div>
                          )}
                          <div>📧 Email: {rel.profiles.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Function Test Results */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">🧪 Function Test Results:</h3>
                  
                  <div className={`p-4 rounded-lg border-l-4 ${
                    testResults.birthdayFunctionTest.success 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Debug Mode Test</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                            {JSON.stringify(testResults.birthdayFunctionTest, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        testResults.birthdayFunctionTest.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResults.birthdayFunctionTest.success ? '✅ SUCCESS' : '❌ ERROR'}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-l-4 ${
                    testResults.manualTest.success 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Manual Trigger Test</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                            {JSON.stringify(testResults.manualTest, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        testResults.manualTest.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResults.manualTest.success ? '✅ SUCCESS' : '❌ ERROR'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting Tips */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold mb-2 text-yellow-900">💡 Troubleshooting Tips:</h3>
                  <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                    <li>Check your spam/junk folder for emails from the system</li>
                    <li>Make sure your notification frequencies aren't set to 'none'</li>
                    <li>Verify that upcoming birthdays/anniversaries are within your notification window</li>
                    <li>Check that the cron job is properly scheduled (runs at 9:00 AM UTC daily)</li>
                    <li>Ensure your Resend API key is configured correctly</li>
                    <li>Make sure your email domain is verified in Resend</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};