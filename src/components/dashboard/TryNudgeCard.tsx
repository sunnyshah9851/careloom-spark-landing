
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useNudge } from '@/hooks/useNudge';
import { toast } from 'sonner';

interface TryNudgeCardProps {
  partnerName?: string;
  onNudgeSent?: () => void;
}

const TryNudgeCard = ({ partnerName, onNudgeSent }: TryNudgeCardProps) => {
  const { sendNudge, isLoading, error } = useNudge();
  const [hasSentToday, setHasSentToday] = useState(false);

  const handleSendNudge = async () => {
    const success = await sendNudge({
      partnerName,
      city: 'your city', // Could be enhanced to get actual city from profile
    });

    if (success) {
      toast.success('🎁 Nudge sent! Check your email for personalized date ideas.');
      setHasSentToday(true);
      onNudgeSent?.();
    } else {
      toast.error(error || 'Failed to send nudge. Please try again.');
    }
  };

  return (
    <Card className="border-2 border-dashed border-rose-200 hover:border-rose-300 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          🎁 Try a Nudge
        </CardTitle>
        <CardDescription>
          We'll email you 3 thoughtful date ideas personalized to your city so you can try Careloom's magic right now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSendNudge}
          disabled={isLoading || hasSentToday}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : hasSentToday ? (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Sent Today ✓
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Me a Nudge
            </>
          )}
        </Button>
        {hasSentToday && (
          <p className="text-xs text-rose-500 text-center mt-2">
            Check your email for your personalized date ideas! 💌
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TryNudgeCard;
