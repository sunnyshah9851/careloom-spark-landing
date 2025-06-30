
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
    <Card className="border-rose-200 border-dashed hover:border-rose-300 transition-colors cursor-pointer group">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
          <Plus className="h-8 w-8 text-rose-500" />
        </div>
        <CardTitle className="text-lg font-playfair text-rose-800">
          Add Someone Special
        </CardTitle>
        <CardDescription className="text-rose-600">
          Add someone else you care about to your circle
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddRelationshipCard;
