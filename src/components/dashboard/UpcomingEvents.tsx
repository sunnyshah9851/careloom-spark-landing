
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, Gift } from 'lucide-react';
import { parse } from 'date-fns';

interface Relationship {
  id: string;
  profile_id: string;
  relationship_type: string;
  name: string;
  email?: string;
  phone_number?: string;
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
  // Use date-fns parse to create a proper local date from YYYY-MM-DD format
  const originalDate = parse(dateString, 'yyyy-MM-dd', new Date());
  const currentYear = today.getFullYear();
  
  // Create this year's occurrence
  const thisYear = new Date(currentYear, originalDate.getMonth(), originalDate.getDate());
  thisYear.setHours(0, 0, 0, 0);
  
  if (thisYear < today) {
    // Event already passed this year, get next year's occurrence
    const nextYear = new Date(currentYear + 1, originalDate.getMonth(), originalDate.getDate());
    nextYear.setHours(0, 0, 0, 0);
    return nextYear;
  }
  
  return thisYear;
};

  const isWithinNext30Days = (eventDate: Date) => {
    return eventDate >= today && eventDate <= oneMonthFromNow;
  };

  const formatAsLocalYMD = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  relationships.forEach((relationship) => {
    // Birthday
    if (relationship.birthday) {
      const nextBirthday = getNextOccurrence(relationship.birthday);

      if (isWithinNext30Days(nextBirthday)) {
        events.push({
          type: 'birthday',
          name: `${relationship.name}'s Birthday`,
          date: formatAsLocalYMD(nextBirthday),
          daysUntil: getDaysUntil(nextBirthday),
        });
      }
    }

    // Anniversary
    if (relationship.anniversary) {
      const nextAnniversary = getNextOccurrence(relationship.anniversary);

      if (isWithinNext30Days(nextAnniversary)) {
        events.push({
          type: 'anniversary',
          name: `${relationship.name} Anniversary`,
          date: formatAsLocalYMD(nextAnniversary), // <-- fixed
          daysUntil: getDaysUntil(nextAnniversary),
        });
      }
    }
  });

  return events.sort((a, b) => a.daysUntil - b.daysUntil);
};


  const events = calculateUpcomingEvents();

  const formatDate = (dateString: string) => {
  // Use date-fns parse to ensure consistent date handling
  return parse(dateString, 'yyyy-MM-dd', new Date()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
};


  return (
    <Card className="shadow-lg border border-border/20 bg-gradient-to-br from-background via-background to-accent/5 card-hover backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
          <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Important dates in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-2">
              No upcoming events
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      event.type === 'anniversary' 
                        ? 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 border border-rose-200/50' 
                        : 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 border border-amber-200/50'
                    }`}>
                      {event.type === 'anniversary' ? (
                        <Heart className="h-5 w-5" />
                      ) : (
                        <Gift className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.daysUntil === 0 
                      ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                      : event.daysUntil <= 3 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-primary/10 text-primary border border-primary/20'
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
