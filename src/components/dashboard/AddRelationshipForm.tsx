
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter their name"
          required
        />
      </div>

      <div>
        <Label htmlFor="relationship_type">Relationship Type *</Label>
        <Select value={formData.relationship_type} onValueChange={(value) => handleInputChange('relationship_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select relationship type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="spouse">Spouse</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="friend">Friend</SelectItem>
            <SelectItem value="colleague">Colleague</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter their email"
        />
      </div>

      <div>
        <Label htmlFor="birthday">Birthday</Label>
        <Input
          id="birthday"
          type="date"
          value={formData.birthday}
          onChange={(e) => handleInputChange('birthday', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="anniversary">Anniversary</Label>
        <Input
          id="anniversary"
          type="date"
          value={formData.anniversary}
          onChange={(e) => handleInputChange('anniversary', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any special notes about this person"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Adding...' : 'Add Relationship'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddRelationshipForm;
