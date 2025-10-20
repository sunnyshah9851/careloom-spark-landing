import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TestDateIdeas = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testCity, setTestCity] = useState('New York');
  const [testPartnerName, setTestPartnerName] = useState('Alex');
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('=== SENDING TEST DATE IDEAS EMAIL ===');
      console.log('Test email:', testEmail);
      console.log('City:', testCity);
      console.log('Partner name:', testPartnerName);
      
      const { data, error } = await supabase.functions.invoke('send-date-ideas', {
        body: { 
          testMode: true,
          testEmail: testEmail,
          testCity: testCity,
          testPartnerName: testPartnerName
        }
      });

      console.log('Test email result:', { data, error });

      if (error) {
        throw new Error(`Failed to send test email: ${error.message}`);
      }

      toast({
        title: "Test Email Sent! 💕",
        description: `Date ideas sent to ${testEmail}. Check inbox and spam folder.`,
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
        <CardTitle>🧪 Test Date Ideas Email</CardTitle>
        <CardDescription>
          Send a test date ideas email to any address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-city">City</Label>
          <Input
            id="test-city"
            type="text"
            placeholder="New York"
            value={testCity}
            onChange={(e) => setTestCity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-partner">Partner Name</Label>
          <Input
            id="test-partner"
            type="text"
            placeholder="Alex"
            value={testPartnerName}
            onChange={(e) => setTestPartnerName(e.target.value)}
          />
        </div>

        <Button 
          onClick={sendTestEmail} 
          disabled={isLoading || !testEmail}
          className="w-full"
        >
          {isLoading ? 'Sending...' : '📧 Send Test Email'}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          This will generate AI-powered date ideas for the specified city
        </p>
      </CardContent>
    </Card>
  );
};
