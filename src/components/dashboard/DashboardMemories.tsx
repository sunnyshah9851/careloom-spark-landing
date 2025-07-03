
import { useState } from 'react';
import PhotoAlbum from './PhotoAlbum';
import GiftTracker from './GiftTracker';
import VoiceMemos from './VoiceMemos';

interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
  relationshipId?: string;
}

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

interface VoiceMemo {
  id: string;
  title: string;
  content: string;
  dateCreated: string;
  relationshipId?: string;
  tags: string[];
}

const DashboardMemories = () => {
  // Local state for demo purposes - in a real app, this would come from Supabase
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [voiceMemos, setVoiceMemos] = useState<VoiceMemo[]>([]);

  const handleAddPhoto = (photoData: Omit<Photo, 'id'>) => {
    const newPhoto: Photo = {
      ...photoData,
      id: Date.now().toString()
    };
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleAddGift = (giftData: Omit<GiftIdea, 'id'>) => {
    const newGift: GiftIdea = {
      ...giftData,
      id: Date.now().toString()
    };
    setGiftIdeas(prev => [newGift, ...prev]);
  };

  const handleDeleteGift = (giftId: string) => {
    setGiftIdeas(prev => prev.filter(gift => gift.id !== giftId));
  };

  const handleAddMemo = (memoData: Omit<VoiceMemo, 'id'>) => {
    const newMemo: VoiceMemo = {
      ...memoData,
      id: Date.now().toString()
    };
    setVoiceMemos(prev => [newMemo, ...prev]);
  };

  const handleDeleteMemo = (memoId: string) => {
    setVoiceMemos(prev => prev.filter(memo => memo.id !== memoId));
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Memories & Ideas
        </h1>
        <p className="text-rose-600 text-lg">
          Capture and cherish your special moments, thoughts, and gift ideas
        </p>
      </div>

      <div className="space-y-8">
        <PhotoAlbum 
          photos={photos}
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
        />
        
        <VoiceMemos
          memos={voiceMemos}
          onAddMemo={handleAddMemo}
          onDeleteMemo={handleDeleteMemo}
        />
        
        <GiftTracker
          giftIdeas={giftIdeas}
          onAddGift={handleAddGift}
          onDeleteGift={handleDeleteGift}
        />
      </div>
    </div>
  );
};

export default DashboardMemories;
