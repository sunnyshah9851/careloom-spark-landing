
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import RecentActivity from './RecentActivity';
import ThoughtfulnessScore from './ThoughtfulnessScore';
import RelationshipHealthCard from './RelationshipHealthCard';
import AddRelationshipCard from './AddRelationshipCard';

interface DashboardOverviewProps {
  relationships: any[];
  profile: any;
}

export default function DashboardOverview({ relationships, profile }: DashboardOverviewProps) {
  const hasRelationships = relationships && relationships.length > 0;
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold font-playfair text-rose-700">
          Welcome back, {userName}!
        </h2>
        <p className="text-rose-500">
          Here's a snapshot of your relationships and upcoming events.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats relationships={relationships} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <UpcomingEvents relationships={relationships} />
          {!hasRelationships && (
            <AddRelationshipCard />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecentActivity />
          <ThoughtfulnessScore relationships={relationships} />
          <RelationshipHealthCard relationships={relationships} />
        </div>
      </div>
    </div>
  );
}
