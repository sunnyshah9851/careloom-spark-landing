
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import RecentActivity from './RecentActivity';
import ThoughtfulnessScore from './ThoughtfulnessScore';
import RelationshipHealthCard from './RelationshipHealthCard';
import AddRelationshipCard from './AddRelationshipCard';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

interface DashboardOverviewProps {
  relationships: any[];
  profile: any;
}

export default function DashboardOverview({ relationships, profile }: DashboardOverviewProps) {
  const hasRelationships = relationships && relationships.length > 0;
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your relationships
              </p>
            </div>
            <Button 
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Relationship
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="mb-8">
          <DashboardStats relationships={relationships} />
        </div>

        {hasRelationships ? (
          /* Content for users with relationships */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                  <p className="text-gray-600 text-sm mt-1">Important dates coming up</p>
                </div>
                <div className="p-6">
                  <UpcomingEvents relationships={relationships} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-600 text-sm mt-1">Your latest interactions</p>
                </div>
                <div className="p-6">
                  <RecentActivity />
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  <ThoughtfulnessScore relationships={relationships} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  <RelationshipHealthCard relationships={relationships} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state for new users */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Building Your Circle
              </h2>
              <p className="text-gray-600 mb-8">
                Add the important people in your life to never miss a special moment or opportunity to connect.
              </p>
              <AddRelationshipCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
