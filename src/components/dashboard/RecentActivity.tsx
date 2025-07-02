
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, UserPlus, Mail, Calendar, Heart } from 'lucide-react';
import { useEvents, Event } from '@/hooks/useEvents';

const RecentActivity = () => {
  const { getRecentEvents, isLoading, error } = useEvents();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const recentEvents = await getRecentEvents(7);
      setEvents(recentEvents);
    };

    fetchEvents();
  }, []);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'relationship_added':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'nudge_requested':
        return <Mail className="h-4 w-4 text-green-600" />;
      case 'birthday_reminder_sent':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'anniversary_reminder_sent':
        return <Heart className="h-4 w-4 text-rose-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventDescription = (event: Event) => {
    const relationshipName = (event as any).relationships?.name || 'Unknown';

    switch (event.event_type) {
      case 'relationship_added':
        return `Added ${relationshipName} to your circle`;
      case 'nudge_requested':
        return `Requested personalized date ideas via nudge`;
      case 'birthday_reminder_sent':
        return `Birthday reminder sent for ${relationshipName}`;
      case 'anniversary_reminder_sent':
        return `Anniversary reminder sent for ${relationshipName}`;
      default:
        return `${event.event_type.replace('_', ' ')} event`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-800">
            <Activity className="h-5 w-5 text-rose-500" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-rose-800">Your recent relationship activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <Activity className="h-5 w-5 text-rose-500" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-rose-800">Your recent relationship activities from the last week</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        
        {events.length === 0 ? (
          <p className="text-rose-700 text-center py-8 font-medium">
            No recent activity. Start by adding relationships or sending nudges!
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg">
                <div className="p-2 rounded-full bg-white">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-rose-900 text-sm">
                    {getEventDescription(event)}
                  </p>
                  <p className="text-xs text-rose-600 mt-1">
                    {formatDate(event.created_at)}
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

export default RecentActivity;
