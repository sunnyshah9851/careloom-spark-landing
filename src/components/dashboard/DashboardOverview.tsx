import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './DashboardStats';
import UpcomingEvents from './UpcomingEvents';
import TryNudgeCard from './TryNudgeCard';
import RecentActivity from './RecentActivity';
import AddRelationshipCard from './AddRelationshipCard';
import ThoughtfulnessScore from './ThoughtfulnessScore';
import RelationshipHealthCard from './RelationshipHealthCard';

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

  // Calculate relationship health and recommendations
  const getRelationshipHealth = (relationship: Relationship) => {
    const daysSinceLastNudge = relationship.last_nudge_sent 
      ? Math.floor((Date.now() - new Date(relationship.last_nudge_sent).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceLastNudge <= 7) return { score: 100, status: 'excellent', color: 'text-emerald-600' };
    if (daysSinceLastNudge <= 14) return { score: 80, status: 'good', color: 'text-green-600' };
    if (daysSinceLastNudge <= 30) return { score: 60, status: 'fair', color: 'text-yellow-600' };
    return { score: 30, status: 'needs attention', color: 'text-red-600' };
  };

  const primaryRelationship = relationships[0];
  const relationshipHealth = primaryRelationship ? getRelationshipHealth(primaryRelationship) : null;

  const getRecommendations = () => {
    if (relationships.length === 0) {
      return ["Add your first relationship to get personalized connection ideas"];
    }
    
    const recommendations = [];
    const hasUpcomingEvents = relationships.some(r => r.birthday || r.anniversary);
    
    if (!hasUpcomingEvents) {
      recommendations.push("Add important dates to never miss celebrations");
    }
    
    const hasRecentNudge = relationships.some(r => 
      r.last_nudge_sent && 
      (Date.now() - new Date(r.last_nudge_sent).getTime()) < 7 * 24 * 60 * 60 * 1000
    );
    
    if (!hasRecentNudge) {
      recommendations.push("Send personalized connection ideas to strengthen your bonds");
    }
    
    if (relationshipHealth && relationshipHealth.score < 80) {
      recommendations.push(`Reconnect with ${primaryRelationship.name} - it's been a while!`);
    }
    
    return recommendations.length > 0 ? recommendations : ["You're doing great! Keep nurturing your relationships"];
  };

  return (
    <div className="p-8 space-y-8">
      {/* Hero Section with Action Focus */}
      <div className="relative bg-gradient-to-br from-rose-50 to-cream-50 rounded-2xl p-8 border border-rose-100/50">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! 💕
            </h1>
            <p className="text-rose-600 text-lg mb-4">
              {relationships.length > 0 
                ? "Ready to strengthen your connections today?" 
                : "Let's start building meaningful relationships"}
            </p>
            
            {/* Relationship Health Indicator */}
            {relationshipHealth && primaryRelationship && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-rose-700">
                    Connection with {primaryRelationship.name}:
                  </span>
                  <span className={`text-sm font-semibold ${relationshipHealth.color}`}>
                    {relationshipHealth.status} ({relationshipHealth.score}%)
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-700">{relationships.length}</div>
            <div className="text-sm text-rose-600">
              {relationships.length === 1 ? 'relationship' : 'relationships'}
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="mt-6 p-4 bg-white/60 rounded-xl border border-rose-100">
          <h3 className="text-sm font-semibold text-rose-800 mb-2">💡 Today's Recommendations</h3>
          <ul className="space-y-1">
            {getRecommendations().map((rec, index) => (
              <li key={index} className="text-sm text-rose-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prominent Action Section */}
      {relationships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TryNudgeCard relationships={relationships} onNudgeSent={handleNudgeSent} />
          <UpcomingEvents relationships={relationships} />
        </div>
      )}

      {/* Stats and Secondary Actions */}
      <DashboardStats relationships={relationships} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {relationships.length === 0 && (
            <AddRelationshipCard onRelationshipAdded={handleRelationshipAdded} />
          )}
        </div>
        
        <div className="space-y-6">
          <RelationshipHealthCard 
            relationships={relationships} 
            onTakeAction={handleNudgeSent}
          />
          <ThoughtfulnessScore relationships={relationships} />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
