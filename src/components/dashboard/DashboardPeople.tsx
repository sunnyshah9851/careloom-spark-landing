
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, Edit, Save, X, Calendar, Mail, Heart, Gift } from 'lucide-react';
import AddRelationshipForm from './AddRelationshipForm';

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

interface DashboardPeopleProps {
  relationships: Relationship[];
  profile: Profile | null;
  onRelationshipsUpdate: () => void;
}

const DashboardPeople = ({ relationships, profile, onRelationshipsUpdate }: DashboardPeopleProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Relationship>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRelationships = relationships.filter(relationship =>
    relationship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relationship.relationship_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (relationship: Relationship) => {
    setEditingId(relationship.id);
    setEditForm(relationship);
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('relationships')
        .update({
          name: editForm.name,
          email: editForm.email,
          birthday: editForm.birthday,
          anniversary: editForm.anniversary,
          notes: editForm.notes,
          relationship_type: editForm.relationship_type,
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      onRelationshipsUpdate();
    } catch (error) {
      console.error('Error updating relationship:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleRelationshipAdded = () => {
    setShowAddForm(false);
    onRelationshipsUpdate();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (showAddForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-rose-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-playfair text-rose-800">
                  Add Someone Special
                </CardTitle>
                <CardDescription className="text-rose-600 mt-1">
                  Tell us about someone important in your life
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AddRelationshipForm 
              onSuccess={handleRelationshipAdded} 
              onCancel={() => setShowAddForm(false)} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full">
            <Users className="h-8 w-8 text-rose-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-playfair text-gray-900">
              People in Your Circle
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your relationships and stay connected
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Someone
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name or relationship type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-rose-200 focus:border-rose-400"
        />
      </div>

      {/* Relationships Grid */}
      {filteredRelationships.length === 0 ? (
        <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No matches found' : 'No relationships yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Add your first relationship to start building your circle'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRelationships.map((relationship) => (
            <Card key={relationship.id} className="shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      {editingId === relationship.id ? (
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="font-semibold text-lg"
                        />
                      ) : (
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          {relationship.name}
                        </CardTitle>
                      )}
                      <Badge variant="secondary" className="mt-1 bg-rose-100 text-rose-700">
                        {editingId === relationship.id ? (
                          <Input
                            value={editForm.relationship_type || ''}
                            onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value })}
                            className="h-6 text-xs"
                          />
                        ) : (
                          relationship.relationship_type
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingId === relationship.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(relationship.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(relationship)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Important Dates Section */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Birthday */}
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-amber-600" />
                      <Label className="text-xs font-medium text-amber-800">Birthday</Label>
                    </div>
                    {editingId === relationship.id ? (
                      <Input
                        type="date"
                        value={editForm.birthday || ''}
                        onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                        className="text-xs h-8 border-amber-300 focus:border-amber-500"
                      />
                    ) : (
                      <p className="text-sm font-medium text-amber-700">
                        {relationship.birthday ? formatDateShort(relationship.birthday) : 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Anniversary */}
                  <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-rose-600" />
                      <Label className="text-xs font-medium text-rose-800">Anniversary</Label>
                    </div>
                    {editingId === relationship.id ? (
                      <Input
                        type="date"
                        value={editForm.anniversary || ''}
                        onChange={(e) => setEditForm({ ...editForm, anniversary: e.target.value })}
                        className="text-xs h-8 border-rose-300 focus:border-rose-500"
                      />
                    ) : (
                      <p className="text-sm font-medium text-rose-700">
                        {relationship.anniversary ? formatDateShort(relationship.anniversary) : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                {(editingId === relationship.id || relationship.email) && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {editingId === relationship.id ? (
                      <Input
                        type="email"
                        placeholder="Email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{relationship.email}</span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {(editingId === relationship.id || relationship.notes) && (
                  <div>
                    {editingId === relationship.id ? (
                      <div>
                        <Label className="text-xs text-gray-500">Notes</Label>
                        <Textarea
                          placeholder="Notes about this person..."
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="text-sm mt-1"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label className="text-xs text-gray-500">Notes</Label>
                        <p className="text-sm text-gray-600 mt-1">{relationship.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-400 pt-2 border-t">
                  Added on {formatDate(relationship.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPeople;
