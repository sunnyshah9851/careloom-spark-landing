import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Send, Bug, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRelationships } from '@/hooks/useRelationships';

export const TestActionsCard = () => {
  const { testBirthdayReminders, forceSendReminders } = useRelationships();
  const [isTestingDebug, setIsTestingDebug] = useState(false);
  const [isForceSending, setIsForceSending] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);

  const handleDebugTest = async () => {
    setIsTestingDebug(true);
    try {
      const results = await testBirthdayReminders();
      setDebugResults(results);
      toast({
        title: "Debug Test Complete",
        description: "Check the results below for upcoming reminders.",
      });
    } catch (error: any) {
      toast({
        title: "Debug Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingDebug(false);
    }
  };

  const handleForceSend = async () => {
    setIsForceSending(true);
    try {
      const results = await forceSendReminders();
      toast({
        title: "Force Send Complete",
        description: `Processed ${results?.total_processed || 0} relationships`,
      });
      console.log('Force send results:', results);
    } catch (error: any) {
      toast({
        title: "Force Send Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsForceSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button
                onClick={handleDebugTest}
                disabled={isTestingDebug}
                className="w-full"
                variant="outline"
              >
                <Bug className="h-4 w-4 mr-2" />
                {isTestingDebug ? 'Testing...' : 'Debug Test (3-Day Forecast)'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Check what emails would be sent in the next 3 days without actually sending them.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleForceSend}
                disabled={isForceSending}
                className="w-full"
                variant="default"
              >
                <Send className="h-4 w-4 mr-2" />
                {isForceSending ? 'Sending...' : 'Force Send Emails'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Immediately send reminder emails for all due events.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-warning">Important Notes:</p>
              <ul className="mt-1 text-muted-foreground list-disc list-inside space-y-1">
                <li>Debug test shows what <em>would</em> happen without sending emails</li>
                <li>Force send will deliver actual emails to configured addresses</li>
                <li>Only relationships with valid email addresses will receive reminders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {debugResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Results
              {debugResults.success && (
                <Badge variant="default">Success</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugResults.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {debugResults.summary.total_relationships}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Relationships</div>
                  </div>
                  <div className="text-center p-3 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning">
                      {debugResults.summary.upcoming_birthdays}
                    </div>
                    <div className="text-sm text-muted-foreground">Upcoming Birthdays</div>
                  </div>
                  <div className="text-center p-3 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {debugResults.summary.upcoming_anniversaries}
                    </div>
                    <div className="text-sm text-muted-foreground">Upcoming Anniversaries</div>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugResults, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};