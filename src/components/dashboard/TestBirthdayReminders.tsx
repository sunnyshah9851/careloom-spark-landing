
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TestBirthdayReminders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isForceSending, setIsForceSending] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testReminders = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log('=== DEBUGGING EMAIL SYSTEM ===');
      console.log('Calling send-birthday-reminders function with debug mode...');
      
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true }
      });
      
      if (error) {
        console.error('Error calling debug function:', error);
        setResults({ error: error.message, fullError: error });
        toast({
          title: "Error",
          description: `Debug test failed: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('=== DEBUG RESULTS ===');
        console.log('Raw response:', data);
        console.log('Relationships found:', data.debugInfo?.length || 0);
        console.log('Should send today:', data.debugInfo?.filter((r: any) => r.shouldSend)?.length || 0);
        
        setResults(data);
        toast({
          title: "Debug Complete",
          description: `Found ${data.debugInfo?.length || 0} relationships to check. ${data.debugInfo?.filter((r: any) => r.shouldSend)?.length || 0} should send today.`,
        });
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setResults({ error: err.message, stack: err.stack });
      toast({
        title: "Error",
        description: `Unexpected error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceSendEmails = async () => {
    if (!results?.debugInfo) {
      toast({
        title: "No Debug Data",
        description: "Please run the debug test first to see which emails should be sent.",
        variant: "destructive"
      });
      return;
    }

    const shouldSendToday = results.debugInfo.filter((rel: any) => rel.shouldSend);
    
    if (shouldSendToday.length === 0) {
      toast({
        title: "No Emails to Send",
        description: "No relationships have reminders due today based on the debug results.",
      });
      return;
    }

    setIsForceSending(true);
    try {
      console.log('=== FORCE SENDING EMAILS ===');
      console.log('Force sending emails for relationships that should send today...');
      console.log('Relationships to send:', shouldSendToday.map((rel: any) => rel.name));
      
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { 
          forceSend: true,
          relationships: shouldSendToday.map((rel: any) => rel.name)
        }
      });
      
      if (error) {
        console.error('Error force sending emails:', error);
        toast({
          title: "Error",
          description: `Failed to force send emails: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('=== FORCE SEND RESULTS ===');
        console.log('Force send results:', data);
        toast({
          title: "Success",
          description: `Force sent ${data.emailsSent || 0} emails. Check the results below.`,
        });
        
        setResults(prev => ({
          ...prev,
          forceSendResults: data
        }));
      }
    } catch (err: any) {
      console.error('Unexpected error during force send:', err);
      toast({
        title: "Error",
        description: `Unexpected error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsForceSending(false);
    }
  };

  const testEmailDelivery = async () => {
    try {
      console.log('=== TESTING EMAIL DELIVERY ===');
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { 
          forceSend: true,
          testMode: true // Add a test mode flag
        }
      });
      
      if (error) {
        console.error('Email delivery test failed:', error);
        toast({
          title: "Email Test Failed",
          description: `Email delivery test failed: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Email delivery test results:', data);
        toast({
          title: "Email Test Complete",
          description: "Check console for detailed results and your email inbox.",
        });
      }
    } catch (err: any) {
      console.error('Email delivery test error:', err);
      toast({
        title: "Error",
        description: `Email test error: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  const shouldSendCount = results?.debugInfo?.filter((rel: any) => rel.shouldSend)?.length || 0;

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>🔍 Debug Birthday Reminders & Email System</CardTitle>
        <CardDescription>
          Comprehensive debugging and testing for the birthday reminder email system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={testReminders} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Debugging...' : '🔍 Debug & Forecast'}
          </Button>
          
          <Button 
            onClick={testEmailDelivery} 
            variant="outline"
            className="w-full"
          >
            📧 Test Email Delivery
          </Button>
          
          {shouldSendCount > 0 && (
            <Button 
              onClick={forceSendEmails} 
              disabled={isForceSending || isLoading}
              variant="destructive"
              className="w-full"
            >
              {isForceSending ? 'Force Sending...' : `⚡ Force Send ${shouldSendCount} Email${shouldSendCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
        
        {results && (
          <div className="mt-4 space-y-6">
            {/* Environment Check */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-900">🔧 System Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">✓</div>
                  <div className="text-gray-700">Function Working</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{results.debugInfo?.length || 0}</div>
                  <div className="text-gray-700">Total Relationships</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{shouldSendCount}</div>
                  <div className="text-gray-700">Due Today</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{results.forceSendResults?.emailsSent || 0}</div>
                  <div className="text-gray-700">Emails Sent</div>
                </div>
              </div>
            </div>

            {/* Show summary first */}
            {results.debugInfo && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-900">📊 Email Forecast Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.debugInfo.length}</div>
                    <div className="text-blue-800">Total Relationships</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.debugInfo.filter((r: any) => r.shouldSend).length}</div>
                    <div className="text-green-800">Should Send Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{results.debugInfo.filter((r: any) => r.type === 'birthday').length}</div>
                    <div className="text-yellow-800">Birthday Reminders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{results.debugInfo.filter((r: any) => r.type === 'anniversary').length}</div>
                    <div className="text-pink-800">Anniversary Reminders</div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Results Section */}
            {results.debugInfo && results.debugInfo.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">📋 Relationship Debug Details:</h3>
                {results.debugInfo.map((rel: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      rel.shouldSend 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {rel.type === 'birthday' ? '🎂' : '💕'} {rel.name} ({rel.type})
                        </h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>Email: {rel.email}</div>
                          <div>Date: {rel.date}</div>
                          <div>Frequency: {rel.frequency}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rel.shouldSend 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rel.shouldSend ? '✅ SEND TODAY' : '⏳ NOT TODAY'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {results.error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold mb-2 text-red-900">❌ Error Details:</h3>
                <div className="text-sm text-red-800 mb-2">
                  <strong>Error:</strong> {results.error}
                </div>
                {results.fullError && (
                  <pre className="text-xs overflow-auto whitespace-pre-wrap text-red-700 bg-red-100 p-2 rounded">
                    {JSON.stringify(results.fullError, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Raw Debug Data */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🔍 Raw Debug Results:</h3>
              <pre className="text-sm overflow-auto whitespace-pre-wrap max-h-64">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
            
            {results.forceSendResults && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-900">⚡ Force Send Results:</h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap text-blue-800">
                  {JSON.stringify(results.forceSendResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {shouldSendCount > 0 && (
          <div className="text-sm text-orange-600 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <strong>⚠️ Force Send Warning:</strong> This will send actual emails to {shouldSendCount} relationship{shouldSendCount > 1 ? 's' : ''} 
            that have reminders due today according to the debug results. Check your email inbox and spam folder.
          </div>
        )}

        <div className="text-sm text-blue-600 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium mb-2">🔧 Troubleshooting Steps:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>First click "Debug & Forecast" to see what emails should be sent</li>
            <li>If relationships show up but "Should Send Today" is 0, check your birthday/anniversary dates and notification frequencies</li>
            <li>Use "Test Email Delivery" to verify the email sending system is working</li>
            <li>If emails should send today, use "Force Send" to manually trigger them</li>
            <li>Check your email inbox AND spam folder for reminders</li>
            <li>Verify your Resend API key is configured correctly in Supabase secrets</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
