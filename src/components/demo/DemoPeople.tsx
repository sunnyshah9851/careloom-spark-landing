import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Heart, Calendar, Mail, Gift } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

const DemoPeople = () => {
  const { demoRelationships } = useDemo();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredRelationships = demoRelationships.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'partner': return 'bg-rose-100 text-rose-700';
      case 'family': return 'bg-blue-100 text-blue-700';
      case 'friend': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddPerson = () => {
    setShowAddForm(true);
    // In demo mode, we'll show a message about signing up
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-rose-800">Your People</h2>
          <p className="text-rose-600">Manage your relationships and connection history</p>
        </div>
        <Button onClick={handleAddPerson} className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-rose-400" />
        <Input
          placeholder="Search your people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-rose-200 focus:border-rose-400"
        />
      </div>

      {/* People Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredRelationships.map((person) => (
          <Card key={person.id} className="border-rose-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-rose-800 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500" />
                    {person.name}
                  </CardTitle>
                  <Badge className={`mt-2 ${getRelationshipTypeColor(person.relationship_type)}`}>
                    {person.relationship_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              {person.email && (
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <Mail className="h-4 w-4" />
                  {person.email}
                </div>
              )}
              
              {/* Important Dates */}
              <div className="space-y-2">
                {person.birthday && (
                  <div className="flex items-center gap-2 text-sm text-rose-700">
                    <Calendar className="h-4 w-4" />
                    Birthday: {new Date(person.birthday).toLocaleDateString()}
                  </div>
                )}
                {person.anniversary && (
                  <div className="flex items-center gap-2 text-sm text-rose-700">
                    <Heart className="h-4 w-4" />
                    Anniversary: {new Date(person.anniversary).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Notes */}
              {person.notes && (
                <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">
                  {person.notes}
                </div>
              )}

              {/* Tags */}
              {person.tags && person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {person.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-rose-300 text-rose-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50">
                  <Gift className="h-4 w-4 mr-1" />
                  Ideas
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Person Demo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-rose-800">Add Person (Demo)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-rose-600">
                In the full version, you can add unlimited people to track your relationships with them.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  Track birthdays and anniversaries
                </div>
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  Get personalized connection ideas
                </div>
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  Set up automatic reminders
                </div>
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  Keep notes and memories
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setShowAddForm(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Close
                </Button>
                <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">
                  Sign Up to Add People
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {filteredRelationships.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-rose-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-rose-800 mb-2">No people found</h3>
          <p className="text-rose-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};

export default DemoPeople;