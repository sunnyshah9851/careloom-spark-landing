import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './DashboardStats';
import { Heart, Plus, Lightbulb, Bell, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TryNudgeCard from './TryNudgeCard';

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

interface Event {
  type: 'birthday' | 'anniversary';
  name: string;
  date: string;
  daysUntil: number;
}

interface DashboardOverviewProps {
  relationship: Relationship | null;
  profile: Profile;
}

const DashboardOverview = ({ relationship, profile }: DashboardOverviewProps) => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    thoughtfulActions: 0,
    daysToNextEvent: 0
  });
  const [hasViewedSuggestion, setHasViewedSuggestion] = useState(false);

  // Create a stable suggestion for the entire day using date as seed
  const todaysSuggestion = useMemo(() => {
    const ideas = [
      "Plan a cozy movie night with their favorite snacks 🍿",
      "Take a sunset walk together and share your favorite memories 🌅",
      "Cook their favorite meal together 👨‍🍳",
      "Write them a heartfelt letter about what they mean to you 💌",
      "Plan a surprise picnic in your favorite spot 🧺",
      "Create a playlist of songs that remind you of them 🎵"
    ];
    
    // Use today's date to create a consistent seed
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ideas[seed % ideas.length];
  }, []); // Empty dependency array ensures this only runs once per component mount

  useEffect(() => {
    if (relationship) {
      calculateUpcomingEvents();
    }
    if (user) {
      fetchThoughtfulActions();
    }
  }, [relationship, profile, user]);

  const fetchThoughtfulActions = async () => {
    if (!user) return;

    console.log('Fetching thoughtful actions for user:', user.id);

    const { data, error } = await supabase
      .from('thoughtful_actions')
      .select('id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching thoughtful actions:', error);
      return;
    }

    console.log('Thoughtful actions data:', data);
    const count = data?.length || 0;
    console.log('Thoughtful actions count:', count);

    setStats(prev => ({ ...prev, thoughtfulActions: count }));
  };

  const recordThoughtfulAction = async (actionType: string, description?: string) => {
    if (!user) return;

    console.log('Recording thoughtful action:', actionType, description);

    const { error } = await supabase
      .from('thoughtful_actions')
      .insert({
        user_id: user.id,
        action_type: actionType,
        action_description: description
      });

    if (error) {
      console.error('Error recording thoughtful action:', error);
    } else {
      console.log('Thoughtful action recorded successfully');
      // Refresh the count
      fetchThoughtfulActions();
    }
  };

  const calculateUpcomingEvents = () => {
    if (!relationship) {
      setUpcomingEvents([]);
      return;
    }

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
    if (relationship.partner_birthday) {
      const nextBirthday = getNextOccurrence(relationship.partner_birthday);
      events.push({
        type: 'birthday',
        name: `${relationship.partner_first_name}'s Birthday`,
        date: nextBirthday.toISOString(),
        daysUntil: getDaysUntil(nextBirthday)
      });
    }

    // Add anniversary
    if (relationship.anniversary_date) {
      const nextAnniversary = getNextOccurrence(relationship.anniversary_date);
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

  const getDaysTogether = () => {
    if (!relationship?.anniversary_date) return 0;
    
    const anniversaryDate = new Date(relationship.anniversary_date);
    const today = new Date();
    const timeDifference = today.getTime() - anniversaryDate.getTime();
    return Math.max(0, Math.floor(timeDifference / (1000 * 60 * 60 * 24)));
  };

  const getThoughtfulnessScore = () => {
    let score = 0;
    if (relationship?.partner_first_name) score += 25;
    if (relationship?.partner_birthday) score += 25;
    if (relationship?.anniversary_date) score += 25;
    if (upcomingEvents.length > 0) score += 25;
    return score;
  };

  const getNudgeFrequencyName = (frequency: string) => {
    const frequencyNames = {
      'daily': 'Daily Love Taps ❤️',
      'weekly': 'Weekly Heart Nudges 💝',
      'biweekly': 'Bi-Weekly Sweet Reminders 🌸',
      'monthly': 'Monthly Romance Boosts 🌹'
    };
    return frequencyNames[frequency as keyof typeof frequencyNames] || 'Love Reminders 💕';
  };

  const getNextNudgeDate = (frequency: string) => {
    const today = new Date();
    let nextNudge = new Date(today);

    switch (frequency) {
      case 'daily':
        nextNudge.setDate(today.getDate() + 1);
        break;
      case 'weekly':
        nextNudge.setDate(today.getDate() + 7);
        break;
      case 'biweekly':
        nextNudge.setDate(today.getDate() + 14);
        break;
      case 'monthly':
        nextNudge.setMonth(today.getMonth() + 1);
        break;
      default:
        nextNudge.setDate(today.getDate() + 7);
    }

    return nextNudge.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewSuggestion = async () => {
    if (!hasViewedSuggestion) {
      await recordThoughtfulAction('suggestion_viewed', todaysSuggestion);
      setHasViewedSuggestion(true);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-rose-800 mb-3">
          Your Relationship Dashboard
        </h1>
        <p className="text-rose-600 text-lg">
          Keep track of the moments that matter most
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats stats={{
        daysTogether: getDaysTogether(),
        thoughtfulActions: stats.thoughtfulActions,
        daysToNextEvent: stats.daysToNextEvent
      }} />

      {/* Main Content - Improved Layout */}
      <div className="space-y-8">
        {/* Top Row - Upcoming Events and Try Nudge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-800">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Never miss a special moment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.slice(0, 3).map((event, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 bg-rose-50 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors"
                        onClick={() => recordThoughtfulAction('event_acknowledged', `Acknowledged ${event.name}`)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {event.type === 'birthday' ? '🎂' : '💖'}
                          </div>
                          <div>
                            <h3 className="font-medium text-rose-800">{event.name}</h3>
                            <p className="text-sm text-rose-600">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-rose-700">
                            {event.daysUntil === 0 ? 'Today!' : `${event.daysUntil} days`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-rose-300 mx-auto mb-4" />
                    <p className="text-rose-600">
                      Add some important dates to see upcoming events!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Try Nudge Card */}
          <div>
            <TryNudgeCard 
              partnerName={relationship?.partner_first_name}
              onNudgeSent={() => recordThoughtfulAction('nudge_requested', 'Requested personalized date ideas via email')}
            />
          </div>
        </div>

        {/* Middle Row - Today's Suggestion and Thoughtfulness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today's Suggestion */}
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
              <p className="text-rose-700 leading-relaxed mb-4 text-lg">
                {todaysSuggestion}
              </p>
              {!hasViewedSuggestion ? (
                <button
                  onClick={handleViewSuggestion}
                  className="text-sm text-rose-500 hover:text-rose-700 underline transition-colors"
                >
                  Mark as viewed
                </button>
              ) : (
                <p className="text-sm text-rose-400 italic">
                  ✓ Viewed today
                </p>
              )}
            </CardContent>
          </Card>

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
                <div className="text-4xl font-bold text-rose-600 mb-3">
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
        </div>

        {/* Bottom Row - Nudge Settings and Add Someone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nudge Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-800">
                <Bell className="h-5 w-5 text-rose-500" />
                <span className="text-base">
                  {getNudgeFrequencyName(relationship?.reminder_frequency || 'weekly')}
                </span>
              </CardTitle>
              <CardDescription>
                Your next thoughtful reminder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-sm font-semibold text-rose-600 mb-2">
                  Next nudge coming on:
                </div>
                <div className="text-lg font-bold text-rose-700 mb-3">
                  {getNextNudgeDate(relationship?.reminder_frequency || 'weekly')}
                </div>
                <p className="text-sm text-rose-500">
                  We'll send you a gentle reminder to show some love! 💌
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add Someone Else Card */}
          <Card 
            className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer group"
            onClick={() => recordThoughtfulAction('add_person_clicked', 'Clicked to add another person')}
          >
            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
              <Plus className="h-12 w-12 text-rose-400 mx-auto mb-4 group-hover:text-rose-500 transition-colors" />
              <h3 className="font-medium text-rose-800 mb-2 text-lg">
                Add someone else you care about
              </h3>
              <p className="text-sm text-rose-600">
                Family, friends, or other special people in your life
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
