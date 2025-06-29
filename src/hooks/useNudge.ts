
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NudgeData {
  city?: string;
  partnerName?: string;
}

export const useNudge = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNudge = async (data: NudgeData) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending nudge for user:', user.email);
      console.log('Nudge data:', data);

      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-nudge', {
        body: {
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email,
          partnerName: data.partnerName,
          city: data.city,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      console.log('Nudge sent successfully:', functionData);
      return true;
    } catch (err: any) {
      console.error('Error sending nudge:', err);
      setError(err.message || 'Failed to send nudge');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendNudge,
    isLoading,
    error,
  };
};
