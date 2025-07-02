import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import TryNudgeCard from './TryNudgeCard';
import RecentActivity from './RecentActivity';
import AddRelationshipCard from './AddRelationshipCard';
import ThoughtfulnessScore from './ThoughtfulnessScore';

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
    <div className="p-6 space-y-6">
      {/* Header with prominent Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard{profile?.full_name ? ` - ${profile.full_name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {relationships.length > 0 
              ? `Managing ${relationships.length} ${relationships.length === 1 ? 'relationship' : 'relationships'}` 
              : "Start building meaningful connections"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddRelationshipCard onRelationshipAdded={handleRelationshipAdded} />
        </div>
      </div>

      {/* Top Row - Secondary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ThoughtfulnessScore relationships={relationships} />
        <RecentActivity />
        <DashboardStats relationships={relationships} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Events */}
        <UpcomingEvents relationships={relationships} />
        
        {/* Right Column - Actions */}
        {relationships.length > 0 && (
          <TryNudgeCard relationships={relationships} onNudgeSent={handleNudgeSent} />
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
