
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, Gift } from 'lucide-react';

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
    today.setHours(0, 0, 0, 0);
    
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

    const getDaysUntil = (eventDate: Date) => {
      const diffTime = eventDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getNextOccurrence = (dateString: string) => {
      const date = new Date(dateString);
      const currentYear = today.getFullYear();
      const thisYear = new Date(currentYear, date.getMonth(), date.getDate());
      thisYear.setHours(0, 0, 0, 0);
      
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
      if (relationship.birthday) {
        const nextBirthday = getNextOccurrence(relationship.birthday);
        
        if (isWithinNext30Days(nextBirthday)) {
          events.push({
            type: 'birthday',
            name: `${relationship.name}'s Birthday`,
            date: nextBirthday.toISOString(),
            daysUntil: getDaysUntil(nextBirthday)
          });
        }
      }

      if (relationship.anniversary) {
        const nextAnniversary = getNextOccurrence(relationship.anniversary);
        
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
    <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-gray-600">
          Important dates in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-2">
              No upcoming events
            </p>
            <p className="text-sm text-gray-400">
              Add birthdays and anniversaries to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      event.type === 'anniversary' 
                        ? 'bg-rose-100 text-rose-600' 
                        : 'bg-amber-100 text-amber-600'
                    }`}>
                      {event.type === 'anniversary' ? (
                        <Heart className="h-5 w-5" />
                      ) : (
                        <Gift className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{event.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.daysUntil === 0 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : event.daysUntil <= 3 
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {event.daysUntil === 0 ? 'Today! 🎉' : 
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
