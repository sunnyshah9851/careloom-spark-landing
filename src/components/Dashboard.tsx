import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CareloomLogo from './CareloomLogo';
import DashboardStats from './dashboard/DashboardStats';
import UpcomingEvents from './dashboard/UpcomingEvents';
import ProfileEditor from './dashboard/ProfileEditor';
import { Heart, Plus, Lightbulb } from 'lucide-react';

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

  const getThoughtfulnessScore = () => {
    // Simple scoring based on profile completeness and upcoming events
    let score = 0;
    if (profile.partner_name) score += 25;
    if (profile.partner_birthday) score += 25;
    if (profile.anniversary_date) score += 25;
    if (upcomingEvents.length > 0) score += 25;
    return score;
  };

  const getDateIdea = () => {
    const ideas = [
      "Plan a cozy movie night with their favorite snacks 🍿",
      "Take a sunset walk together and share your favorite memories 🌅",
      "Cook their favorite meal together 👨‍🍳",
      "Write them a heartfelt letter about what they mean to you 💌",
      "Plan a surprise picnic in your favorite spot 🧺",
      "Create a playlist of songs that remind you of them 🎵"
    ];
    return ideas[Math.floor(Math.random() * ideas.length)];
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
              <span className="text-rose-700">Welcome, {user?.user_metadata?.full_name || profile.full_name || user?.email}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events - spans 2 columns */}
          <div className="lg:col-span-2">
            <UpcomingEvents events={upcomingEvents} />
          </div>

          {/* Right sidebar with thoughtfulness score and suggestions */}
          <div className="space-y-6">
            {/* Thoughtfulness Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-800">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Thoughtfulness Score
                </CardTitle>
                <CardDescription>
                  How connected you are
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-rose-600 mb-2">
                    {getThoughtfulnessScore()}%
                  </div>
                  <p className="text-sm text-rose-500">
                    {getThoughtfulnessScore() === 100 ? "You're doing amazing! 🌟" : 
                     getThoughtfulnessScore() >= 75 ? "Great job staying connected! 💝" :
                     getThoughtfulnessScore() >= 50 ? "You're on the right track! 💕" :
                     "Let's add more details to help you stay close! 💌"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Date Idea Suggestion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-800">
                  <Lightbulb className="h-5 w-5 text-rose-500" />
                  Today's Suggestion
                </CardTitle>
                <CardDescription>
                  A thoughtful way to connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rose-700 leading-relaxed">
                  {getDateIdea()}
                </p>
              </CardContent>
            </Card>

            {/* Add Someone Else Card */}
            <Card className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-rose-400 mx-auto mb-3" />
                <h3 className="font-medium text-rose-800 mb-2">
                  Add someone else you care about
                </h3>
                <p className="text-sm text-rose-600">
                  Family, friends, or other special people in your life
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Editor - Full width at bottom */}
        <div className="mt-8">
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
