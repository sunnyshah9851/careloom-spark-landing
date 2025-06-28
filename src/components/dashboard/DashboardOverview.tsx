
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Lightbulb, Bell, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TryNudgeCard from './TryNudgeCard';

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
}

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
}

interface Event {
  type: 'birthday' | 'anniversary';
  name: string;
  date: string;
  daysUntil: number;
  relationshipType: string;
}

interface DashboardOverviewProps {
  relationships: Relationship[];
  profile: Profile | null;
}

const DashboardOverview = ({ relationships, profile }: DashboardOverviewProps) => {
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
    if (relationships.length > 0) {
      calculateUpcomingEvents();
    }
  }, [relationships]);

  const recordEvent = async (eventType: string, relationshipId?: string, metadata?: any) => {
    if (!user || !relationshipId) return;

    console.log('Recording event:', eventType, relationshipId, metadata);

    const { error } = await supabase
      .from('events')
      .insert({
        relationship_id: relationshipId,
        event_type: eventType,
        metadata: metadata
      });

    if (error) {
      console.error('Error recording event:', error);
    } else {
      console.log('Event recorded successfully');
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

    relationships.forEach(relationship => {
      // Add birthday
      if (relationship.birthday) {
        const nextBirthday = getNextOccurrence(relationship.birthday);
        events.push({
          type: 'birthday',
          name: `${relationship.name}'s Birthday`,
          date: nextBirthday.toISOString(),
          daysUntil: getDaysUntil(nextBirthday),
          relationshipType: relationship.relationship_type
        });
      }

      // Add anniversary
      if (relationship.anniversary) {
        const nextAnniversary = getNextOccurrence(relationship.anniversary);
        events.push({
          type: 'anniversary',
          name: `${relationship.name} Anniversary`,
          date: nextAnniversary.toISOString(),
          daysUntil: getDaysUntil(nextAnniversary),
          relationshipType: relationship.relationship_type
        });
      }
    });

    // Sort by days until event
    events.sort((a, b) => a.daysUntil - b.daysUntil);
    setUpcomingEvents(events);
  };

  const handleViewSuggestion = async () => {
    if (!hasViewedSuggestion && relationships.length > 0) {
      await recordEvent('suggestion_viewed', relationships[0].id, { suggestion: todaysSuggestion });
      setHasViewedSuggestion(true);
    }
  };

  const nextEvent = upcomingEvents[0];
  const primaryRelationship = relationships.find(r => r.relationship_type === 'partner') || relationships[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-playfair font-bold text-rose-800">
          Your Relationship Dashboard
        </h1>
        <p className="text-xl text-rose-600">
          Keep track of the moments that matter most
        </p>
      </div>

      {/* Next Event Highlight */}
      {nextEvent && (
        <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 border-rose-200 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-6xl">
                  {nextEvent.type === 'birthday' ? '🎂' : '💖'}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-rose-800 mb-2">
                    {nextEvent.name}
                  </h2>
                  <p className="text-lg text-rose-600 mb-1">
                    {new Date(nextEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-rose-500 capitalize">
                    {nextEvent.relationshipType}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-rose-700 mb-1">
                  {nextEvent.daysUntil === 0 ? 'Today!' : `${nextEvent.daysUntil} days`}
                </div>
                <p className="text-rose-500">to go</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Try Nudge Card */}
        <div className="lg:col-span-2">
          <TryNudgeCard 
            partnerName={primaryRelationship?.name}
            onNudgeSent={() => primaryRelationship && recordEvent('nudge_requested', primaryRelationship.id, { description: 'Requested personalized date ideas via email' })}
          />
        </div>

        {/* Today's Suggestion */}
        <Card className="h-fit shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-rose-800 text-xl">
              <Lightbulb className="h-6 w-6 text-rose-500" />
              Today's Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-rose-700 leading-relaxed mb-4 text-lg">
              {todaysSuggestion}
            </p>
            {!hasViewedSuggestion ? (
              <button
                onClick={handleViewSuggestion}
                className="text-rose-500 hover:text-rose-700 underline transition-colors font-medium"
              >
                Mark as viewed
              </button>
            ) : (
              <p className="text-rose-400 italic">
                ✓ Viewed today
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Upcoming Events */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-rose-800 text-xl">
            <Calendar className="h-6 w-6" />
            All Upcoming Events
          </CardTitle>
          <CardDescription className="text-base">
            Never miss a special moment
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.slice(0, 6).map((event, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer shadow-sm"
                  onClick={() => recordEvent('event_acknowledged', relationships.find(r => r.name === event.name.split("'s")[0] || r.name === event.name.split(" Anniversary")[0])?.id, { event: event.name })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {event.type === 'birthday' ? '🎂' : '💖'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-rose-800 text-lg">{event.name}</h3>
                      <p className="text-rose-600">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-rose-500 capitalize">{event.relationshipType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-700 text-lg">
                      {event.daysUntil === 0 ? 'Today!' : `${event.daysUntil} days`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-rose-300 mx-auto mb-4" />
              <p className="text-rose-600 text-lg">
                Add some relationships with important dates to see upcoming events!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Someone Else */}
      <Card 
        className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer group bg-gradient-to-r from-rose-25 to-pink-25 shadow-md"
        onClick={() => primaryRelationship && recordEvent('add_person_clicked', primaryRelationship.id, { description: 'Clicked to add another person' })}
      >
        <CardContent className="p-8 text-center">
          <Plus className="h-12 w-12 text-rose-400 mx-auto mb-4 group-hover:text-rose-500 transition-colors" />
          <h3 className="font-semibold text-rose-800 mb-3 text-xl">
            Add someone else you care about
          </h3>
          <p className="text-rose-600 text-lg">
            Family, friends, or other special people in your life
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
