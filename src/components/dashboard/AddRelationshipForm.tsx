
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AddRelationshipFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const AddRelationshipForm = ({ onSuccess, onCancel, isModal = false }: AddRelationshipFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship_type: 'partner',
    email: '',
    birthday: null as Date | null,
    anniversary: null as Date | null,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add relationships.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this relationship.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const relationshipData = {
        profile_id: user.id,
        name: formData.name.trim(),
        relationship_type: formData.relationship_type,
        email: formData.email.trim() || null,
        birthday: formData.birthday?.toISOString().split('T')[0] || null,
        anniversary: formData.anniversary?.toISOString().split('T')[0] || null,
        notes: formData.notes.trim() || null
      };

      const { data, error } = await supabase
        .from('relationships')
        .insert(relationshipData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding relationship:', error);
        toast({
          title: "Error",
          description: `Failed to add relationship: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Relationship added successfully:', data);
        toast({
          title: "Success! 💕",
          description: `${formData.name} has been added to your relationships.`,
        });
        
        // Reset the form
        setFormData({
          name: '',
          relationship_type: 'partner',
          email: '',
          birthday: null,
          anniversary: null,
          notes: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
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

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter their name"
            className="border-rose-200 focus:border-rose-400"
            required
          />
        </div>
        <div>
          <Label htmlFor="relationship_type">Relationship Type</Label>
          <select
            id="relationship_type"
            value={formData.relationship_type}
            onChange={(e) => handleInputChange('relationship_type', e.target.value)}
            className="flex h-10 w-full rounded-md border border-rose-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2"
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-rose-200 hover:border-rose-300",
                  !formData.birthday && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthday ? format(formData.birthday, "MMM do, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.birthday || undefined}
                onSelect={(date) => handleInputChange('birthday', date || null)}
                initialFocus
                defaultMonth={new Date(1990, 0)}
                captionLayout="dropdown-buttons"
                fromYear={1950}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="anniversary">Anniversary (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-rose-200 hover:border-rose-300",
                  !formData.anniversary && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.anniversary ? format(formData.anniversary, "MMM do, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.anniversary || undefined}
                onSelect={(date) => handleInputChange('anniversary', date || null)}
                initialFocus
                defaultMonth={new Date(2020, 0)}
                captionLayout="dropdown-buttons"
                fromYear={1980}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="their.email@example.com"
          className="border-rose-200 focus:border-rose-400"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any special notes about this person..."
          className="border-rose-200 focus:border-rose-400"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={loading || !formData.name.trim()}
          className="bg-rose-500 hover:bg-rose-600 text-white flex-1"
        >
          {loading ? 'Adding...' : 'Add to My Circle'}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );

  if (isModal) {
    return content;
  }

  return (
    <Card className="border-rose-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-playfair text-rose-800">
            Add Someone Special
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default AddRelationshipForm;
