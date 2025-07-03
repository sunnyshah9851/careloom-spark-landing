
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
      console.log('Sending personalized nudge for user:', user.email);
      console.log('Nudge data:', data);

      // Get user's profile to get their city
      const { data: profile } = await supabase
        .from('profiles')
        .select('city')
        .eq('id', user.id)
        .single();

      const userCity = profile?.city || data.city || 'your city';

      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-date-ideas', {
        body: {
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email,
          partnerName: data.partnerName,
          city: userCity,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      console.log('Personalized nudge sent successfully:', functionData);
      return true;
    } catch (err: any) {
      console.error('Error sending personalized nudge:', err);
      setError(err.message || 'Failed to send personalized nudge');
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
