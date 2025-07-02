
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface PeopleEmptyStateProps {
  searchTerm: string;
}

const PeopleEmptyState = ({ searchTerm }: PeopleEmptyStateProps) => {
  return (
    <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="text-center py-12">
        <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {searchTerm ? 'No matches found' : 'No relationships yet'}
        </h3>
        <p className="text-gray-600 mb-6">
          {searchTerm 
            ? 'Try adjusting your search terms' 
            : 'Add your first relationship to start building your circle'
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default PeopleEmptyState;
