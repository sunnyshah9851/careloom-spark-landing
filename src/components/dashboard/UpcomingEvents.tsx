
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart } from 'lucide-react';

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

interface Event {
  type: 'birthday' | 'anniversary';
  name: string;
  date: string;
  daysUntil: number;
}

interface UpcomingEventsProps {
  relationships: Relationship[];
}

const UpcomingEvents = ({ relationships }: UpcomingEventsProps) => {
  const calculateUpcomingEvents = (): Event[] => {
    const events: Event[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30); // Next 30 days

    console.log('Today:', today.toISOString());
    console.log('One month from now:', oneMonthFromNow.toISOString());

    const getDaysUntil = (eventDate: Date) => {
      const diffTime = eventDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getNextOccurrence = (dateString: string) => {
      const date = new Date(dateString);
      const currentYear = today.getFullYear();
      const thisYear = new Date(currentYear, date.getMonth(), date.getDate());
      thisYear.setHours(0, 0, 0, 0);
      
      // If this year's date has passed, use next year
      if (thisYear < today) {
        const nextYear = new Date(currentYear + 1, date.getMonth(), date.getDate());
        nextYear.setHours(0, 0, 0, 0);
        return nextYear;
      }
      
      return thisYear;
    };

    const isWithinNext30Days = (eventDate: Date) => {
      return eventDate >= today && eventDate <= oneMonthFromNow;
    };

    relationships.forEach(relationship => {
      console.log('Processing relationship:', relationship.name);
      
      // Add birthday
      if (relationship.birthday) {
        const nextBirthday = getNextOccurrence(relationship.birthday);
        console.log(`${relationship.name}'s birthday:`, nextBirthday.toISOString(), 'Within 30 days:', isWithinNext30Days(nextBirthday));
        
        if (isWithinNext30Days(nextBirthday)) {
          events.push({
            type: 'birthday',
            name: `${relationship.name}'s Birthday`,
            date: nextBirthday.toISOString(),
            daysUntil: getDaysUntil(nextBirthday)
          });
        }
      }

      // Add anniversary
      if (relationship.anniversary) {
        const nextAnniversary = getNextOccurrence(relationship.anniversary);
        console.log(`${relationship.name}'s anniversary:`, nextAnniversary.toISOString(), 'Within 30 days:', isWithinNext30Days(nextAnniversary));
        
        if (isWithinNext30Days(nextAnniversary)) {
          events.push({
            type: 'anniversary',
            name: `${relationship.name} Anniversary`,
            date: nextAnniversary.toISOString(),
            daysUntil: getDaysUntil(nextAnniversary)
          });
        }
      }
    });

    console.log('Final events:', events);
    return events.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const events = calculateUpcomingEvents();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-rose-500" />
          Upcoming Events This Month
        </CardTitle>
        <CardDescription>
          Special moments in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-rose-700 text-center py-4 font-medium">
            No events in the next month. Add your relationship details to see upcoming birthdays and anniversaries!
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${event.type === 'anniversary' ? 'bg-rose-200' : 'bg-blue-200'}`}>
                    {event.type === 'anniversary' ? (
                      <Heart className="h-4 w-4 text-rose-600" />
                    ) : (
                      <Calendar className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-rose-900">{event.name}</p>
                    <p className="text-sm text-rose-600">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-rose-700">
                    {event.daysUntil === 0 ? 'Today!' : 
                     event.daysUntil === 1 ? 'Tomorrow' : 
                     `${event.daysUntil} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
