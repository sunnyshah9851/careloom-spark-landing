import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Relationship {
  id: string;
  profile_id: string;
  relationship_type: string;
  name: string;
  email?: string;
  phone_number?: string;
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

// Parse 'YYYY-MM-DD' as a local date (no UTC shift)
const parseYMDLocal = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const DashboardStats = ({ relationships }: DashboardStatsProps) => {
  const { user } = useAuth();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState(0);
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState(0);

  useEffect(() => {
  const fetchUpcomingBirthdays = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: relationshipsWithBirthdays, error } = await supabase
      .from('relationships')
      .select('name, birthday')
      .eq('profile_id', user.id)
      .not('birthday', 'is', null);

    if (relationshipsWithBirthdays && !error) {
      const birthdaysInNext30Days = relationshipsWithBirthdays.filter(rel => {
        if (!rel.birthday) return false;

        // ✅ parse as local date
        const birth = parseYMDLocal(rel.birthday);
        const currentYear = today.getFullYear();

        const thisYearBirthday = new Date(currentYear, birth.getMonth(), birth.getDate());
        thisYearBirthday.setHours(0, 0, 0, 0);

        const nextYearBirthday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
        nextYearBirthday.setHours(0, 0, 0, 0);

        const nextOccurrence = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        return nextOccurrence <= thirtyDaysFromNow;
      });

      setUpcomingBirthdays(birthdaysInNext30Days.length);
    } else if (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  // ✅ anniversaries using local parse too
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const anniversariesInNext30Days = relationships.filter(rel => {
    if (!rel.anniversary) return false;

    const ann = parseYMDLocal(rel.anniversary); // ✅ local parse
    const currentYear = today.getFullYear();

    const thisYearAnniversary = new Date(currentYear, ann.getMonth(), ann.getDate());
    thisYearAnniversary.setHours(0, 0, 0, 0);

    const nextYearAnniversary = new Date(currentYear + 1, ann.getMonth(), ann.getDate());
    nextYearAnniversary.setHours(0, 0, 0, 0);

    const nextOccurrence = thisYearAnniversary >= today ? thisYearAnniversary : nextYearAnniversary;
    return nextOccurrence <= thirtyDaysFromNow;
  });

  setUpcomingAnniversaries(anniversariesInNext30Days.length);

  fetchUpcomingBirthdays();
}, [user, relationships]);


  const calculateStats = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of day
  let daysToNextEvent = Infinity;

  relationships.forEach((relationship) => {
    [relationship.birthday, relationship.anniversary].forEach((dateStr) => {
      if (!dateStr) return;

      // IMPORTANT: parse as local Y-M-D
      const base = parseYMDLocal(dateStr);

      const currentYear = today.getFullYear();
      const thisYearEvent = new Date(currentYear, base.getMonth(), base.getDate());
      const nextYearEvent = new Date(currentYear + 1, base.getMonth(), base.getDate());

      const nextOccurrence = thisYearEvent >= today ? thisYearEvent : nextYearEvent;
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / msPerDay);

      if (daysUntil < daysToNextEvent) {
        daysToNextEvent = daysUntil;
      }
    });
  });

  return { daysToNextEvent };
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
      title: 'Upcoming Birthdays',
      value: upcomingBirthdays,
      subtitle: upcomingBirthdays === 0 ? 'None in next 30 days' : 'In next 30 days',
      icon: Gift,
      color: 'text-gray-900'
    },
    {
      title: 'Upcoming Anniversaries',
      value: upcomingAnniversaries,
      subtitle: upcomingAnniversaries === 0 ? 'None in next 30 days' : 'In next 30 days',
      icon: Calendar,
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
