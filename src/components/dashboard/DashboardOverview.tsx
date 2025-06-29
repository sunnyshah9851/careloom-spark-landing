
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import TryNudgeCard from './TryNudgeCard';
import AddRelationshipCard from './AddRelationshipCard';

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

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
}

interface DashboardOverviewProps {
  relationships: Relationship[];
  profile: Profile | null;
}

const DashboardOverview = ({ relationships, profile }: DashboardOverviewProps) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! 💕
        </h1>
        <p className="text-rose-600 text-lg">
          Here's what's happening in your relationships
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <DashboardStats relationships={relationships} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-1 xl:col-span-2">
          <UpcomingEvents relationships={relationships} />
        </div>

        {/* Try Nudge Card */}
        <div>
          <TryNudgeCard relationships={relationships} />
        </div>

        {/* Add Relationship Card */}
        <div>
          <AddRelationshipCard />
        </div>

        {/* Recent Activity Placeholder */}
        <div className="lg:col-span-1 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-800">
                <span className="text-2xl">📝</span>
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest relationship interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌟</div>
                <p className="text-gray-600">No recent activities yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Send a nudge or add events to see activity here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
