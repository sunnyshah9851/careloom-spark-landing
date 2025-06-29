
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UpcomingEvents from './UpcomingEvents';

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

interface DashboardEventsProps {
  relationships: Relationship[];
  profile: Profile | null;
}

const DashboardEvents = ({ relationships, profile }: DashboardEventsProps) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Upcoming Events
        </h1>
        <p className="text-rose-600 text-lg">
          Never miss another special moment
        </p>
      </div>

      <UpcomingEvents relationships={relationships} />
    </div>
  );
};

export default DashboardEvents;
