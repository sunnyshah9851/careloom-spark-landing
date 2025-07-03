
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const TestBirthdayReminders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

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

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Debug Birthday Reminders</CardTitle>
        <CardDescription>
          Test your birthday reminder configuration and see why emails might not be sent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testReminders} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Birthday Reminders'}
        </Button>
        
        {results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
