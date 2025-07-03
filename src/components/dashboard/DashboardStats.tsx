
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Clock, TrendingUp } from 'lucide-react';

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

interface DashboardStatsProps {
  relationships: Relationship[];
}

const DashboardStats = ({ relationships }: DashboardStatsProps) => {
  const calculateStats = () => {
    const today = new Date();
    let daysTogether = 0;
    let daysToNextEvent = Infinity;

    relationships.forEach(relationship => {
      // Calculate days together from anniversary
      if (relationship.anniversary) {
        const anniversaryDate = new Date(relationship.anniversary);
        const diffTime = today.getTime() - anniversaryDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > daysTogether) {
          daysTogether = diffDays;
        }
      }

      // Find next upcoming event
      [relationship.birthday, relationship.anniversary].forEach(dateStr => {
        if (dateStr) {
          const eventDate = new Date(dateStr);
          const currentYear = today.getFullYear();
          const thisYearEvent = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());
          const nextYearEvent = new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate());
          
          const nextOccurrence = thisYearEvent >= today ? thisYearEvent : nextYearEvent;
          const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil < daysToNextEvent) {
            daysToNextEvent = daysUntil;
          }
        }
      });
    });

    return {
      daysTogether: Math.max(0, daysTogether),
      thoughtfulActions: relationships.filter(r => r.last_nudge_sent).length,
      daysToNextEvent: daysToNextEvent === Infinity ? 0 : daysToNextEvent
    };
  };

  const stats = calculateStats();

  const calculateConnectionStreak = () => {
    const sortedNudges = relationships
      .filter(r => r.last_nudge_sent)
      .map(r => new Date(r.last_nudge_sent!))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedNudges.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (const nudgeDate of sortedNudges) {
      const daysDiff = Math.floor((today.getTime() - nudgeDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff <= 7) streak++;
      else break;
    }
    
    return streak;
  };

  const connectionStreak = calculateConnectionStreak();

  const statCards = [
    {
      title: 'Total Relationships',
      value: relationships.length,
      subtitle: relationships.length === 0 ? 'Start adding people' : 'People in your circle',
      icon: Heart,
      color: 'text-gray-900'
    },
    {
      title: 'Connection Streak',
      value: connectionStreak,
      subtitle: connectionStreak === 0 ? 'Start your streak' : 'Week streak active',
      icon: TrendingUp,
      color: 'text-gray-900'
    },
    {
      title: 'Days Together',
      value: stats.daysTogether,
      subtitle: stats.daysTogether === 0 ? 'Add anniversary dates' : 'Beautiful moments shared',
      icon: Clock,
      color: 'text-gray-900'
    },
    {
      title: 'Next Event',
      value: stats.daysToNextEvent === 0 ? 'Today!' : 
             stats.daysToNextEvent === Infinity ? 'None' :
             `${stats.daysToNextEvent} days`,
      subtitle: stats.daysToNextEvent === 0 ? 'Make it special!' :
               stats.daysToNextEvent === Infinity ? 'Add important dates' :
               'Until next celebration',
      icon: Calendar,
      color: 'text-gray-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
