
import { useState } from 'react';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import RelationshipHealthCard from './RelationshipHealthCard';
import AddRelationshipCard from './AddRelationshipCard';
import AddRelationshipForm from './AddRelationshipForm';
import UpcomingEventsTable from './UpcomingEventsTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, Sparkles } from 'lucide-react';
import DashboardMiniCalendar from './DashboardMiniCalendar';

interface DashboardOverviewProps {
  relationships: any[];
  profile: any;
  onRefresh?: () => void;
}

export default function DashboardOverview({ relationships, profile, onRefresh }: DashboardOverviewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const hasRelationships = relationships && relationships.length > 0;
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'there';

  const handleAddRelationshipSuccess = () => {
    setShowAddForm(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/50 border-b border-blue-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Here's what's happening with your relationships
              </p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-6 w-6 mr-3" />
              Add Relationship
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        
        {hasRelationships && (
        <div className="mb-12">
          <DashboardStats relationships={relationships} />
        </div>
      )}

        {hasRelationships && (
        <div className="mb-12">
          <UpcomingEventsTable relationships={relationships} />
        </div>
      )}



        {hasRelationships ? (
          /* Content for users with relationships */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-t-2xl">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                    Recent Activity
                  </h2>
                  <p className="text-gray-600 text-lg">Your latest interactions and memories</p>
                </div>
                <div className="p-8">
                  <RecentActivity />
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-8">
                  <DashboardMiniCalendar relationships={relationships} />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-8">
                  <RelationshipHealthCard relationships={relationships} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state for new users */
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
                Start Building Your Circle
              </h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                Add the important people in your life to never miss a special moment or opportunity to connect. 
                Your relationships are the foundation of meaningful memories.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50 shadow-lg">
                <AddRelationshipCard />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Relationship Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
          <DialogHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-rose-600" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-rose-800 bg-clip-text text-transparent">
              Add New Relationship
            </DialogTitle>
          </DialogHeader>
          <AddRelationshipForm
            onSuccess={handleAddRelationshipSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
