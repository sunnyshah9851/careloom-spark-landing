
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDateIdeas = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendDateIdeas = async () => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Triggering date ideas emails for user:', user.email);

      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-date-ideas', {
        body: { manual_trigger: true },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      console.log('Date ideas emails triggered successfully:', functionData);
      return functionData;
    } catch (err: any) {
      console.error('Error triggering date ideas:', err);
      setError(err.message || 'Failed to send date ideas');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendDateIdeas,
    isLoading,
    error,
  };
};
