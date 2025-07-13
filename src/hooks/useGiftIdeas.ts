import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface GiftIdea {
  id: string;
  title: string;
  description: string;
  price: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  relationshipId?: string;
  dateAdded: string;
}

export const useGiftIdeas = () => {
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGiftIdeas = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('gift_ideas')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) throw error;

      const formattedGiftIdeas: GiftIdea[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        price: item.price || '',
        priority: item.priority as 'low' | 'medium' | 'high',
        category: item.category,
        relationshipId: item.relationship_id || undefined,
        dateAdded: item.date_added
      }));

      setGiftIdeas(formattedGiftIdeas);
    } catch (error) {
      console.error('Error fetching gift ideas:', error);
      toast({
        title: "Error",
        description: "Failed to load gift ideas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addGiftIdea = async (giftData: Omit<GiftIdea, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('gift_ideas')
        .insert({
          user_id: user.id,
          title: giftData.title,
          description: giftData.description,
          price: giftData.price,
          priority: giftData.priority,
          category: giftData.category,
          relationship_id: giftData.relationshipId || null
        })
        .select()
        .single();

      if (error) throw error;

      const newGiftIdea: GiftIdea = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        price: data.price || '',
        priority: data.priority as 'low' | 'medium' | 'high',
        category: data.category,
        relationshipId: data.relationship_id || undefined,
        dateAdded: data.date_added
      };

      setGiftIdeas(prev => [newGiftIdea, ...prev]);
      
      toast({
        title: "Success",
        description: "Gift idea added successfully"
      });
    } catch (error) {
      console.error('Error adding gift idea:', error);
      toast({
        title: "Error",
        description: "Failed to add gift idea",
        variant: "destructive"
      });
    }
  };

  const deleteGiftIdea = async (giftId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('gift_ideas')
        .delete()
        .eq('id', giftId);

      if (error) throw error;

      setGiftIdeas(prev => prev.filter(gift => gift.id !== giftId));
      
      toast({
        title: "Success",
        description: "Gift idea deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting gift idea:', error);
      toast({
        title: "Error",
        description: "Failed to delete gift idea",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchGiftIdeas();
  }, [user]);

  return {
    giftIdeas,
    loading,
    addGiftIdea,
    deleteGiftIdea,
    refetch: fetchGiftIdeas
  };
};