
import { Input } from '@/components/ui/input';

interface PeopleSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const PeopleSearch = ({ searchTerm, onSearchChange }: PeopleSearchProps) => {
  return (
    <div className="max-w-md">
      <Input
        placeholder="Search by name or relationship type..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border-rose-200 focus:border-rose-400"
      />
    </div>
  );
};

export default PeopleSearch;
