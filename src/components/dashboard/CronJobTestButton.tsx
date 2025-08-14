import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const CronJobTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const testCronJobFunction = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log('=== TESTING CRON JOB FUNCTION ===');
      
      // Test the edge function directly to verify it's working
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { 
          scheduled: true,
          debug: true
        }
      });

      console.log('Function test result:', { data, error });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      setResults(data);
      
      toast({
        title: "Cron Job Function Test Successful!",
        description: `Function responded successfully. Found ${data?.debugInfo?.length || 0} relationships to check.`,
      });

    } catch (err: any) {
      console.error('Cron job test error:', err);
      setResults({ error: err.message });
      toast({
        title: "Cron Job Test Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testManualTrigger = async () => {
    setIsLoading(true);
    
    try {
      console.log('=== TESTING MANUAL TRIGGER ===');
      
      // Test with force send to actually send an email
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { 
          forceSend: true
        }
      });

      console.log('Manual trigger result:', { data, error });

      if (error) {
        throw new Error(`Manual trigger error: ${error.message}`);
      }

      toast({
        title: "Manual Trigger Test Successful!",
        description: `Sent ${data?.emailsSent || 0} emails. Check your inbox!`,
      });

    } catch (err: any) {
      console.error('Manual trigger error:', err);
      toast({
        title: "Manual Trigger Failed",
        description: `Error: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 Cron Job Function Test</CardTitle>
        <CardDescription>
          Test the birthday reminder function to verify it's working correctly after the fix
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testCronJobFunction} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Testing...' : '🧪 Test Function (Debug Mode)'}
          </Button>
          
          <Button 
            onClick={testManualTrigger} 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? 'Sending...' : '📧 Force Send Test Email'}
          </Button>
        </div>
        
        {results && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Debug Mode:</strong> Tests the function without sending emails</p>
          <p><strong>Force Send:</strong> Actually sends reminder emails to all relationships</p>
          <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
        </div>
      </CardContent>
    </Card>
  );
};