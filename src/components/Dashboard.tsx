
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from './DashboardLayout';
import DashboardOverview from './dashboard/DashboardOverview';
import DashboardPeople from './dashboard/DashboardPeople';
import DashboardMemories from './dashboard/DashboardMemories';
import DashboardProfile from './dashboard/DashboardProfile';
import DashboardSettings from './dashboard/DashboardSettings';

interface Relationship {
  id: string;
  profile_id: string;
  relationship_type: string;
  name: string;
  email?: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  last_nudge_sent?: string;
  tags?: string[];
  created_at: string;
  birthday_notification_frequency?: string;
  anniversary_notification_frequency?: string;
}

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  city?: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  console.log('Dashboard render - user:', user?.email);

  useEffect(() => {
    console.log('Dashboard useEffect - user changed:', user?.email);
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) {
      console.log('No user for fetchUserData');
      return;
    }

    console.log('Fetching user data for:', user.id);

    // Fetch both profile and relationships data
    const [profileResult, relationshipsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('relationships')
        .select('*')
        .eq('profile_id', user.id)
    ]);

    if (profileResult.error) {
      console.error('Error fetching profile:', profileResult.error);
    }

    if (relationshipsResult.error) {
      console.error('Error fetching relationships:', relationshipsResult.error);
    }

    console.log('Profile data:', profileResult.data);
    console.log('Relationships data:', relationshipsResult.data);
    console.log('Relationships notification frequencies:', relationshipsResult.data?.map(r => ({
      name: r.name,
      birthday_freq: r.birthday_notification_frequency,
      anniversary_freq: r.anniversary_notification_frequency
    })));

    setProfile(profileResult.data);
    setRelationships(relationshipsResult.data || []);
  };

  const handleProfileUpdate = async (updatedProfile: Partial<Profile>) => {
    if (!user) return;

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.full_name,
          city: updatedProfile.city,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh data after update
      await fetchUserData();
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview relationships={relationships} profile={profile} />;
      case 'people':
        return <DashboardPeople relationships={relationships} profile={profile} onRelationshipsUpdate={fetchUserData} />;
      case 'memories':
        return <DashboardMemories />;
      case 'profile':
        return <DashboardProfile profile={profile} relationships={relationships} onProfileUpdate={handleProfileUpdate} onRelationshipsUpdate={fetchUserData} />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return <DashboardOverview relationships={relationships} profile={profile} />;
    }
  };

  if (!user) {
    console.log('Dashboard: No user, returning null');
    return null;
  }

  console.log('Dashboard: Rendering dashboard UI');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
