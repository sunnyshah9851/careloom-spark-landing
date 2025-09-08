import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityInput } from '@/components/ui/city-input';
import { supabase } from '@/integrations/supabase/client';
import { Save, X, Trash2 } from 'lucide-react';
import { normalizePhoneForDB } from '@/lib/phone';
import { Switch } from '@/components/ui/switch';
import { Sparkles } from 'lucide-react';


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
  birthday_notification_frequency?: string;
  anniversary_notification_frequency?: string;
  date_ideas_frequency?: string;
  city?: string;
}

interface PersonEditFormProps {
  relationship: Relationship;
  onSave: () => void;
  onCancel: () => void;
}

const PersonEditForm = ({ relationship, onSave, onCancel }: PersonEditFormProps) => {
  const [editForm, setEditForm] = useState<Partial<Relationship>>({
    ...relationship,
    birthday_notification_frequency: relationship.birthday_notification_frequency || '1_week',
    anniversary_notification_frequency: relationship.anniversary_notification_frequency || '1_week',
    date_ideas_frequency: relationship.date_ideas_frequency || 'none'
  });

  const isPartnerOrSpouse = (
  (editForm.relationship_type || relationship.relationship_type || '').toLowerCase() === 'partner' ||
  (editForm.relationship_type || relationship.relationship_type || '').toLowerCase() === 'spouse'
);


  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('relationships')
        .update({
          name: editForm.name,
          email: editForm.email,
          city: editForm.city,
          birthday: editForm.birthday,
          anniversary: editForm.anniversary,
          notes: editForm.notes,
          relationship_type: editForm.relationship_type,
          birthday_notification_frequency: editForm.birthday_notification_frequency,
          anniversary_notification_frequency: editForm.anniversary_notification_frequency,
          date_ideas_frequency: isPartnerOrSpouse ? (editForm.date_ideas_frequency || 'none') : null,
          phone_number: normalizePhoneForDB(editForm.phone_number as string) || null
        })
        .eq('id', relationship.id);

      if (error) throw error;

      onSave();
    } catch (error) {
      console.error('Error updating relationship:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this relationship?')) return;
    try {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', relationship.id);
      if (error) throw error;
      onSave(); // or you can call a separate onDelete if you have one
    } catch (error) {
      console.error('Error deleting relationship:', error);
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Email</Label>
          <Input
            type="email"
            value={editForm.email || ''}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600">City</Label>
          <CityInput
            value={editForm.city || ''}
            onChange={(value) => setEditForm({ ...editForm, city: value })}
            placeholder="Search for a city..."
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
  <div>
    <Label className="text-sm text-gray-600">WhatsApp Number</Label>
    <Input
      type="tel"
      value={editForm.phone_number || ''}
      onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
      placeholder="+14155551234 or +91..."
      className="mt-1"
    />
    <p className="text-[11px] text-gray-500 mt-1">
      Use international format including country code (e.g., +1, +91).
    </p>
  </div>
</div>


      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Birthday Reminders</Label>
          <Select
            value={editForm.birthday_notification_frequency || '1_week'}
            onValueChange={(value) => setEditForm({ ...editForm, birthday_notification_frequency: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_day">1 day before</SelectItem>
              <SelectItem value="3_days">3 days before</SelectItem>
              <SelectItem value="1_week">1 week before</SelectItem>
              <SelectItem value="2_weeks">2 weeks before</SelectItem>
              <SelectItem value="1_month">1 month before</SelectItem>
              <SelectItem value="none">No reminders</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Anniversary Reminders</Label>
          <Select
            value={editForm.anniversary_notification_frequency || '1_week'}
            onValueChange={(value) => setEditForm({ ...editForm, anniversary_notification_frequency: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_day">1 day before</SelectItem>
              <SelectItem value="3_days">3 days before</SelectItem>
              <SelectItem value="1_week">1 week before</SelectItem>
              <SelectItem value="2_weeks">2 weeks before</SelectItem>
              <SelectItem value="1_month">1 month before</SelectItem>
              <SelectItem value="none">No reminders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPartnerOrSpouse && (
  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-600" />
          <Label className="text-sm text-gray-800">Weekly date ideas (email)</Label>
        </div>
        <p className="text-xs text-rose-700 mt-1">
          Receive one email per week with fresh ideas.
        </p>
      </div>
      <Switch
        checked={(editForm.date_ideas_frequency || 'none') === 'weekly'}
        onCheckedChange={(checked) =>
          setEditForm((prev) => ({
            ...prev,
            date_ideas_frequency: checked ? 'weekly' : 'none',
          }))
        }
        className="data-[state=checked]:bg-rose-500"
      />
    </div>
  </div>
)}


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
      <div className="flex justify-center pt-2">
        <Button
          type="button"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PersonEditForm;
