
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CareloomLogo from './CareloomLogo';

interface Profile {
  full_name: string;
  partner_name: string;
  user_birthday: string;
  partner_birthday: string;
  anniversary_date: string;
  reminder_frequency: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    partner_name: '',
    user_birthday: '',
    partner_birthday: '',
    anniversary_date: '',
    reminder_frequency: 'weekly'
  });
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        partner_name: data.partner_name || '',
        user_birthday: data.user_birthday || '',
        partner_birthday: data.partner_birthday || '',
        anniversary_date: data.anniversary_date || '',
        reminder_frequency: data.reminder_frequency || 'weekly'
      });
      setHasProfile(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success! 💕",
        description: "Your relationship details have been saved successfully.",
      });
      setHasProfile(true);
    }

    setLoading(false);
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen gradient-warm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <CareloomLogo />
            <div className="flex items-center space-x-4">
              <span className="text-rose-700">Welcome, {user?.user_metadata?.full_name || user?.email}</span>
              <Button 
                variant="ghost" 
                onClick={signOut}
                className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-playfair text-rose-800">
              {hasProfile ? 'Your Relationship Details' : 'Tell us about your relationship'}
            </CardTitle>
            <CardDescription className="text-lg text-rose-600">
              {hasProfile ? 'Update your information anytime' : 'Help us personalize your Careloom experience'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Your Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partner_name">Partner's Name</Label>
                  <Input
                    id="partner_name"
                    value={profile.partner_name}
                    onChange={(e) => handleInputChange('partner_name', e.target.value)}
                    placeholder="Enter partner's name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_birthday">Your Birthday</Label>
                  <Input
                    id="user_birthday"
                    type="date"
                    value={profile.user_birthday}
                    onChange={(e) => handleInputChange('user_birthday', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partner_birthday">Partner's Birthday</Label>
                  <Input
                    id="partner_birthday"
                    type="date"
                    value={profile.partner_birthday}
                    onChange={(e) => handleInputChange('partner_birthday', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="anniversary_date">Anniversary Date</Label>
                <Input
                  id="anniversary_date"
                  type="date"
                  value={profile.anniversary_date}
                  onChange={(e) => handleInputChange('anniversary_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reminder_frequency">Reminder Frequency</Label>
                <select
                  id="reminder_frequency"
                  value={profile.reminder_frequency}
                  onChange={(e) => handleInputChange('reminder_frequency', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white"
              >
                {loading ? 'Saving...' : hasProfile ? 'Update Details' : 'Save Details'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
