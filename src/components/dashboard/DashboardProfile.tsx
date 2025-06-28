import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

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

interface DashboardProfileProps {
  profile: Profile | null;
  relationships: Relationship[];
  onProfileUpdate: (profile: Partial<Profile>) => Promise<void>;
  onRelationshipsUpdate: () => Promise<void>;
}

const DashboardProfile = ({ profile, relationships, onProfileUpdate, onRelationshipsUpdate }: DashboardProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || ''
  });
  const [newRelationship, setNewRelationship] = useState({
    name: '',
    relationship_type: 'partner',
    email: '',
    birthday: '',
    anniversary: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onProfileUpdate(profileForm);
      toast({
        title: "Success! 💕",
        description: "Your profile has been updated successfully.",
      });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const ensureProfileExists = async () => {
    if (!user) return false;

    try {
      // Check if profile exists
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile:', error);
        return false;
      }

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast({
            title: "Error",
            description: "Failed to create your profile. Please try again.",
            variant: "destructive"
          });
          return false;
        }

        // Refresh profile data
        await onRelationshipsUpdate();
      }

      return true;
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      return false;
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Ensure profile exists before adding relationship
      const profileExists = await ensureProfileExists();
      if (!profileExists) {
        setLoading(false);
        return;
      }

      // Prepare the data with proper date formatting
      const relationshipData = {
        profile_id: user.id,
        name: newRelationship.name.trim(),
        relationship_type: newRelationship.relationship_type,
        email: newRelationship.email.trim() || null,
        birthday: newRelationship.birthday || null,
        anniversary: newRelationship.anniversary || null,
        notes: newRelationship.notes.trim() || null
      };

      console.log('Inserting relationship data:', relationshipData);

      const { error } = await supabase
        .from('relationships')
        .insert(relationshipData);

      if (error) {
        console.error('Error adding relationship:', error);
        toast({
          title: "Error",
          description: `Failed to add relationship: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success! 💕",
          description: "New relationship added successfully.",
        });
        setNewRelationship({
          name: '',
          relationship_type: 'partner',
          email: '',
          birthday: '',
          anniversary: '',
          notes: ''
        });
        await onRelationshipsUpdate();
      }
    } catch (error) {
      console.error('Unexpected error adding relationship:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      console.error('Error deleting relationship:', error);
      toast({
        title: "Error",
        description: "Failed to delete relationship. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Relationship deleted successfully.",
      });
      await onRelationshipsUpdate();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Profile Settings
        </h1>
        <p className="text-rose-600 text-lg">
          Manage your personal information and relationships
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your basic profile information
                  </CardDescription>
                </div>
                {!editingProfile && (
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingProfile(true)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
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
                        setEditingProfile(false);
                        setProfileForm({ full_name: profile?.full_name || '' });
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-lg text-gray-900">{profile?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-lg text-gray-900">{profile?.email || user?.email || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships">
          <div className="space-y-6">
            {/* Add New Relationship */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Relationship
                </CardTitle>
                <CardDescription>
                  Add someone important in your life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRelationship} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newRelationship.name}
                        onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
                        placeholder="Enter their name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship_type">Relationship Type</Label>
                      <select
                        id="relationship_type"
                        value={newRelationship.relationship_type}
                        onChange={(e) => setNewRelationship({ ...newRelationship, relationship_type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="partner">Partner</option>
                        <option value="friend">Friend</option>
                        <option value="family">Family</option>
                        <option value="sibling">Sibling</option>
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthday">Birthday (Optional)</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={newRelationship.birthday}
                        onChange={(e) => setNewRelationship({ ...newRelationship, birthday: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="anniversary">Anniversary (Optional)</Label>
                      <Input
                        id="anniversary"
                        type="date"
                        value={newRelationship.anniversary}
                        onChange={(e) => setNewRelationship({ ...newRelationship, anniversary: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newRelationship.email}
                      onChange={(e) => setNewRelationship({ ...newRelationship, email: e.target.value })}
                      placeholder="their.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={newRelationship.notes}
                      onChange={(e) => setNewRelationship({ ...newRelationship, notes: e.target.value })}
                      placeholder="Any special notes about this person..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !newRelationship.name.trim()}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    {loading ? 'Adding...' : 'Add Relationship'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Relationships */}
            <Card>
              <CardHeader>
                <CardTitle>Your Relationships</CardTitle>
                <CardDescription>
                  Manage the people in your life
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relationships.length > 0 ? (
                  <div className="space-y-4">
                    {relationships.map((relationship) => (
                      <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold text-lg">{relationship.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{relationship.relationship_type}</p>
                          {relationship.birthday && (
                            <p className="text-sm text-gray-500">
                              Birthday: {new Date(relationship.birthday).toLocaleDateString()}
                            </p>
                          )}
                          {relationship.anniversary && (
                            <p className="text-sm text-gray-500">
                              Anniversary: {new Date(relationship.anniversary).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRelationship(relationship.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No relationships added yet. Add someone above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardProfile;
