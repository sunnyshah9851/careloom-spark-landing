
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart } from 'lucide-react';

interface Event {
  type: 'birthday' | 'anniversary';
  name: string;
  date: string;
  daysUntil: number;
}

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
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
          Upcoming Events
        </CardTitle>
        <CardDescription>
          Never miss a special moment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No upcoming events. Add your relationship details to see upcoming birthdays and anniversaries!
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
