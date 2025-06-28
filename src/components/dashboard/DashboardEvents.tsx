
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UpcomingEvents from './UpcomingEvents';

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

interface DashboardEventsProps {
  relationships: Relationship[];
  profile: Profile | null;
}

const DashboardEvents = ({ relationships, profile }: DashboardEventsProps) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (relationships.length > 0) {
      calculateUpcomingEvents();
    }
  }, [relationships]);

  const calculateUpcomingEvents = () => {
    const events: Event[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    const getDaysUntil = (eventDate: Date) => {
      const diffTime = eventDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

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

    events.sort((a, b) => a.daysUntil - b.daysUntil);
    setUpcomingEvents(events);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Upcoming Events
        </h1>
        <p className="text-rose-600 text-lg">
          Never miss another special moment
        </p>
      </div>

      <UpcomingEvents events={upcomingEvents} />
    </div>
  );
};

export default DashboardEvents;
