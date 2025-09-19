import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Relationship {
  id: string;
  name: string;
  relationship_type: string;
  birthday: string | null;
  anniversary: string | null;
  birthday_notification_frequency: string;
  anniversary_notification_frequency: string;
  email: string | null;
  city: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface UpcomingEvent {
  id: string;
  name: string;
  type: 'birthday' | 'anniversary';
  date: string;
  daysUntil: number;
  frequency: string;
  shouldSendReminder: boolean;
  reminderDate: string;
}

export const useRelationships = () => {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('profile_id', user.id)
        .order('name');

      if (error) throw error;

      setRelationships(data || []);
      calculateUpcomingEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching relationships:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateUpcomingEvents = (data: Relationship[]) => {
    const events: UpcomingEvent[] = [];
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    data.forEach(relationship => {
      // Birthday events
      if (relationship.birthday) {
        const birthday = new Date(relationship.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        if (thisYearBirthday <= nextMonth) {
          const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const reminderDays = getFrequencyDays(relationship.birthday_notification_frequency);
          const reminderDate = new Date(thisYearBirthday.getTime() - reminderDays * 24 * 60 * 60 * 1000);
          const shouldSendReminder = reminderDate <= today && today <= thisYearBirthday;

          events.push({
            id: `${relationship.id}-birthday`,
            name: relationship.name,
            type: 'birthday',
            date: thisYearBirthday.toISOString().split('T')[0],
            daysUntil,
            frequency: relationship.birthday_notification_frequency,
            shouldSendReminder,
            reminderDate: reminderDate.toISOString().split('T')[0]
          });
        }
      }

      // Anniversary events
      if (relationship.anniversary) {
        const anniversary = new Date(relationship.anniversary);
        const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        
        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1);
        }

        if (thisYearAnniversary <= nextMonth) {
          const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const reminderDays = getFrequencyDays(relationship.anniversary_notification_frequency);
          const reminderDate = new Date(thisYearAnniversary.getTime() - reminderDays * 24 * 60 * 60 * 1000);
          const shouldSendReminder = reminderDate <= today && today <= thisYearAnniversary;

          events.push({
            id: `${relationship.id}-anniversary`,
            name: relationship.name,
            type: 'anniversary',
            date: thisYearAnniversary.toISOString().split('T')[0],
            daysUntil,
            frequency: relationship.anniversary_notification_frequency,
            shouldSendReminder,
            reminderDate: reminderDate.toISOString().split('T')[0]
          });
        }
      }
    });

    events.sort((a, b) => a.daysUntil - b.daysUntil);
    setUpcomingEvents(events);
  };

  const getFrequencyDays = (frequency: string): number => {
    switch (frequency) {
      case '1_day': return 1;
      case '3_days': return 3;
      case '1_week': return 7;
      case '2_weeks': return 14;
      case '1_month': return 30;
      default: return 7;
    }
  };

  const testBirthdayReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-birthday-reminders');
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error testing birthday reminders:', err);
      throw err;
    }
  };

  const forceSendReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-birthday-reminders', {
        body: { forceSend: true }
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error force sending reminders:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, [user]);

  return {
    relationships,
    upcomingEvents,
    loading,
    error,
    refetch: fetchRelationships,
    testBirthdayReminders,
    forceSendReminders
  };
};