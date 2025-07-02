import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, TrendingUp, Calendar, MessageCircle } from 'lucide-react';

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

interface RelationshipHealthCardProps {
  relationships: Relationship[];
  onTakeAction?: () => void;
}

const RelationshipHealthCard = ({ relationships, onTakeAction }: RelationshipHealthCardProps) => {
  if (relationships.length === 0) {
    return null;
  }

  const calculateOverallHealth = () => {
    let totalScore = 0;
    let scoredRelationships = 0;

    relationships.forEach(relationship => {
      const daysSinceLastNudge = relationship.last_nudge_sent 
        ? Math.floor((Date.now() - new Date(relationship.last_nudge_sent).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      let score = 100;
      if (daysSinceLastNudge > 30) score = 30;
      else if (daysSinceLastNudge > 14) score = 60;
      else if (daysSinceLastNudge > 7) score = 80;
      
      // Bonus for having important dates
      if (relationship.birthday || relationship.anniversary) score += 10;
      
      totalScore += Math.min(score, 100);
      scoredRelationships++;
    });

    return scoredRelationships > 0 ? Math.round(totalScore / scoredRelationships) : 0;
  };

  const overallHealth = calculateOverallHealth();
  const healthColor = overallHealth >= 80 ? 'text-emerald-600' : 
                     overallHealth >= 60 ? 'text-yellow-600' : 'text-red-600';
  
  const healthGradient = overallHealth >= 80 ? 'from-emerald-500 to-green-500' : 
                        overallHealth >= 60 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-500';

  const getHealthInsight = () => {
    if (overallHealth >= 90) return "Your relationships are thriving! Keep up the amazing work.";
    if (overallHealth >= 70) return "Great relationship health! A few small actions could make them even stronger.";
    if (overallHealth >= 50) return "Your relationships need some attention. Regular check-ins can make a big difference.";
    return "Time to reconnect! Your relationships will flourish with consistent care.";
  };

  const getActionSuggestion = () => {
    const needsAttention = relationships.filter(r => {
      const daysSinceLastNudge = r.last_nudge_sent 
        ? Math.floor((Date.now() - new Date(r.last_nudge_sent).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceLastNudge > 14;
    });

    if (needsAttention.length > 0) {
      return `Reach out to ${needsAttention[0].name}${needsAttention.length > 1 ? ` and ${needsAttention.length - 1} others` : ''}`;
    }
    
    return "Send personalized connection ideas";
  };

  return (
    <Card className="border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50/30 to-cream-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${healthGradient} animate-pulse`}></div>
            <CardTitle className="text-lg">Relationship Health</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            <span className={`text-lg font-bold ${healthColor}`}>{overallHealth}%</span>
          </div>
        </div>
        <CardDescription>
          {getHealthInsight()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-rose-600">Overall Health</span>
            <span className={`font-medium ${healthColor}`}>{overallHealth}%</span>
          </div>
          <Progress value={overallHealth} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="text-rose-700">
              {relationships.filter(r => r.last_nudge_sent).length} active connections
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-rose-500" />
            <span className="text-rose-700">
              {relationships.filter(r => r.birthday || r.anniversary).length} with important dates
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onTakeAction}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white mt-4"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {getActionSuggestion()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RelationshipHealthCard;