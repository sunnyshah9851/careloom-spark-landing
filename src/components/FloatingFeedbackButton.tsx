
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '@/contexts/AuthContext';

const FloatingFeedbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Only show for authenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-rose-600 hover:bg-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 p-0"
        aria-label="Give feedback"
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FloatingFeedbackButton;
