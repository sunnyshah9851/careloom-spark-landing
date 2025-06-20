
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from './DashboardLayout';
import DashboardOverview from './dashboard/DashboardOverview';
import DashboardEvents from './dashboard/DashboardEvents';
import DashboardMemories from './dashboard/DashboardMemories';
import DashboardProfile from './dashboard/DashboardProfile';
import DashboardSettings from './dashboard/DashboardSettings';

interface Relationship {
  id: string;
  partner_first_name: string;
  partner_last_name: string;
  partner_birthday: string | null;
  anniversary_date: string | null;
  reminder_frequency: string;
}

interface Profile {
  full_name: string;
  partner_name: string;
  user_birthday: string;
  partner_birthday: string;
  anniversary_date: string;
  reminder_frequency: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    partner_name: '',
    user_birthday: '',
    partner_birthday: '',
    anniversary_date: '',
    reminder_frequency: 'weekly'
  });

  console.log('Dashboard render - user:', user?.email);

  useEffect(() => {
    console.log('Dashboard useEffect - user changed:', user?.email);
    if (user) {
      fetchRelationship();
      fetchProfile();
    }
  }, [user]);

  const fetchRelationship = async () => {
    if (!user) {
      console.log('No user for fetchRelationship');
      return;
    }

    console.log('Fetching relationship for user:', user.id);

    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching relationship:', error);
      return;
    }

    console.log('Relationship data:', data);
    setRelationship(data);

    // Convert relationship data to profile format for compatibility
    if (data) {
      setProfile(prev => ({
        ...prev,
        partner_name: `${data.partner_first_name} ${data.partner_last_name}`,
        partner_birthday: data.partner_birthday || '',
        anniversary_date: data.anniversary_date || '',
        reminder_frequency: data.reminder_frequency || 'weekly'
      }));
    }
  };

  const fetchProfile = async () => {
    if (!user) {
      console.log('No user for fetchProfile');
      return;
    }

    console.log('Fetching profile for user:', user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    console.log('Profile data:', data);

    if (data) {
      setProfile(prev => ({
        ...prev,
        full_name: data.full_name || '',
        user_birthday: data.user_birthday || ''
      }));
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview relationship={relationship} profile={profile} />;
      case 'events':
        return <DashboardEvents relationship={relationship} profile={profile} />;
      case 'memories':
        return <DashboardMemories />;
      case 'profile':
        return <DashboardProfile profile={profile} onProfileUpdate={handleProfileUpdate} />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return <DashboardOverview relationship={relationship} profile={profile} />;
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
