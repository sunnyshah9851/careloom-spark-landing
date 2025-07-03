
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

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

interface ThoughtfulnessScoreProps {
  relationships: Relationship[];
}

const ThoughtfulnessScore = ({ relationships }: ThoughtfulnessScoreProps) => {
  const calculateThoughtfulnessScore = () => {
    // Base score components
    let relationshipScore = 0;
    let reminderScore = 0;
    let earlinessScore = 0;

    // 1. Relationship tracking score (0-40 points)
    const relationshipCount = relationships.length;
    relationshipScore = Math.min(relationshipCount * 8, 40); // Max 40 points for 5+ relationships

    // 2. Reminder activity score (0-40 points)
    const relationshipsWithReminders = relationships.filter(r => r.last_nudge_sent).length;
    reminderScore = Math.min(relationshipsWithReminders * 10, 40); // Max 40 points for 4+ active reminders

    // 3. Proactive planning score (0-20 points)
    const relationshipsWithDates = relationships.filter(r => r.birthday || r.anniversary).length;
    earlinessScore = Math.min(relationshipsWithDates * 5, 20); // Max 20 points for 4+ relationships with dates

    const totalScore = Math.min(relationshipScore + reminderScore + earlinessScore, 100);

    return {
      total: totalScore,
      breakdown: {
        relationships: relationshipScore,
        reminders: reminderScore,
        planning: earlinessScore
      }
    };
  };

  const score = calculateThoughtfulnessScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-400 to-emerald-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 40) return 'from-amber-400 to-amber-600';
    return 'from-rose-400 to-rose-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Exceptionally Thoughtful';
    if (score >= 60) return 'Very Thoughtful';
    if (score >= 40) return 'Moderately Thoughtful';
    return 'Getting Started';
  };

  return (
    <TooltipProvider>
      <Card className="relative overflow-visible">
        <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(score.total)} opacity-5`} />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-rose-800">
            Thoughtfulness Score
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-full bg-rose-100 hover:bg-rose-200 transition-colors border border-rose-300 shadow-sm">
                  <HelpCircle className="h-5 w-5 text-rose-600 hover:text-rose-700" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                align="center"
                className="max-w-xs z-[99999] bg-white border border-gray-200 shadow-xl p-4 rounded-lg"
                sideOffset={10}
              >
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">How your score is calculated:</p>
                  <div className="space-y-1">
                    <p><strong>Relationships (40pts):</strong> {score.breakdown.relationships} pts - Tracking {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}</p>
                    <p><strong>Active Care (40pts):</strong> {score.breakdown.reminders} pts - {relationships.filter(r => r.last_nudge_sent).length} relationship{relationships.filter(r => r.last_nudge_sent).length !== 1 ? 's' : ''} with recent activity</p>
                    <p><strong>Planning (20pts):</strong> {score.breakdown.planning} pts - {relationships.filter(r => r.birthday || r.anniversary).length} relationship{relationships.filter(r => r.birthday || r.anniversary).length !== 1 ? 's' : ''} with important dates</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-2">
            <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor(score.total)} bg-clip-text text-transparent`}>
              {score.total}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {getScoreLabel(score.total)}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(score.total)} transition-all duration-700 ease-out`}
                style={{ width: `${score.total}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ThoughtfulnessScore;
