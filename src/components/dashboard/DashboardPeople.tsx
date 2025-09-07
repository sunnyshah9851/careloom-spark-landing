
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddRelationshipForm from './AddRelationshipForm';
import PersonCard from './PersonCard';
import PeopleHeader from './PeopleHeader';
import PeopleSearch from './PeopleSearch';
import PeopleEmptyState from './PeopleEmptyState';

interface Relationship {
  id: string;
  profile_id: string;
  relationship_type: string;
  name: string;
  email?: string;
  phone_number?: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  last_nudge_sent?: string;
  tags?: string[];
  created_at: string;
}

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
}

interface DashboardPeopleProps {
  relationships: Relationship[];
  profile: Profile | null;
  onRelationshipsUpdate: () => void;
}

const DashboardPeople = ({ relationships, profile, onRelationshipsUpdate }: DashboardPeopleProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRelationships = relationships.filter(relationship =>
    relationship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relationship.relationship_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRelationshipAdded = () => {
    setShowAddForm(false);
    onRelationshipsUpdate();
  };

  if (showAddForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-rose-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-playfair text-rose-800">
                  Add Someone Special
                </CardTitle>
                <CardDescription className="text-rose-600 mt-1">
                  Tell us about someone important in your life
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AddRelationshipForm 
              onSuccess={handleRelationshipAdded} 
              onCancel={() => setShowAddForm(false)} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PeopleHeader onAddClick={() => setShowAddForm(true)} />

      {/* Search */}
      <PeopleSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Relationships Grid */}
      {filteredRelationships.length === 0 ? (
        <PeopleEmptyState searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRelationships.map((relationship) => (
            <PersonCard
              key={relationship.id}
              relationship={relationship}
              onUpdate={onRelationshipsUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPeople;
