
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ManualEmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testEmailSending = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log('Calling send-birthday-reminders function in LIVE mode...');
      
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { manual: true }
      });
      
      if (error) {
        console.error('Error calling send function:', error);
        setResults({ error: error.message });
        toast({
          title: "Error",
          description: `Failed to send emails: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Email sending results:', data);
        setResults(data);
        
        if (data.emailsSent > 0) {
          toast({
            title: "Success",
            description: `Successfully sent ${data.emailsSent} reminder emails!`,
          });
        } else if (data.emailErrors > 0) {
          toast({
            title: "Partial Success",
            description: `Attempted to send emails but encountered ${data.emailErrors} errors. Check results below.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "No Emails Sent",
            description: "No reminder emails were due to be sent today.",
          });
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setResults({ error: err.message });
      toast({
        title: "Error",
        description: `Unexpected error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Manual Email Test</CardTitle>
        <CardDescription>
          Test actual email sending (this will send real emails if reminders are due today)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testEmailSending} 
          disabled={isLoading}
          className="w-full"
          variant="destructive"
        >
          {isLoading ? 'Sending Emails...' : 'Send Actual Reminder Emails'}
        </Button>
        
        {results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Email Sending Results:</h3>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <strong>⚠️ Warning:</strong> This will send actual emails if any reminders are due today. 
          Use the debug test first to check what would be sent.
        </div>
      </CardContent>
    </Card>
  );
};
