
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
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) {
      console.log('No user for fetchUserData');
      return;
    }

    console.log('Fetching user data for:', user.id);

    // Fetch both profile and relationship data
    const [profileResult, relationshipResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('relationships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
    ]);

    if (profileResult.error) {
      console.error('Error fetching profile:', profileResult.error);
    }

    if (relationshipResult.error) {
      console.error('Error fetching relationship:', relationshipResult.error);
    }

    console.log('Profile data:', profileResult.data);
    console.log('Relationship data:', relationshipResult.data);

    // Set relationship data
    setRelationship(relationshipResult.data);

    // Combine profile and relationship data into the profile format
    const profileData = profileResult.data;
    const relationshipData = relationshipResult.data;

    setProfile({
      full_name: profileData?.full_name || '',
      user_birthday: profileData?.user_birthday || '',
      partner_name: relationshipData ? `${relationshipData.partner_first_name} ${relationshipData.partner_last_name}` : '',
      partner_birthday: relationshipData?.partner_birthday || '',
      anniversary_date: relationshipData?.anniversary_date || '',
      reminder_frequency: relationshipData?.reminder_frequency || 'weekly'
    });
  };

  const handleProfileUpdate = async (updatedProfile: Profile) => {
    if (!user) return;

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.full_name,
          user_birthday: updatedProfile.user_birthday || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Parse partner name
      const nameParts = updatedProfile.partner_name.trim().split(' ');
      const partner_first_name = nameParts[0] || '';
      const partner_last_name = nameParts.slice(1).join(' ') || '';

      // Update or create relationship
      if (relationship) {
        // Update existing relationship
        const { error: relationshipError } = await supabase
          .from('relationships')
          .update({
            partner_first_name,
            partner_last_name,
            partner_birthday: updatedProfile.partner_birthday || null,
            anniversary_date: updatedProfile.anniversary_date || null,
            reminder_frequency: updatedProfile.reminder_frequency,
          })
          .eq('id', relationship.id);

        if (relationshipError) throw relationshipError;
      } else {
        // Create new relationship
        const { error: relationshipError } = await supabase
          .from('relationships')
          .insert({
            user_id: user.id,
            partner_first_name,
            partner_last_name,
            partner_birthday: updatedProfile.partner_birthday || null,
            anniversary_date: updatedProfile.anniversary_date || null,
            reminder_frequency: updatedProfile.reminder_frequency,
          });

        if (relationshipError) throw relationshipError;
      }

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
