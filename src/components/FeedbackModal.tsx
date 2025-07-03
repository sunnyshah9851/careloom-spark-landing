
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    liked: '',
    disliked: '',
    pricing_feedback: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow both authenticated and non-authenticated users to submit feedback
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || 'anonymous',
          current_url: window.location.href,
          liked: formData.liked || null,
          disliked: formData.disliked || null,
          pricing_feedback: formData.pricing_feedback || null,
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Thank you so much! 🙏",
          description: "Sunny really appreciates your feedback and will use it to make Careloom even better!",
        });
        setFormData({ liked: '', disliked: '', pricing_feedback: '' });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Hey there, beta tester! 👋
            </DialogTitle>
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            I'm Sunny, the creator of Careloom! As one of our valued beta users, your feedback means the world to me. 
            I'm working hard to make this the best relationship management tool possible, and your insights help me improve every day. 💕
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="liked" className="text-sm font-medium text-gray-700">
              What's working well for you? ✨
            </Label>
            <Textarea
              id="liked"
              value={formData.liked}
              onChange={(e) => handleInputChange('liked', e.target.value)}
              placeholder="Tell me what you're loving about Careloom..."
              className="min-h-[80px] resize-none placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disliked" className="text-sm font-medium text-gray-700">
              What could be better? 🛠️
            </Label>
            <Textarea
              id="disliked"
              value={formData.disliked}
              onChange={(e) => handleInputChange('disliked', e.target.value)}
              placeholder="What's frustrating or confusing? Help me fix it!"
              className="min-h-[80px] resize-none placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing" className="text-sm font-medium text-gray-700">
              What would you pay for this? 💰
            </Label>
            <Input
              id="pricing"
              value={formData.pricing_feedback}
              onChange={(e) => handleInputChange('pricing_feedback', e.target.value)}
              placeholder="e.g., $5/month, $50/year, or your thoughts..."
              className="placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              This helps me figure out fair pricing that works for everyone!
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-rose-600 hover:bg-rose-700"
            >
              {isSubmitting ? 'Sending to Sunny...' : 'Send Feedback 💌'}
            </Button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Thanks for being part of the Careloom beta family! 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
