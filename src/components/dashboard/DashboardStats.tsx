
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Clock, TrendingUp, Activity, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface DashboardStatsProps {
  relationships: Relationship[];
}

const DashboardStats = ({ relationships }: DashboardStatsProps) => {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState(0);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState(0);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get events from the last 7 days
      const { data: events } = await supabase
        .from('events')
        .select('id, relationship_id, relationships!inner(profile_id)')
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('relationships.profile_id', user.id);

      setRecentActivity(events?.length || 0);
    };

    const fetchUpcomingBirthdays = async () => {
      if (!user) return;

      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Get relationships with birthdays in the next 30 days
      const { data: relationshipsWithBirthdays } = await supabase
        .from('relationships')
        .select('birthday')
        .eq('profile_id', user.id)
        .not('birthday', 'is', null);

      if (relationshipsWithBirthdays) {
        const birthdaysInNext30Days = relationshipsWithBirthdays.filter(rel => {
          if (!rel.birthday) return false;
          
          const birthday = new Date(rel.birthday);
          const currentYear = today.getFullYear();
          const thisYearBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());
          const nextYearBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
          
          const nextOccurrence = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
          
          return nextOccurrence <= thirtyDaysFromNow;
        });

        setUpcomingBirthdays(birthdaysInNext30Days.length);
      }
    };

    fetchRecentActivity();
    fetchUpcomingBirthdays();
  }, [user, relationships]);

  const calculateStats = () => {
    const today = new Date();
    let daysToNextEvent = Infinity;

    relationships.forEach(relationship => {
      // Find next upcoming event
      [relationship.birthday, relationship.anniversary].forEach(dateStr => {
        if (dateStr) {
          const eventDate = new Date(dateStr);
          const currentYear = today.getFullYear();
          const thisYearEvent = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());
          const nextYearEvent = new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate());
          
          const nextOccurrence = thisYearEvent >= today ? thisYearEvent : nextYearEvent;
          const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil < daysToNextEvent) {
            daysToNextEvent = daysUntil;
          }
        }
      });
    });

    return {
      daysToNextEvent: daysToNextEvent === Infinity ? 0 : daysToNextEvent
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Relationships',
      value: relationships.length,
      subtitle: relationships.length === 0 ? 'Start adding people' : 'People in your circle',
      icon: Heart,
      color: 'text-gray-900'
    },
    {
      title: 'Recent Activity',
      value: recentActivity,
      subtitle: recentActivity === 0 ? 'No activity this week' : 'Actions in last 7 days',
      icon: Activity,
      color: 'text-gray-900'
    },
    {
      title: 'Upcoming Birthdays',
      value: upcomingBirthdays,
      subtitle: upcomingBirthdays === 0 ? 'None in next 30 days' : 'In next 30 days',
      icon: Gift,
      color: 'text-gray-900'
    },
    {
      title: 'Next Event',
      value: stats.daysToNextEvent === 0 ? 'Today!' : 
             stats.daysToNextEvent === Infinity ? 'None' :
             `${stats.daysToNextEvent} days`,
      subtitle: stats.daysToNextEvent === 0 ? 'Make it special!' :
               stats.daysToNextEvent === Infinity ? 'Add important dates' :
               'Until next celebration',
      icon: Calendar,
      color: 'text-gray-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
