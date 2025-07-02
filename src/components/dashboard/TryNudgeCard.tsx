
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

  // Get the first relationship for personalization
  const primaryRelationship = relationships.length > 0 ? relationships[0] : null;
  
  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'partner': return 'partner';
      case 'family': return 'family member';
      case 'friend': return 'friend';
      default: return 'person you care about';
    }
  };

  const handleSendNudge = async () => {
    if (!primaryRelationship) {
      toast.error('Please add a relationship first to receive personalized connection ideas.');
      return;
    }

    const success = await sendNudge({
      partnerName: primaryRelationship.name,
      city: 'your city',
    });

    if (success) {
      await recordEvent(
        primaryRelationship.id,
        'personalized_nudge_requested',
        {
          action_description: `Requested personalized ${primaryRelationship.relationship_type} connection ideas`,
          relationship_name: primaryRelationship.name,
          relationship_type: primaryRelationship.relationship_type
        }
      );

      toast.success(`🎁 Your personalized connection ideas for ${primaryRelationship.name} are on the way! Check your email in a few minutes.`);
      setHasSentToday(true);
      onNudgeSent?.();
    } else {
      toast.error(error || 'Failed to send nudge. Please try again.');
    }
  };

  if (!primaryRelationship) {
    return (
      <Card className="border-2 border-dashed border-rose-200 hover:border-rose-300 transition-colors bg-gradient-to-br from-rose-50/50 to-cream-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-800">
            🤝 Ready for Your Personalized Connection Nudge?
          </CardTitle>
          <CardDescription className="text-rose-800">
            Add someone important to you first, and we'll send you personalized connection ideas 
            designed specifically for your relationship with them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-rose-100/60 rounded-lg p-4 text-center">
            <p className="text-sm text-rose-700 font-medium">
              👆 Add a relationship above to get started
            </p>
            <p className="text-xs text-rose-600/80 mt-1">
              Once you do, we'll create personalized connection experiences just for you two
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-rose-200 hover:border-rose-300 transition-colors bg-gradient-to-br from-rose-50/50 to-cream-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          💕 Get Personalized Ideas for You & {primaryRelationship.name}
        </CardTitle>
        <CardDescription className="text-rose-800">
          Ready to deepen your connection with {primaryRelationship.name}? We'll send you 3 personalized 
          {primaryRelationship.relationship_type === 'partner' ? ' romance-building' : 
           primaryRelationship.relationship_type === 'family' ? ' family bonding' : 
           ' friendship-strengthening'} experiences designed specifically for your {getRelationshipLabel(primaryRelationship.relationship_type)} relationship.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/60 rounded-xl p-4 border border-rose-100">
          <p className="text-sm text-rose-700 mb-2 font-medium">What you'll get for {primaryRelationship.name}:</p>
          <ul className="text-sm text-rose-600/80 space-y-1">
            <li>• 3 connection experiences tailored to your {primaryRelationship.relationship_type} relationship</li>
            <li>• Conversation starters perfect for you two</li>
            <li>• Screen-free activities that build deeper bonds</li>
            <li>• Research-backed reasons why each idea works</li>
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
              Creating Your Personalized Ideas for {primaryRelationship.name}...
            </>
          ) : hasSentToday ? (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Personalized Ideas Sent! Check Your Email ✓
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Send My Ideas for {primaryRelationship.name}
            </>
          )}
        </Button>
        
        {hasSentToday && (
          <div className="bg-rose-100/60 rounded-lg p-3 text-center">
            <p className="text-sm text-rose-700 font-medium">
              🎉 Your personalized ideas for {primaryRelationship.name} are on the way!
            </p>
            <p className="text-xs text-rose-600/80 mt-1">
              Check your email for meaningful ways to strengthen your {getRelationshipLabel(primaryRelationship.relationship_type)} connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TryNudgeCard;
