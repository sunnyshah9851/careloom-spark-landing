
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
      console.log('Calling test-birthday-reminders function...');
      
      const { data, error } = await supabase.functions.invoke('test-birthday-reminders', {
        body: { debug: true }
      });
      
      if (error) {
        console.error('Error calling test function:', error);
        setResults({ error: error.message });
      } else {
        console.log('Test results:', data);
        setResults(data);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setResults({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const forceSendEmails = async () => {
    if (!results?.debug?.relationships) {
      toast({
        title: "No Debug Data",
        description: "Please run the debug test first to see which emails should be sent.",
        variant: "destructive"
      });
      return;
    }

    const shouldSendToday = results.debug.relationships.filter((rel: any) => 
      rel.shouldSendBirthdayToday || rel.shouldSendAnniversaryToday
    );
    
    if (shouldSendToday.length === 0) {
      toast({
        title: "No Emails to Send",
        description: "No relationships have reminders due today based on the debug results.",
      });
      return;
    }

    setIsForceSending(true);
    try {
      console.log('Force sending emails for relationships that should send today...');
      
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

  const shouldSendCount = results?.debug?.relationships?.filter((rel: any) => 
    rel.shouldSendBirthdayToday || rel.shouldSendAnniversaryToday
  )?.length || 0;

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Debug Birthday Reminders & Email Forecast</CardTitle>
        <CardDescription>
          Test your birthday reminder configuration and see exactly when emails will be sent in the next 3 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={testReminders} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Testing...' : 'Debug & Forecast Emails'}
          </Button>
          
          {shouldSendCount > 0 && (
            <Button 
              onClick={forceSendEmails} 
              disabled={isForceSending || isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isForceSending ? 'Force Sending...' : `Force Send ${shouldSendCount} Email${shouldSendCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
        
        {results && (
          <div className="mt-4 space-y-6">
            {/* Email Forecast Section */}
            {results.debug?.forecast && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-4 text-blue-900">📅 Email Forecast (Next 3 Days)</h3>
                {results.debug.forecast.map((day: any, index: number) => (
                  <div key={day.date} className={`mb-4 p-3 rounded-lg ${day.isToday ? 'bg-yellow-100 border border-yellow-300' : 'bg-white border border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">
                        {day.dayName}, {new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        {day.isToday && <span className="ml-2 text-xs bg-yellow-200 px-2 py-1 rounded">TODAY</span>}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {day.emailCount} email{day.emailCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {day.emails.length > 0 ? (
                      <div className="space-y-2">
                        {day.emails.map((email: any, emailIndex: number) => (
                          <div key={emailIndex} className="text-sm bg-gray-50 p-2 rounded border-l-4 border-blue-400">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium text-gray-900">
                                  {email.type === 'birthday' && '🎂'} 
                                  {email.type === 'anniversary' && '💕'} 
                                  {email.type === 'date_ideas' && '💡'} 
                                  {email.type.charAt(0).toUpperCase() + email.type.slice(1).replace('_', ' ')}
                                </span>
                                <div className="text-gray-700">
                                  To: <span className="font-medium">{email.recipientName}</span> ({email.recipient})
                                </div>
                                {email.partner && (
                                  <div className="text-gray-600">
                                    About: {email.partner}
                                    {email.eventDate && ` (${new Date(email.eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">{email.scheduledTime}</div>
                                <div className="text-xs text-gray-400">{formatDateTime(email.fullDateTime)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No emails scheduled</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Debug Results Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Results:</h3>
              <pre className="text-sm overflow-auto whitespace-pre-wrap">
                {JSON.stringify(results.debug || results, null, 2)}
              </pre>
            </div>
            
            {results.forceSendResults && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-900">Force Send Results:</h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap text-blue-800">
                  {JSON.stringify(results.forceSendResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {shouldSendCount > 0 && (
          <div className="text-sm text-orange-600 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <strong>⚠️ Force Send:</strong> This will send actual emails to {shouldSendCount} relationship{shouldSendCount > 1 ? 's' : ''} 
            that have reminders due today according to the debug results.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
