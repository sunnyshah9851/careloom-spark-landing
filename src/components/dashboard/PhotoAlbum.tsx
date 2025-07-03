
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Plus, Heart, Trash2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
  relationshipId?: string;
}

interface PhotoAlbumProps {
  photos: Photo[];
  onAddPhoto: (photo: Omit<Photo, 'id'>) => void;
  onDeletePhoto: (photoId: string) => void;
}

const PhotoAlbum = ({ photos, onAddPhoto, onDeletePhoto }: PhotoAlbumProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    url: '',
    caption: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddPhoto = () => {
    if (newPhoto.url) {
      onAddPhoto({
        ...newPhoto,
        date: newPhoto.date || new Date().toISOString().split('T')[0]
      });
      setNewPhoto({ url: '', caption: '', date: new Date().toISOString().split('T')[0] });
      setIsAddDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Camera className="h-5 w-5" />
              Photo Memories
            </CardTitle>
            <CardDescription>Capture your special moments together</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                <Plus className="h-4 w-4 mr-1" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Photo</DialogTitle>
                <DialogDescription>Add a special memory to your collection</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Photo URL</label>
                  <Input
                    placeholder="Paste image URL here..."
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Caption</label>
                  <Textarea
                    placeholder="Write a caption for this memory..."
                    value={newPhoto.caption}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, caption: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newPhoto.date}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddPhoto} className="w-full bg-rose-500 hover:bg-rose-600">
                  Add Photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-rose-300 mx-auto mb-4" />
            <p className="text-rose-600">No photos yet. Start adding your favorite memories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {photo.caption && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{photo.caption}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{new Date(photo.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoAlbum;
