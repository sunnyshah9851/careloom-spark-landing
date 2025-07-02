
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

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
  birthday_notification_frequency?: string;
  anniversary_notification_frequency?: string;
}

interface PersonEditFormProps {
  relationship: Relationship;
  onSave: () => void;
  onCancel: () => void;
}

const PersonEditForm = ({ relationship, onSave, onCancel }: PersonEditFormProps) => {
  const [editForm, setEditForm] = useState<Partial<Relationship>>({
    ...relationship,
    birthday_notification_frequency: relationship.birthday_notification_frequency || 'weekly',
    anniversary_notification_frequency: relationship.anniversary_notification_frequency || 'weekly'
  });

  const handleSave = async () => {
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
          birthday_notification_frequency: editForm.birthday_notification_frequency,
          anniversary_notification_frequency: editForm.anniversary_notification_frequency
        })
        .eq('id', relationship.id);

      if (error) throw error;

      onSave();
    } catch (error) {
      console.error('Error updating relationship:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Name</Label>
          <Input
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600">Relationship Type</Label>
          <Input
            value={editForm.relationship_type || ''}
            onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Birthday</Label>
          <Input
            type="date"
            value={editForm.birthday || ''}
            onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600">Anniversary</Label>
          <Input
            type="date"
            value={editForm.anniversary || ''}
            onChange={(e) => setEditForm({ ...editForm, anniversary: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Email</Label>
        <Input
          type="email"
          value={editForm.email || ''}
          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Birthday Reminders</Label>
          <Select
            value={editForm.birthday_notification_frequency || 'weekly'}
            onValueChange={(value) => setEditForm({ ...editForm, birthday_notification_frequency: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (7 days before)</SelectItem>
              <SelectItem value="weekly">Weekly (1 week before)</SelectItem>
              <SelectItem value="monthly">Monthly (1 month before)</SelectItem>
              <SelectItem value="none">No notifications</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Anniversary Reminders</Label>
          <Select
            value={editForm.anniversary_notification_frequency || 'weekly'}
            onValueChange={(value) => setEditForm({ ...editForm, anniversary_notification_frequency: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (7 days before)</SelectItem>
              <SelectItem value="weekly">Weekly (1 week before)</SelectItem>
              <SelectItem value="monthly">Monthly (1 month before)</SelectItem>
              <SelectItem value="none">No notifications</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Notes</Label>
        <Textarea
          value={editForm.notes || ''}
          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PersonEditForm;
