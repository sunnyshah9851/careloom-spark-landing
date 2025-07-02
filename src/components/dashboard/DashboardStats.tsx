
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

  // Calculate streak and achievements
  const calculateConnectionStreak = () => {
    const sortedNudges = relationships
      .filter(r => r.last_nudge_sent)
      .map(r => new Date(r.last_nudge_sent!))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedNudges.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    for (const nudgeDate of sortedNudges) {
      const daysDiff = Math.floor((today.getTime() - nudgeDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff <= 7) streak++;
      else break;
    }
    
    return streak;
  };

  const connectionStreak = calculateConnectionStreak();
  const hasActiveRelationships = relationships.some(r => 
    r.last_nudge_sent && 
    (Date.now() - new Date(r.last_nudge_sent).getTime()) < 30 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-2 border-rose-100 bg-gradient-to-br from-rose-50/50 to-cream-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connection Streak</CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-lg">🔥</span>
            {connectionStreak > 0 && <span className="text-xs bg-rose-500 text-white rounded-full px-2 py-0.5">Active</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{connectionStreak}</div>
          <p className="text-xs text-muted-foreground">
            {connectionStreak === 0 ? 'Start your streak today!' : 'Week streak - keep it going!'}
          </p>
        </CardContent>
      </Card>

      <Card className={hasActiveRelationships ? "border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50" : ""}>
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
            {stats.thoughtfulActions === 0 ? 'Send your first nudge!' : 'Ways you\'ve shown love'}
          </p>
        </CardContent>
      </Card>

      <Card className={stats.daysToNextEvent <= 7 ? "border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Event</CardTitle>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-rose-500" />
            {stats.daysToNextEvent <= 7 && stats.daysToNextEvent > 0 && 
              <span className="text-xs bg-amber-500 text-white rounded-full px-2 py-0.5">Soon!</span>
            }
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">
            {stats.daysToNextEvent === 0 ? 'Today! 🎉' : 
             stats.daysToNextEvent === Infinity ? 'None' :
             `${stats.daysToNextEvent} days`}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.daysToNextEvent === 0 ? 'Make it special!' :
             stats.daysToNextEvent === Infinity ? 'Add important dates' :
             'Until your next special moment'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
