
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddRelationshipModal from './AddRelationshipModal';

interface AddRelationshipCardProps {
  onRelationshipAdded?: () => void;
}

const AddRelationshipCard = ({ onRelationshipAdded }: AddRelationshipCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleRelationshipAdded = async () => {
    if (onRelationshipAdded) {
      onRelationshipAdded();
    }
  };

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        variant="outline"
        className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Relationship
      </Button>
      
      <AddRelationshipModal
        open={showModal}
        onOpenChange={setShowModal}
        onRelationshipAdded={handleRelationshipAdded}
      />
    </>
  );
};

export default AddRelationshipCard;
