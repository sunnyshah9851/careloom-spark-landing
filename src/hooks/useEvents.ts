
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  relationship_id: string | null;
  event_type: string;
  event_date: string;
  metadata: any;
  created_at: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordEvent = async (
    relationshipId: string | null,
    eventType: string,
    metadata: any = {}
  ) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          relationship_id: relationshipId,
          event_type: eventType,
          metadata,
        });

      if (insertError) {
        throw insertError;
      }

      console.log('Event recorded:', { relationshipId, eventType, metadata });
      return true;
    } catch (err: any) {
      console.error('Error recording event:', err);
      setError(err.message || 'Failed to record event');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentEvents = async (days: number = 7) => {
    if (!user) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          relationships!inner(
            name,
            profile_id
          )
        `)
        .gte('created_at', startDate.toISOString())
        .eq('relationships.profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error fetching recent events:', err);
      setError(err.message || 'Failed to fetch recent events');
      return [];
    }
  };

  return {
    recordEvent,
    getRecentEvents,
    isLoading,
    error,
  };
};
