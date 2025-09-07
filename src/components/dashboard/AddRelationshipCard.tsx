
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft } from 'lucide-react';
import AddRelationshipForm from './AddRelationshipForm';

interface AddRelationshipCardProps {
  onRelationshipAdded?: () => void;
}

const AddRelationshipCard = ({ onRelationshipAdded }: AddRelationshipCardProps) => {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    if (onRelationshipAdded) {
      onRelationshipAdded();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <Card className="border-rose-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-lg font-playfair text-rose-800">
                Add Someone Special
              </CardTitle>
              <CardDescription className="text-rose-600">
                Tell us about someone important in your life
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AddRelationshipForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Button 
      onClick={() => setShowForm(true)}
      variant="outline"
      className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Relationship
    </Button>
  );
};

export default AddRelationshipCard;
