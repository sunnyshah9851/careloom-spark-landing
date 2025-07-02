
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useNudge } from '@/hooks/useNudge';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';

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

interface TryNudgeCardProps {
  relationships: Relationship[];
  onNudgeSent?: () => void;
}

const TryNudgeCard = ({ relationships, onNudgeSent }: TryNudgeCardProps) => {
  const { sendNudge, isLoading, error } = useNudge();
  const { recordEvent } = useEvents();
  const [hasSentToday, setHasSentToday] = useState(false);

  // Get the first partner's name, or use a default
  const partnerName = relationships.length > 0 ? relationships[0].name : undefined;

  const handleSendNudge = async () => {
    const success = await sendNudge({
      partnerName,
      city: 'your city', // Could be enhanced to get actual city from profile
    });

    if (success) {
      // Record the nudge event
      await recordEvent(
        relationships.length > 0 ? relationships[0].id : null,
        'nudge_requested',
        {
          action_description: 'Requested personalized date ideas via email nudge',
          partner_name: partnerName,
          city: 'your city'
        }
      );

      toast.success('🎁 Your personalized date ideas are on the way! Check your email in a few minutes.');
      setHasSentToday(true);
      onNudgeSent?.();
    } else {
      toast.error(error || 'Failed to send nudge. Please try again.');
    }
  };

  return (
    <Card className="border-2 border-dashed border-rose-200 hover:border-rose-300 transition-colors bg-gradient-to-br from-rose-50/50 to-cream-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          🎯 Try Your First Personalized Nudge
        </CardTitle>
        <CardDescription className="text-base">
          Experience Careloom's magic! We'll send you 3 personalized date ideas tailored to your city, 
          budget, and relationship style - delivered straight to your inbox in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/60 rounded-xl p-4 border border-rose-100">
          <p className="text-sm text-rose-700 mb-2 font-medium">What you'll get:</p>
          <ul className="text-sm text-rose-600/80 space-y-1">
            <li>• 3 personalized date ideas for your city</li>
            <li>• Budget estimates and timing suggestions</li>
            <li>• Local venue recommendations</li>
            <li>• Weather-appropriate activities</li>
          </ul>
        </div>
        
        <Button
          onClick={handleSendNudge}
          disabled={isLoading || hasSentToday}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Crafting Your Perfect Date Ideas...
            </>
          ) : hasSentToday ? (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Date Ideas Sent! Check Your Email ✓
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Send Me My Personalized Date Ideas
            </>
          )}
        </Button>
        
        {hasSentToday && (
          <div className="bg-rose-100/60 rounded-lg p-3 text-center">
            <p className="text-sm text-rose-700 font-medium">
              🎉 Your date ideas are on the way!
            </p>
            <p className="text-xs text-rose-600/80 mt-1">
              Check your email in the next few minutes for 3 amazing date suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TryNudgeCard;
