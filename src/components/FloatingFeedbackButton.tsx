
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '@/contexts/AuthContext';

const FloatingFeedbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Show for all users (both authenticated and non-authenticated)
  // since this is for beta users specifically
  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-rose-600 hover:bg-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 p-0 animate-pulse hover:animate-none"
        aria-label="Give feedback to Sunny"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FloatingFeedbackButton;
