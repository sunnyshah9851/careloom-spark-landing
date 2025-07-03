
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  full_name: string;
  partner_name: string;
  user_birthday: string;
  partner_birthday: string;
  anniversary_date: string;
  reminder_frequency: string;
  city?: string;
}

interface ProfileEditorProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

const ProfileEditor = ({ profile, onProfileUpdate }: ProfileEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...editingProfile,
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
        description: "Your relationship details have been updated successfully.",
      });
      onProfileUpdate(editingProfile);
      setIsEditing(false);
    }

    setLoading(false);
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setEditingProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Relationship Details</CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Edit Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Your Name</Label>
                <Input
                  id="full_name"
                  value={editingProfile.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="partner_name">Partner's Name</Label>
                <Input
                  id="partner_name"
                  value={editingProfile.partner_name}
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
                  value={editingProfile.user_birthday}
                  onChange={(e) => handleInputChange('user_birthday', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="partner_birthday">Partner's Birthday</Label>
                <Input
                  id="partner_birthday"
                  type="date"
                  value={editingProfile.partner_birthday}
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
                value={editingProfile.anniversary_date}
                onChange={(e) => handleInputChange('anniversary_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={editingProfile.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
              />
            </div>

            <div>
              <Label htmlFor="reminder_frequency">Reminder Frequency</Label>
              <select
                id="reminder_frequency"
                value={editingProfile.reminder_frequency}
                onChange={(e) => handleInputChange('reminder_frequency', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditingProfile(profile);
                }}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Your Name</Label>
                <p className="text-lg text-gray-900">{profile.full_name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Partner's Name</Label>
                <p className="text-lg text-gray-900">{profile.partner_name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Your Birthday</Label>
                <p className="text-lg text-gray-900">
                  {profile.user_birthday ? new Date(profile.user_birthday).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Partner's Birthday</Label>
                <p className="text-lg text-gray-900">
                  {profile.partner_birthday ? new Date(profile.partner_birthday).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : 'Not provided'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Anniversary Date</Label>
                <p className="text-lg text-gray-900">
                  {profile.anniversary_date ? new Date(profile.anniversary_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">City</Label>
                <p className="text-lg text-gray-900">{profile.city || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Reminder Frequency</Label>
              <p className="text-lg text-gray-900 capitalize">{profile.reminder_frequency}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
