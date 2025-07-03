
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDateIdeas } from '@/hooks/useDateIdeas';
import { useToast } from '@/hooks/use-toast';
import { Heart, Sparkles, MapPin, Calendar } from 'lucide-react';

interface TryDateIdeasCardProps {
  relationships: any[];
}

export const TryDateIdeasCard = ({ relationships }: TryDateIdeasCardProps) => {
  const { sendDateIdeas, isLoading } = useDateIdeas();
  const { toast } = useToast();

  // Check if user has any partner/spouse relationships with date ideas enabled
  const hasEligibleRelationships = relationships.some(
    rel => ['partner', 'spouse'].includes(rel.relationship_type) && 
           rel.date_ideas_frequency && 
           rel.date_ideas_frequency !== 'never'
  );

  const handleSendDateIdeas = async () => {
    const result = await sendDateIdeas();
    
    if (result) {
      toast({
        title: "Date Ideas Sent! 💕",
        description: `Successfully sent personalized date ideas to ${result.emailsSent || 0} relationships`,
      });
    } else {
      toast({
        title: "Something went wrong",
        description: "Please try again later or check your relationship settings",
        variant: "destructive",
      });
    }
  };

  if (!hasEligibleRelationships) {
    return (
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-rose-800">Date Ideas Available</CardTitle>
          </div>
          <CardDescription className="text-rose-600">
            Add a partner or spouse relationship to get personalized date ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-rose-700 mb-4">
            Once you add a partner or spouse relationship with date ideas enabled, you'll receive personalized suggestions for:
          </p>
          <div className="space-y-2 text-sm text-rose-600">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>3 curated date ideas perfectly matched to your relationship</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Local hotspots and hidden gems in your city</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Budget-friendly to luxury options</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-rose-800">Try Date Ideas</CardTitle>
        </div>
        <CardDescription className="text-rose-600">
          Get personalized date suggestions powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-rose-700 mb-4">
          Send yourself curated date ideas based on your partner's city, including local hotspots, seasonal activities, and options for every budget.
        </p>
        
        <div className="space-y-2 text-sm text-rose-600 mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered personalized suggestions</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Local and seasonal recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Budget-friendly to luxury options</span>
          </div>
        </div>

        <Button 
          onClick={handleSendDateIdeas}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Date Ideas...
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-2" />
              Send Date Ideas Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
