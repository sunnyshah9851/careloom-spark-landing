
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import TryNudgeCard from './TryNudgeCard';
import RecentActivity from './RecentActivity';
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
  const handleNudgeSent = () => {
    // Force a refresh of the recent activity
    window.location.reload();
  };

  const handleRelationshipAdded = () => {
    // Force a refresh of the recent activity and relationships
    window.location.reload();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-rose-600 text-lg">
          Here's what's happening with your relationships
        </p>
      </div>

      <DashboardStats relationships={relationships} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <UpcomingEvents relationships={relationships} />
          <TryNudgeCard relationships={relationships} onNudgeSent={handleNudgeSent} />
          <AddRelationshipCard onRelationshipAdded={handleRelationshipAdded} />
        </div>
        
        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
