import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CityInput } from '@/components/ui/city-input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';
import { Heart, Sparkles, Calendar, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizePhoneForDB } from '@/lib/phone';

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
    phone_number: '',
    relationship_type: '',
    city: '',
    birthday: '',
    anniversary: '',
    notes: '',
    birthday_notification_frequency: '1_week',
    anniversary_notification_frequency: '1_week',
    date_ideas_frequency: 'weekly'
  });

  const nudgeOptions = [
    {
      value: 'weekly',
      label: 'Weekly Magic ✨',
      description: 'Fresh date ideas every Friday',
      emoji: '🔥',
      highlight: 'Most Popular!'
    },
    {
      value: 'biweekly',
      label: 'Bi-Weekly Boost 💫',
      description: 'Curated experiences every 2 weeks',
      emoji: '⭐'
    },
    {
      value: 'monthly',
      label: 'Monthly Moments 🌟',
      description: 'Special date ideas once a month',
      emoji: '💎'
    }
  ];

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
      // Save the relationship with date_ideas_frequency
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
          anniversary_notification_frequency: formData.anniversary_notification_frequency,
          date_ideas_frequency: isPartnerRelationship ? formData.date_ideas_frequency : null,
          phone_number: normalizePhoneForDB(formData.phone_number)
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
          anniversary_notification_frequency: formData.anniversary_notification_frequency,
          ...(isPartnerRelationship && { date_ideas_frequency: formData.date_ideas_frequency })
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
          📧 Add a WhatsApp number to chat directly from the app. Email is still supported.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-black">
            Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter their name"
            required
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship_type" className="text-sm font-medium text-black">
            Relationship Type *
          </Label>
          <Select value={formData.relationship_type} onValueChange={(value) => handleInputChange('relationship_type', value)}>
            <SelectTrigger className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black">
              <SelectValue placeholder="Select relationship type" className="text-gray-500" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="partner" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">Partner</SelectItem>
              <SelectItem value="spouse" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">Spouse</SelectItem>
              <SelectItem value="family" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">Family</SelectItem>
              <SelectItem value="friend" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">Friend</SelectItem>
              <SelectItem value="colleague" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">Colleague</SelectItem>
              <SelectItem value="other" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-black">
            City
          </Label>
          <CityInput
            id="city"
            value={formData.city}
            onChange={(value) => handleInputChange('city', value)}
            placeholder="Search for a city..."
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-black">
            Email {isPartnerRelationship && '*'}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter their email"
            required={isPartnerRelationship}
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
  <Label htmlFor="phone_number" className="text-sm font-medium text-black">
    WhatsApp number
  </Label>
  <Input
    id="phone_number"
    type="tel"
    value={formData.phone_number}
    onChange={(e) => handleInputChange('phone_number', e.target.value)}
    placeholder="+14155551234 or +91..."
    className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black placeholder:text-gray-500"
  />
  <p className="text-xs text-gray-500">
    Use international format including the country code (e.g., +1, +91).
  </p>
</div>


        <div className="space-y-2">
          <Label htmlFor="birthday" className="text-sm font-medium text-black">
            Birthday *
          </Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]} // <-- Add this line
            className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday_notification_frequency" className="text-sm font-medium text-black">
            Birthday Notification Frequency
          </Label>
          <Select value={formData.birthday_notification_frequency} onValueChange={(value) => handleInputChange('birthday_notification_frequency', value)}>
            <SelectTrigger className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="1_day" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">1 day before</SelectItem>
              <SelectItem value="3_days" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">3 days before</SelectItem>
              <SelectItem value="1_week" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">1 week before</SelectItem>
              <SelectItem value="2_weeks" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">2 weeks before</SelectItem>
              <SelectItem value="1_month" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">1 month before</SelectItem>
              <SelectItem value="none" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">No reminders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isPartnerRelationship && (
          <>
            <div className="space-y-2">
              <Label htmlFor="anniversary" className="text-sm font-medium text-black">
                Anniversary
              </Label>
              <Input
                id="anniversary"
                type="date"
                value={formData.anniversary}
                onChange={(e) => handleInputChange('anniversary', e.target.value)}
                max={new Date().toISOString().split('T')[0]} // <-- Add this line
                className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anniversary_notification_frequency" className="text-sm font-medium text-black">
                Anniversary Notification Frequency
              </Label>
              <Select value={formData.anniversary_notification_frequency} onValueChange={(value) => handleInputChange('anniversary_notification_frequency', value)}>
                <SelectTrigger className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  <SelectItem value="1_day" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">1 day before</SelectItem>
                  <SelectItem value="3_days" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">3 days before</SelectItem>
                  <SelectItem value="1_week" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">1 week before</SelectItem>
                  <SelectItem value="2_weeks" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">2 weeks before</SelectItem>
                  <SelectItem value="1_month" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">1 month before</SelectItem>
                  <SelectItem value="none" className="text-black hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black">No reminders</SelectItem>
                </SelectContent>
              </Select>
            </div>         
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-black">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special notes about this person"
            rows={3}
            className="w-full resize-none border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black placeholder:text-gray-500"
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
