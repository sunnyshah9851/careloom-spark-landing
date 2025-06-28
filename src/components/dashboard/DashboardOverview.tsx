
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  }, []);

  useEffect(() => {
    if (relationship) {
      calculateUpcomingEvents();
    }
  }, [relationship, profile, user]);

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

  const nextEvent = upcomingEvents[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-rose-800">
          Your Relationship Dashboard
        </h1>
        <p className="text-rose-600">
          Keep track of the moments that matter most
        </p>
      </div>

      {/* Top Row - Next Event Highlight */}
      {nextEvent && (
        <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {nextEvent.type === 'birthday' ? '🎂' : '💖'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-rose-800">
                    {nextEvent.name}
                  </h2>
                  <p className="text-rose-600">
                    {new Date(nextEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-rose-700">
                  {nextEvent.daysUntil === 0 ? 'Today!' : `${nextEvent.daysUntil} days`}
                </div>
                <p className="text-rose-500 text-sm">to go</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Try Nudge Card */}
        <div className="lg:col-span-2">
          <TryNudgeCard 
            partnerName={relationship?.partner_first_name}
            onNudgeSent={() => recordThoughtfulAction('nudge_requested', 'Requested personalized date ideas via email')}
          />
        </div>

        {/* Today's Suggestion */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Lightbulb className="h-5 w-5 text-rose-500" />
              Today's Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-rose-700 leading-relaxed mb-3">
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
      </div>

      {/* Second Row - All Upcoming Events & Nudge Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Calendar className="h-5 w-5" />
              All Upcoming Events
            </CardTitle>
            <CardDescription>
              Never miss a special moment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
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
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-700">
                        {event.daysUntil === 0 ? 'Today!' : `${event.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-600">
                  Add some important dates to see upcoming events!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nudge Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Bell className="h-5 w-5 text-rose-500" />
              Reminder Settings
            </CardTitle>
            <CardDescription>
              {getNudgeFrequencyName(relationship?.reminder_frequency || 'weekly')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-center space-y-4">
            <div>
              <div className="text-sm font-semibold text-rose-600 mb-1">
                Next nudge coming on:
              </div>
              <div className="text-lg font-bold text-rose-700 mb-2">
                {getNextNudgeDate(relationship?.reminder_frequency || 'weekly')}
              </div>
              <p className="text-sm text-rose-500">
                We'll send you a gentle reminder to show some love! 💌
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Add Someone Else */}
      <Card 
        className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer group bg-gradient-to-r from-rose-25 to-pink-25"
        onClick={() => recordThoughtfulAction('add_person_clicked', 'Clicked to add another person')}
      >
        <CardContent className="p-6 text-center">
          <Plus className="h-8 w-8 text-rose-400 mx-auto mb-3 group-hover:text-rose-500 transition-colors" />
          <h3 className="font-semibold text-rose-800 mb-2 text-lg">
            Add someone else you care about
          </h3>
          <p className="text-rose-600">
            Family, friends, or other special people in your life
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
