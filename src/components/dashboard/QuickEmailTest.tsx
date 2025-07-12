import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const QuickEmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendTestEmail = async () => {
    setIsLoading(true);
    
    try {
      console.log('=== SENDING TEST EMAIL ===');
      
      // Call the birthday reminder function with force mode to send to current user
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { 
          force: true, 
          test: true,
          testEmail: user?.email,
          debug: true 
        }
      });

      console.log('Test email result:', { data, error });

      if (error) {
        throw new Error(`Failed to send test email: ${error.message}`);
      }

      toast({
        title: "Test Email Sent!",
        description: `Check your inbox at ${user?.email}. Also check spam folder.`,
      });

    } catch (err: any) {
      console.error('Test email error:', err);
      toast({
        title: "Email Test Failed",
        description: `Could not send test email: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🧪 Quick Email Test</CardTitle>
        <CardDescription>
          Send a test birthday reminder to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={sendTestEmail} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : '📧 Send Test Email'}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Will send to: {user?.email}
        </p>
      </CardContent>
    </Card>
  );
};