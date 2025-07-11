
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X, Calendar, Mail, Heart, Gift, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PersonEditForm from './PersonEditForm';

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
  date_ideas_frequency?: string;
}

interface PersonCardProps {
  relationship: Relationship;
  onUpdate: () => void;
}

const PersonCard = ({ relationship, onUpdate }: PersonCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFrequencies, setIsEditingFrequencies] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [frequencies, setFrequencies] = useState({
    birthday_notification_frequency: relationship.birthday_notification_frequency || '1_week',
    anniversary_notification_frequency: relationship.anniversary_notification_frequency || '1_week',
    date_ideas_frequency: relationship.date_ideas_frequency || 'weekly'
  });

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

  const getFrequencyLabel = (frequency: string | undefined) => {
    const normalizedFreq = frequency === 'weekly' ? '1_week' : frequency;
    switch (normalizedFreq) {
      case '1_day': return '1 day before';
      case '3_days': return '3 days before';
      case '1_week': return '1 week before';
      case '2_weeks': return '2 weeks before';
      case '1_month': return '1 month before';
      case 'none': return 'No reminders';
      default: return '1 week before';
    }
  };

  const getDateIdeasFrequencyLabel = (frequency: string | undefined) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Monthly';
      case 'none': return 'Disabled';
      default: return 'Weekly';
    }
  };

  const handleFrequencyUpdate = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      console.log('Updating frequencies for relationship:', relationship.id);
      console.log('New frequencies:', frequencies);
      
      const { data, error } = await supabase
        .from('relationships')
        .update({
          birthday_notification_frequency: frequencies.birthday_notification_frequency,
          anniversary_notification_frequency: frequencies.anniversary_notification_frequency,
          date_ideas_frequency: frequencies.date_ideas_frequency
        })
        .eq('id', relationship.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);
      toast.success('Notification frequencies updated successfully');
      setIsEditingFrequencies(false);
      
      // Force refresh the parent data
      await onUpdate();
    } catch (error: any) {
      console.error('Error updating frequencies:', error);
      toast.error(`Failed to update notification frequencies: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelFrequencyEdit = () => {
    setFrequencies({
      birthday_notification_frequency: relationship.birthday_notification_frequency === 'weekly' ? '1_week' : relationship.birthday_notification_frequency || '1_week',
      anniversary_notification_frequency: relationship.anniversary_notification_frequency === 'weekly' ? '1_week' : relationship.anniversary_notification_frequency || '1_week',
      date_ideas_frequency: relationship.date_ideas_frequency || 'weekly'
    });
    setIsEditingFrequencies(false);
  };

  if (isEditing) {
    return (
      <Card className="shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Editing {relationship.name}
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PersonEditForm 
            relationship={relationship}
            onSave={() => {
              setIsEditing(false);
              onUpdate();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {relationship.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 bg-rose-100 text-rose-700">
                {relationship.relationship_type}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Important Dates Section */}
        <div className="grid grid-cols-2 gap-3">
          {/* Birthday */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">Birthday</span>
            </div>
            <p className="text-sm font-medium text-amber-700">
              {relationship.birthday ? formatDateShort(relationship.birthday) : 'Not set'}
            </p>
          </div>

          {/* Anniversary */}
          <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-800">Anniversary</span>
            </div>
            <p className="text-sm font-medium text-rose-700">
              {relationship.anniversary ? formatDateShort(relationship.anniversary) : 'Not set'}
            </p>
          </div>
        </div>

        {/* Notification Frequencies Section */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Reminder Frequency</span>
            </div>
            {!isEditingFrequencies && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingFrequencies(true)}
                className="h-6 px-2 text-blue-600 hover:bg-blue-100"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>

          {isEditingFrequencies ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-blue-700 mb-1 block">Birthday Reminders</label>
                <Select
                  value={frequencies.birthday_notification_frequency}
                  onValueChange={(value) => {
                    console.log('Birthday frequency changed to:', value);
                    setFrequencies(prev => ({ ...prev, birthday_notification_frequency: value }));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs border-blue-200">
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
                <label className="text-xs text-blue-700 mb-1 block">Anniversary Reminders</label>
                <Select
                  value={frequencies.anniversary_notification_frequency}
                  onValueChange={(value) => {
                    console.log('Anniversary frequency changed to:', value);
                    setFrequencies(prev => ({ ...prev, anniversary_notification_frequency: value }));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs border-blue-200">
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
              
              {(relationship.relationship_type?.toLowerCase() === 'partner' || relationship.relationship_type?.toLowerCase() === 'spouse') && (
                <div>
                  <label className="text-xs text-blue-700 mb-1 block">Date Ideas Frequency</label>
                  <Select
                    value={frequencies.date_ideas_frequency}
                    onValueChange={(value) => {
                      console.log('Date ideas frequency changed to:', value);
                      setFrequencies(prev => ({ ...prev, date_ideas_frequency: value }));
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs border-blue-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="none">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleFrequencyUpdate}
                  disabled={isSaving}
                  className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelFrequencyEdit}
                  disabled={isSaving}
                  className="h-7 px-3 text-xs border-blue-200"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={`grid gap-3 text-xs ${(relationship.relationship_type?.toLowerCase() === 'partner' || relationship.relationship_type?.toLowerCase() === 'spouse') ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div>
                <span className="text-blue-600 font-medium">Birthday:</span>
                <p className="text-blue-700">{getFrequencyLabel(relationship.birthday_notification_frequency)}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Anniversary:</span>
                <p className="text-blue-700">{getFrequencyLabel(relationship.anniversary_notification_frequency)}</p>
              </div>
              {(relationship.relationship_type?.toLowerCase() === 'partner' || relationship.relationship_type?.toLowerCase() === 'spouse') && (
                <div>
                  <span className="text-blue-600 font-medium">Date Ideas:</span>
                  <p className="text-blue-700">{getDateIdeasFrequencyLabel(relationship.date_ideas_frequency)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Info */}
        {relationship.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{relationship.email}</span>
          </div>
        )}

        {/* Notes */}
        {relationship.notes && (
          <div>
            <span className="text-xs text-gray-500">Notes</span>
            <p className="text-sm text-gray-600 mt-1">{relationship.notes}</p>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-400 pt-2 border-t">
          Added on {formatDate(relationship.created_at)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonCard;
