
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CronJobTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const setupCronJobs = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log('Setting up cron jobs...');
      
      const { data, error } = await supabase.functions.invoke('setup-cron-job');
      
      if (error) {
        console.error('Error setting up cron jobs:', error);
        setResults({ error: error.message });
        toast({
          title: "Error",
          description: `Failed to setup cron jobs: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Cron jobs setup results:', data);
        setResults(data);
        toast({
          title: "Success",
          description: "Cron jobs have been set up and tested successfully!",
        });
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

  const testBirthdayFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { debug: true }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Birthday Function Test",
        description: `Found ${data.debugInfo?.length || 0} relationships to check`,
      });
      
      console.log('Birthday function test result:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Birthday function test failed: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const testDateIdeasFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-date-ideas', {
        body: { scheduled: true }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Date Ideas Function Test",
        description: `Sent ${data.emailsSent || 0} date ideas emails`,
      });
      
      console.log('Date ideas function test result:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Date ideas function test failed: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Cron Job Setup & Testing</CardTitle>
        <CardDescription>
          Set up and test the automated email sending cron jobs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={setupCronJobs} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Setup Cron Jobs'}
          </Button>
          
          <Button 
            onClick={testBirthdayFunction}
            variant="outline"
            className="w-full"
          >
            Test Birthday Function
          </Button>
          
          <Button 
            onClick={testDateIdeasFunction}
            variant="outline"
            className="w-full"
          >
            Test Date Ideas Function
          </Button>
        </div>
        
        {results && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Setup Results:</h3>
            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">What this does:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Sets up daily cron jobs for birthday reminders (9 AM UTC)</li>
            <li>Sets up daily cron jobs for date ideas (10 AM UTC)</li>
            <li>Tests both functions to ensure they're working</li>
            <li>Shows detailed logs and test results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
