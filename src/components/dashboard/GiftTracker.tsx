
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Star, Trash2 } from 'lucide-react';

interface GiftIdea {
  id: string;
  title: string;
  description: string;
  price: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  relationshipId?: string;
  dateAdded: string;
}

interface GiftTrackerProps {
  giftIdeas: GiftIdea[];
  onAddGift: (gift: Omit<GiftIdea, 'id'>) => void;
  onDeleteGift: (giftId: string) => void;
}

const GiftTracker = ({ giftIdeas, onAddGift, onDeleteGift }: GiftTrackerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGift, setNewGift] = useState({
    title: '',
    description: '',
    price: '',
    priority: 'medium' as const,
    category: ''
  });

  const handleAddGift = () => {
    if (newGift.title) {
      onAddGift({
        ...newGift,
        dateAdded: new Date().toISOString()
      });
      setNewGift({
        title: '',
        description: '',
        price: '',
        priority: 'medium',
        category: ''
      });
      setIsAddDialogOpen(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Gift className="h-5 w-5" />
              Gift Ideas
            </CardTitle>
            <CardDescription>Keep track of gift ideas for your loved ones</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                <Plus className="h-4 w-4 mr-1" />
                Add Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Gift Idea</DialogTitle>
                <DialogDescription>Save a gift idea for later</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Gift Title</label>
                  <Input
                    placeholder="What's the gift idea?"
                    value={newGift.title}
                    onChange={(e) => setNewGift(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Any additional details..."
                    value={newGift.description}
                    onChange={(e) => setNewGift(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Estimated Price</label>
                    <Input
                      placeholder="$0.00"
                      value={newGift.price}
                      onChange={(e) => setNewGift(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newGift.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGift(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    placeholder="e.g., Books, Electronics, Jewelry"
                    value={newGift.category}
                    onChange={(e) => setNewGift(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddGift} className="w-full bg-rose-500 hover:bg-rose-600">
                  Add Gift Idea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {giftIdeas.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-rose-300 mx-auto mb-4" />
            <p className="text-rose-600">No gift ideas yet. Start tracking thoughtful presents!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {giftIdeas.map((gift) => (
              <div key={gift.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{gift.title}</h3>
                      <Badge className={getPriorityColor(gift.priority)}>
                        {gift.priority === 'high' && <Star className="h-3 w-3 mr-1" />}
                        {gift.priority}
                      </Badge>
                      {gift.category && (
                        <Badge variant="outline">{gift.category}</Badge>
                      )}
                    </div>
                    {gift.description && (
                      <p className="text-sm text-gray-600 mb-2">{gift.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {gift.price && <span>Est. {gift.price}</span>}
                      <span>Added {new Date(gift.dateAdded).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteGift(gift.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftTracker;
