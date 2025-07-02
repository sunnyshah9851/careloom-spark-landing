
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityInput } from '@/components/ui/city-input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';

interface AddRelationshipFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddRelationshipForm = ({ onSuccess, onCancel }: AddRelationshipFormProps) => {
  const { user } = useAuth();
  const { recordEvent } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship_type: '',
    city: '',
    birthday: '',
    anniversary: '',
    notes: '',
    birthday_notification_frequency: '1_week',
    anniversary_notification_frequency: '1_week'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add relationships');
      return;
    }

    if (!formData.name || !formData.relationship_type || !formData.birthday) {
      toast.error('Please fill in the name, relationship type, and birthday fields');
      return;
    }

    // Check if email is required for partner/spouse relationships
    const isPartnerRelationship = formData.relationship_type === 'partner' || formData.relationship_type === 'spouse';
    if (isPartnerRelationship && !formData.email) {
      toast.error('Email is required for partner and spouse relationships');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('relationships')
        .insert({
          profile_id: user.id,
          name: formData.name,
          email: formData.email || null,
          relationship_type: formData.relationship_type,
          city: formData.city || null,
          birthday: formData.birthday,
          anniversary: formData.anniversary || null,
          notes: formData.notes || null,
          birthday_notification_frequency: formData.birthday_notification_frequency,
          anniversary_notification_frequency: formData.anniversary_notification_frequency
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Record the relationship added event
      await recordEvent(
        data.id,
        'relationship_added',
        {
          action_description: `Added ${formData.name} as a new ${formData.relationship_type} relationship`,
          relationship_name: formData.name,
          relationship_type: formData.relationship_type,
          birthday_notification_frequency: formData.birthday_notification_frequency,
          anniversary_notification_frequency: formData.anniversary_notification_frequency
        }
      );

      toast.success(`${formData.name} has been added to your relationships!`);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding relationship:', error);
      toast.error('Failed to add relationship. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isPartnerRelationship = formData.relationship_type === 'partner' || formData.relationship_type === 'spouse';

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          📧 All communication is currently via email. Text messaging will be available in the future.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-900">
            Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter their name"
            required
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship_type" className="text-sm font-medium text-gray-900">
            Relationship Type *
          </Label>
          <Select value={formData.relationship_type} onValueChange={(value) => handleInputChange('relationship_type', value)}>
            <SelectTrigger className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500">
              <SelectValue placeholder="Select relationship type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="spouse">Spouse</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-900">
            City
          </Label>
          <CityInput
            id="city"
            value={formData.city}
            onChange={(value) => handleInputChange('city', value)}
            placeholder="Search for a city..."
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email {isPartnerRelationship && '*'}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter their email"
            required={isPartnerRelationship}
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday" className="text-sm font-medium text-gray-900">
            Birthday *
          </Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            required
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday_notification_frequency" className="text-sm font-medium text-gray-900">
            Birthday Notification Frequency
          </Label>
          <Select value={formData.birthday_notification_frequency} onValueChange={(value) => handleInputChange('birthday_notification_frequency', value)}>
            <SelectTrigger className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="1_day">1 day before</SelectItem>
              <SelectItem value="3_days">3 days before</SelectItem>
              <SelectItem value="1_week">1 week before</SelectItem>
              <SelectItem value="2_weeks">2 weeks before</SelectItem>
              <SelectItem value="1_month">1 month before</SelectItem>
              <SelectItem value="none">No reminders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isPartnerRelationship && (
          <>
            <div className="space-y-2">
              <Label htmlFor="anniversary" className="text-sm font-medium text-gray-900">
                Anniversary
              </Label>
              <Input
                id="anniversary"
                type="date"
                value={formData.anniversary}
                onChange={(e) => handleInputChange('anniversary', e.target.value)}
                className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anniversary_notification_frequency" className="text-sm font-medium text-gray-900">
                Anniversary Notification Frequency
              </Label>
              <Select value={formData.anniversary_notification_frequency} onValueChange={(value) => handleInputChange('anniversary_notification_frequency', value)}>
                <SelectTrigger className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  <SelectItem value="1_day">1 day before</SelectItem>
                  <SelectItem value="3_days">3 days before</SelectItem>
                  <SelectItem value="1_week">1 week before</SelectItem>
                  <SelectItem value="2_weeks">2 weeks before</SelectItem>
                  <SelectItem value="1_month">1 month before</SelectItem>
                  <SelectItem value="none">No reminders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-900">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special notes about this person"
            rows={3}
            className="w-full resize-none border-gray-300 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Relationship'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRelationshipForm;
