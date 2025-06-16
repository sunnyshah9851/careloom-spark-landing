
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, MessageSquare } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalNudges: number;
    anniversaryWishes: number;
    daysToNextEvent: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Nudges Sent</CardTitle>
          <MessageSquare className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{stats.totalNudges}</div>
          <p className="text-xs text-muted-foreground">
            Gentle reminders to show you care
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anniversary Wishes</CardTitle>
          <Heart className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{stats.anniversaryWishes}</div>
          <p className="text-xs text-muted-foreground">
            Special moments celebrated
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
