
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface PeopleHeaderProps {
  onAddClick: () => void;
}

const PeopleHeader = ({ onAddClick }: PeopleHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full">
          <Users className="h-8 w-8 text-rose-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-playfair text-gray-900">
            People in Your Circle
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your relationships and stay connected
          </p>
        </div>
      </div>
      <Button 
        onClick={onAddClick}
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Someone
      </Button>
    </div>
  );
};

export default PeopleHeader;
