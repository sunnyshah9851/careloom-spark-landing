import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail } from 'lucide-react';
import { UpcomingEvent } from '@/hooks/useRelationships';

interface UpcomingEventsCardProps {
  events: UpcomingEvent[];
}

export const UpcomingEventsCard = ({ events }: UpcomingEventsCardProps) => {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming birthdays or anniversaries in the next 30 days.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events (Next 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-4 rounded-lg border transition-colors ${
              event.shouldSendReminder
                ? 'bg-primary/5 border-primary'
                : event.daysUntil <= 7
                ? 'bg-warning/5 border-warning'
                : 'bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">{event.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {event.type === 'birthday' ? '🎂 Birthday' : '💕 Anniversary'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {event.shouldSendReminder && (
                  <Badge variant="default" className="gap-1">
                    <Mail className="h-3 w-3" />
                    Reminder Active
                  </Badge>
                )}
                <Badge variant={event.daysUntil <= 7 ? 'destructive' : 'secondary'} className="gap-1">
                  <Clock className="h-3 w-3" />
                  {event.daysUntil === 0 ? 'Today!' : `${event.daysUntil} days`}
                </Badge>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Event Date:</span> {new Date(event.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Reminder Frequency:</span> {event.frequency.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium">Reminder Date:</span> {new Date(event.reminderDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                {event.shouldSendReminder ? (
                  <span className="text-primary font-medium">Ready to send</span>
                ) : event.daysUntil <= 7 ? (
                  <span className="text-warning font-medium">Upcoming</span>
                ) : (
                  <span>Scheduled</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};