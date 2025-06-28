
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AddRelationshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRelationshipAdded: () => Promise<void>;
}

const AddRelationshipModal = ({ open, onOpenChange, onRelationshipAdded }: AddRelationshipModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship_type: 'partner',
    email: '',
    birthday: '',
    anniversary: '',
    notes: ''
  });

  console.log('AddRelationshipModal render - open:', open);

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
        birthday: formData.birthday || null,
        anniversary: formData.anniversary || null,
        notes: formData.notes.trim() || null
      };

      console.log('Submitting relationship data:', relationshipData);

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
          birthday: '',
          anniversary: '',
          notes: ''
        });
        
        // Close modal and refresh relationships
        onOpenChange(false);
        await onRelationshipAdded();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-rose-800">
            Add New Relationship
          </DialogTitle>
          <DialogDescription className="text-rose-600">
            Tell us about someone important in your life
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modal-name">Name *</Label>
              <Input
                id="modal-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter their name"
                required
              />
            </div>
            <div>
              <Label htmlFor="modal-relationship_type">Relationship Type</Label>
              <select
                id="modal-relationship_type"
                value={formData.relationship_type}
                onChange={(e) => handleInputChange('relationship_type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="modal-birthday">Birthday (Optional)</Label>
              <Input
                id="modal-birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="modal-anniversary">Anniversary (Optional)</Label>
              <Input
                id="modal-anniversary"
                type="date"
                value={formData.anniversary}
                onChange={(e) => handleInputChange('anniversary', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="modal-email">Email (Optional)</Label>
            <Input
              id="modal-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="their.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="modal-notes">Notes (Optional)</Label>
            <Input
              id="modal-notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special notes about this person..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()}
              className="bg-rose-500 hover:bg-rose-600 text-white flex-1"
            >
              {loading ? 'Adding...' : 'Add Relationship'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRelationshipModal;
