
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
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
    return <AddRelationshipForm onSuccess={handleSuccess} onCancel={handleCancel} />;
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
