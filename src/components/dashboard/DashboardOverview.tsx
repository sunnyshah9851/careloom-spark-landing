
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import TryNudgeCard from './TryNudgeCard';
import RecentActivity from './RecentActivity';
import AddRelationshipForm from './AddRelationshipForm';
import ThoughtfulnessScore from './ThoughtfulnessScore';
import { Plus, Users, Calendar, Heart } from 'lucide-react';
import { useState } from 'react';

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
  const [showAddForm, setShowAddForm] = useState(false);

  const handleNudgeSent = () => {
    // Force a refresh of the recent activity
    window.location.reload();
  };

  const handleRelationshipAdded = () => {
    setShowAddForm(false);
    // Force a refresh of the recent activity and relationships
    window.location.reload();
  };

  if (showAddForm) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="shadow-lg border-2 border-rose-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-playfair text-rose-800">
                  Add Someone Special
                </CardTitle>
                <CardDescription className="text-rose-600 mt-1">
                  Tell us about someone important in your life
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AddRelationshipForm 
              onSuccess={handleRelationshipAdded} 
              onCancel={() => setShowAddForm(false)} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full">
            <Heart className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-3xl font-bold font-playfair text-gray-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h1>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {relationships.length > 0 
            ? `You're nurturing ${relationships.length} meaningful ${relationships.length === 1 ? 'relationship' : 'relationships'}` 
            : "Start building meaningful connections with the people you care about"}
        </p>

        <Button 
          onClick={() => setShowAddForm(true)}
          size="lg"
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Someone Special
        </Button>
      </div>

      {relationships.length === 0 ? (
        <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No relationships yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first relationship to start tracking important dates and staying connected
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Relationships</p>
                    <p className="text-3xl font-bold text-emerald-700">{relationships.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Upcoming Events</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {relationships.filter(r => r.birthday || r.anniversary).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Recent Nudges</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {relationships.filter(r => r.last_nudge_sent).length}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <UpcomingEvents relationships={relationships} />
              <RecentActivity />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ThoughtfulnessScore relationships={relationships} />
              {relationships.length > 0 && (
                <TryNudgeCard relationships={relationships} onNudgeSent={handleNudgeSent} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;
