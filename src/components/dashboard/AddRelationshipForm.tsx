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
    anniversary_notification_frequency: '1_week',
    nudge_frequency: 'weekly'
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
      // First, save/update the user's profile with nudge frequency if it's a partner/spouse relationship
      if (isPartnerRelationship) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            nudge_frequency: formData.nudge_frequency,
          });

        if (profileError) throw profileError;
      }

      // Then, save the relationship
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
          anniversary_notification_frequency: formData.anniversary_notification_frequency,
          ...(isPartnerRelationship && { nudge_frequency: formData.nudge_frequency })
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
          <Label htmlFor="birthday" className="text-sm font-medium text-black">
            Birthday *
          </Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            required
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

            {/* General Relationship Nudges Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-3xl">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">💌</div>
                <h3 className="text-xl font-bold text-rose-800 mb-2">
                  Get Irresistible Date Ideas! 
                </h3>
                <p className="text-rose-700 text-sm font-medium mb-1">
                  Never run out of romantic ideas for {formData.name} again
                </p>
                <p className="text-rose-600 text-xs mb-4">
                  Join 10,000+ couples who never have boring weekends ✨
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl mb-6 border border-rose-100">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <p className="text-rose-800 font-bold text-sm mb-2">You'll get personalized:</p>
                    <div className="space-y-2 text-rose-700 text-xs">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-3 w-3 text-rose-500" />
                        <span>3 curated date ideas perfectly matched to your relationship</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Coffee className="h-3 w-3 text-rose-500" />
                        <span>Local hotspots and hidden gems in your city</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-3 w-3 text-rose-500" />
                        <span>Budget-friendly to luxury options</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-rose-500" />
                        <span>Seasonal activities and special events</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-rose-800">
                  How often do you want to be inspired?
                </Label>
                <RadioGroup
                  value={formData.nudge_frequency}
                  onValueChange={(value) => handleInputChange('nudge_frequency', value)}
                  className="space-y-2"
                >
                  {nudgeOptions.map((option) => (
                    <label 
                      key={option.value} 
                      htmlFor={`nudge-${option.value}`}
                      className={cn(
                        "relative flex items-center space-x-3 p-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105",
                        formData.nudge_frequency === option.value 
                          ? "bg-gradient-to-r from-rose-100 to-pink-100 border-rose-400 shadow-lg" 
                          : "border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                      )}
                    >
                      {option.highlight && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {option.highlight}
                        </div>
                      )}
                      <RadioGroupItem value={option.value} id={`nudge-${option.value}`} className="w-4 h-4" />
                      <div className="text-xl">{option.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-rose-800 text-sm">
                          {option.label}
                        </div>
                        <p className="text-rose-700 text-xs">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 font-semibold text-xs">
                  ⚡ Limited Time: First month of premium date ideas FREE!
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Usually $9.99/month • Cancel anytime
                </p>
              </div>
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
