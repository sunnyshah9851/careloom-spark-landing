
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    birthday: '',
    anniversary: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add relationships');
      return;
    }

    if (!formData.name || !formData.relationship_type) {
      toast.error('Please fill in at least the name and relationship type');
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
          birthday: formData.birthday || null,
          anniversary: formData.anniversary || null,
          notes: formData.notes || null
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
          relationship_type: formData.relationship_type
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

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-rose-800">
            Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter their name"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship_type" className="text-sm font-medium text-rose-800">
            Relationship Type *
          </Label>
          <Select value={formData.relationship_type} onValueChange={(value) => handleInputChange('relationship_type', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select relationship type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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
          <Label htmlFor="email" className="text-sm font-medium text-rose-800">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter their email"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday" className="text-sm font-medium text-rose-800">
            Birthday
          </Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anniversary" className="text-sm font-medium text-rose-800">
            Anniversary
          </Label>
          <Input
            id="anniversary"
            type="date"
            value={formData.anniversary}
            onChange={(e) => handleInputChange('anniversary', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-rose-800">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special notes about this person"
            rows={3}
            className="w-full resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Relationship'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-6 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRelationshipForm;
