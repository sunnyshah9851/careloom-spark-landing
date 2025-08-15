
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRelationships } from '@/hooks/useRelationships';
import { UpcomingEventsCard } from '@/components/test/UpcomingEventsCard';
import { TestActionsCard } from '@/components/test/TestActionsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, TestTube } from 'lucide-react';

const TestPage = () => {
  const { user } = useAuth();
  const { relationships, upcomingEvents, loading } = useRelationships();

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Birthday & Anniversary Testing</h1>
          <p className="text-muted-foreground">Please sign in to test your reminder system.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading your relationships...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <TestTube className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Birthday & Anniversary Testing</h1>
            <p className="text-muted-foreground">
              Test your reminder system and view upcoming events for {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            {relationships.length} Relationships
          </Badge>
          <Badge variant="outline" className="gap-2">
            <span>📅</span>
            {upcomingEvents.length} Upcoming Events
          </Badge>
          <Badge variant="outline" className="gap-2">
            <span>⚡</span>
            {upcomingEvents.filter(e => e.shouldSendReminder).length} Active Reminders
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <UpcomingEventsCard events={upcomingEvents} />
        <TestActionsCard />
        
        {relationships.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Relationships Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You don't have any relationships set up yet. Add some relationships with birthdays and anniversaries to test the reminder system.
              </p>
              <p className="text-sm text-muted-foreground">
                Go to your dashboard to add relationships and configure their important dates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestPage;
