
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './DashboardStats';
import { Heart, Plus, Lightbulb, Bell } from 'lucide-react';

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
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    anniversaryWishes: 3,
    daysToNextEvent: 0
  });

  useEffect(() => {
    if (relationship) {
      calculateUpcomingEvents();
    }
  }, [relationship, profile]);

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Your Relationship Dashboard
        </h1>
        <p className="text-rose-600 text-lg">
          Keep track of the moments that matter most
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats stats={{
        daysTogether: getDaysTogether(),
        anniversaryWishes: stats.anniversaryWishes,
        daysToNextEvent: stats.daysToNextEvent
      }} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events - spans 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-rose-800">Upcoming Events</CardTitle>
              <CardDescription>
                Never miss a special moment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
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
                <p className="text-rose-600 text-center py-8">
                  Add some important dates to see upcoming events!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar with thoughtfulness score and suggestions */}
        <div className="space-y-6">
          {/* Nudge Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-800">
                <Bell className="h-5 w-5 text-rose-500" />
                {getNudgeFrequencyName(relationship?.reminder_frequency || 'weekly')}
              </CardTitle>
              <CardDescription>
                Your next thoughtful reminder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-lg font-semibold text-rose-600 mb-2">
                  Next nudge coming on:
                </div>
                <div className="text-2xl font-bold text-rose-700 mb-2">
                  {getNextNudgeDate(relationship?.reminder_frequency || 'weekly')}
                </div>
                <p className="text-sm text-rose-500">
                  We'll send you a gentle reminder to show some love! 💌
                </p>
              </div>
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
    </div>
  );
};

export default DashboardOverview;
