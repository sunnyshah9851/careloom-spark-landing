
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Clock } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Days Together</CardTitle>
          <Clock className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{stats.daysTogether}</div>
          <p className="text-xs text-muted-foreground">
            {stats.daysTogether === 0 ? 'Add your anniversary to see this!' : 'Beautiful moments shared'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thoughtful Actions</CardTitle>
          <Heart className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{stats.thoughtfulActions}</div>
          <p className="text-xs text-muted-foreground">
            Ways you've shown love
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Event</CardTitle>
          <Calendar className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">
            {stats.daysToNextEvent === 0 ? 'Today!' : `${stats.daysToNextEvent} days`}
          </div>
          <p className="text-xs text-muted-foreground">
            Until your next special moment
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
