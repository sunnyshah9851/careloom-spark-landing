
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
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Calendar className="h-6 w-6 text-blue-600" />
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-base">
          Important dates in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium mb-2">
              No upcoming events
            </p>
            <p className="text-sm text-muted-foreground">
              Add birthdays and anniversaries to your relationships to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/70 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    event.type === 'anniversary' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {event.type === 'anniversary' ? (
                      <Heart className="h-5 w-5" />
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{event.name}</p>
                    <p className="text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.daysUntil === 0 
                      ? 'bg-red-100 text-red-700' 
                      : event.daysUntil <= 3 
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.daysUntil === 0 ? 'Today!' : 
                     event.daysUntil === 1 ? 'Tomorrow' : 
                     `${event.daysUntil} days`}
                  </div>
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
