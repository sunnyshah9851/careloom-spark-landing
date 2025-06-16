import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CareloomLogo from './CareloomLogo';
import DashboardStats from './dashboard/DashboardStats';
import UpcomingEvents from './dashboard/UpcomingEvents';
import ProfileEditor from './dashboard/ProfileEditor';

interface Profile {
  full_name: string;
  partner_name: string;
  user_birthday: string;
  partner_birthday: string;
  anniversary_date: string;
  reminder_frequency: string;
}

interface Event {
  type: 'birthday' | 'anniversary';
  name: string;
  date: string;
  daysUntil: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  console.log('Dashboard render - user:', user?.email);

  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    partner_name: '',
    user_birthday: '',
    partner_birthday: '',
    anniversary_date: '',
    reminder_frequency: 'weekly'
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalNudges: 12,
    anniversaryWishes: 3,
    daysToNextEvent: 0
  });

  useEffect(() => {
    console.log('Dashboard useEffect - user changed:', user?.email);
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    calculateUpcomingEvents();
  }, [profile]);

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
      setProfile({
        full_name: data.full_name || '',
        partner_name: data.partner_name || '',
        user_birthday: data.user_birthday || '',
        partner_birthday: data.partner_birthday || '',
        anniversary_date: data.anniversary_date || '',
        reminder_frequency: data.reminder_frequency || 'weekly'
      });
    }
  };

  const calculateUpcomingEvents = () => {
    const events: Event[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Helper function to calculate days until event
    const getDaysUntil = (eventDate: Date) => {
      const diffTime = eventDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Helper function to get next occurrence of a date this year or next
    const getNextOccurrence = (dateString: string) => {
      const date = new Date(dateString);
      const thisYear = new Date(currentYear, date.getMonth(), date.getDate());
      const nextYear = new Date(currentYear + 1, date.getMonth(), date.getDate());
      
      return thisYear >= today ? thisYear : nextYear;
    };

    // Add user birthday
    if (profile.user_birthday) {
      const nextBirthday = getNextOccurrence(profile.user_birthday);
      events.push({
        type: 'birthday',
        name: `${profile.full_name || 'Your'} Birthday`,
        date: nextBirthday.toISOString(),
        daysUntil: getDaysUntil(nextBirthday)
      });
    }

    // Add partner birthday
    if (profile.partner_birthday) {
      const nextBirthday = getNextOccurrence(profile.partner_birthday);
      events.push({
        type: 'birthday',
        name: `${profile.partner_name || 'Partner'}'s Birthday`,
        date: nextBirthday.toISOString(),
        daysUntil: getDaysUntil(nextBirthday)
      });
    }

    // Add anniversary
    if (profile.anniversary_date) {
      const nextAnniversary = getNextOccurrence(profile.anniversary_date);
      events.push({
        type: 'anniversary',
        name: 'Anniversary',
        date: nextAnniversary.toISOString(),
        daysUntil: getDaysUntil(nextAnniversary)
      });
    }

    // Sort by days until event
    events.sort((a, b) => a.daysUntil - b.daysUntil);

    setUpcomingEvents(events);

    // Update stats with next event
    if (events.length > 0) {
      setStats(prev => ({ ...prev, daysToNextEvent: events[0].daysUntil }));
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (!user) {
    console.log('Dashboard: No user, returning null');
    return null;
  }

  console.log('Dashboard: Rendering dashboard UI');

  return (
    <div className="min-h-screen gradient-warm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <CareloomLogo />
            <div className="flex items-center space-x-4">
              <span className="text-rose-700">Welcome, {user?.user_metadata?.full_name || user?.email}</span>
              <Button 
                variant="ghost" 
                onClick={signOut}
                className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
            Your Relationship Dashboard
          </h1>
          <p className="text-rose-600 text-lg">
            Keep track of the moments that matter most
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <UpcomingEvents events={upcomingEvents} />

          {/* Profile Editor */}
          <ProfileEditor 
            profile={profile} 
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
