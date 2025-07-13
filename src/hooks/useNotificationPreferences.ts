import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_reminders_enabled: boolean;
  push_notifications_enabled: boolean;
  reminder_time: string;
  birthday_reminders_enabled: boolean;
  anniversary_reminders_enabled: boolean;
  nudge_reminders_enabled: boolean;
  date_ideas_enabled: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_reminders_enabled: true,
  push_notifications_enabled: false,
  reminder_time: '09:00',
  birthday_reminders_enabled: true,
  anniversary_reminders_enabled: true,
  nudge_reminders_enabled: true,
  date_ideas_enabled: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          ...data,
          reminder_time: data.reminder_time.slice(0, 5), // Convert HH:MM:SS to HH:MM
        });
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...defaultPreferences,
        })
        .select()
        .single();

      if (error) throw error;
      
      setPreferences({
        ...data,
        reminder_time: data.reminder_time.slice(0, 5),
      });
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updates }));
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
  };
};