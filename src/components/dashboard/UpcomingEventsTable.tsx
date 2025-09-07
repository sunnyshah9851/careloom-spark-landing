import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, Gift, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { format, addYears, isAfter, isBefore, startOfDay } from 'date-fns';

interface Relationship {
  id: string;
  name: string;
  phone_number?: string;
  birthday?: string;
  anniversary?: string;
  birthday_notification_frequency?: string;
  anniversary_notification_frequency?: string;
  relationship_type?: string;
}

interface UpcomingEvent {
  id: string;
  name: string;
  type: 'birthday' | 'anniversary';
  date: Date;
  daysUntil: number;
  relationshipType: string;
  notificationFrequency: string;
}

interface UpcomingEventsTableProps {
  relationships: Relationship[];
}

const parseYMDLocal = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const UpcomingEventsTable = ({ relationships }: UpcomingEventsTableProps) => {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    if (!relationships || relationships.length === 0) {
      setUpcomingEvents([]);
      return;
    }

    const events: UpcomingEvent[] = [];
    const today = startOfDay(new Date());
    const nextYear = addYears(today, 1);

    relationships.forEach(relationship => {
      // Process birthdays
      if (relationship.birthday) {
        const birthday = relationship.birthday ? parseYMDLocal(relationship.birthday) : null;
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
        
        // Determine which birthday to show
        let nextBirthday = thisYearBirthday;
        if (isBefore(thisYearBirthday, today)) {
          nextBirthday = nextYearBirthday;
        }

        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only show events within the next 30 days
        if (daysUntil >= 0 && daysUntil <= 30) {
          events.push({
            id: `${relationship.id}-birthday`,
            name: relationship.name,
            type: 'birthday',
            date: nextBirthday,
            daysUntil,
            relationshipType: relationship.relationship_type || 'unknown',
            notificationFrequency: relationship.birthday_notification_frequency || 'none'
          });
        }
      }

      // Process anniversaries
      if (relationship.anniversary) {
        const anniversary = relationship.anniversary ? parseYMDLocal(relationship.anniversary) : null;
        const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        const nextYearAnniversary = new Date(today.getFullYear() + 1, anniversary.getMonth(), anniversary.getDate());
        
        // Determine which anniversary to show
        let nextAnniversary = thisYearAnniversary;
        if (isBefore(thisYearAnniversary, today)) {
          nextAnniversary = nextYearAnniversary;
        }

        const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only show events within the next 90 days
        if (daysUntil >= 0 && daysUntil <= 30) {
          events.push({
            id: `${relationship.id}-anniversary`,
            name: relationship.name,
            type: 'anniversary',
            date: nextAnniversary,
            daysUntil,
            relationshipType: relationship.relationship_type || 'unknown',
            notificationFrequency: relationship.anniversary_notification_frequency || 'none'
          });
        }
      }
    });

    // Sort by days until event (closest first)
    events.sort((a, b) => a.daysUntil - b.daysUntil);
    setUpcomingEvents(events);
  }, [relationships]);

  const getDaysUntilText = (days: number) => {
    if (days === 0) return { 
      text: 'Today! 🎉', 
      className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg',
      icon: <Sparkles className="h-3 w-3" />
    };
    if (days === 1) return { 
      text: 'Tomorrow', 
      className: 'bg-gradient-to-r from-orange-400 to-red-400 text-white border-0 shadow-md',
      icon: <Clock className="h-3 w-3" />
    };
    if (days <= 7) return { 
      text: `${days} days`, 
      className: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-sm',
      icon: <Clock className="h-3 w-3" />
    };
    if (days <= 30) return { 
      text: `${days} days`, 
      className: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white border-0 shadow-sm',
      icon: <Clock className="h-3 w-3" />
    };
    return { 
      text: `${days} days`, 
      className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm',
      icon: <Clock className="h-3 w-3" />
    };
  };

  const getEventIcon = (type: 'birthday' | 'anniversary') => {
    if (type === 'birthday') {
      return (
        <div className="p-3 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-200">
          <Gift className="h-6 w-6 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="p-3 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200">
        <Heart className="h-6 w-6 text-rose-600" />
      </div>
    );
  };

  const getNotificationStatus = (frequency: string) => {
    if (frequency === 'none') return { text: 'Disabled', className: 'text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs' };
    if (frequency === '1_day') return { text: '1 day before', className: 'text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs' };
    if (frequency === '3_days') return { text: '3 days before', className: 'text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs' };
    if (frequency === '1_week') return { text: '1 week before', className: 'text-purple-700 bg-purple-100 px-2 py-1 rounded-full text-xs' };
    if (frequency === '2_weeks') return { text: '2 weeks before', className: 'text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full text-xs' };
    if (frequency === '1_month') return { text: '1 month before', className: 'text-orange-700 bg-orange-100 px-2 py-1 rounded-full text-xs' };
    return { text: frequency, className: 'text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs' };
  };

  if (!relationships || relationships.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-10 w-10 text-gray-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-700 mb-2">
            Upcoming Events
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Add relationships with birthdays and anniversaries to see upcoming events
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <p className="text-gray-500 font-medium mb-2">No upcoming events</p>
          <p className="text-sm text-gray-400">
            Add birthdays and anniversaries to your relationships to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-700 mb-2">
            Upcoming Events
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Your upcoming birthdays and anniversaries
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <p className="text-gray-500 font-medium mb-2">No events in the next 30 days</p>
          <p className="text-sm text-gray-400">
            Events will appear here when they're within 30 days
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Calendar className="h-6 w-6" />
          </div>
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-blue-100 text-lg">
          Your upcoming birthdays and anniversaries for the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Event</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Time Until</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Reminders</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingEvents.map((event, index) => {
                  const daysUntilInfo = getDaysUntilText(event.daysUntil);
                  const notificationInfo = getNotificationStatus(event.notificationFrequency);
                  
                  return (
                    <tr 
                      key={event.id} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          {getEventIcon(event.type)}
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{event.name}</p>
                            <p className="text-sm text-gray-500 capitalize font-medium">
                              {event.relationshipType} • {event.type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="text-center">
                          <div className="text-gray-900 font-bold text-lg">
                            {format(event.date, 'MMM d')}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            {format(event.date, 'EEEE')}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          {daysUntilInfo.icon}
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${daysUntilInfo.className}`}>
                            {daysUntilInfo.text}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`font-medium ${notificationInfo.className}`}>
                          {notificationInfo.text}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          {event.type === 'birthday' ? (
                            <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full border border-amber-200">
                              <Gift className="h-5 w-5 text-amber-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full border border-rose-200">
                              <Heart className="h-5 w-5 text-rose-600" />
                            </div>
                          )}
                          <span className="text-sm text-gray-600 capitalize font-medium">
                            {event.type}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {upcomingEvents.length > 0 && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-2 text-lg">Reminder Settings</p>
                  <p className="text-blue-700 leading-relaxed">
                    You can customize when reminders are sent for each relationship in the People tab.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsTable; 
