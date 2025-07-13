import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Push notifications enabled!');
        return true;
      } else if (result === 'denied') {
        toast.error('Push notifications blocked. Please enable them in your browser settings.');
        return false;
      } else {
        toast.error('Push notification permission dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Careloom Test', {
        body: 'Push notifications are working! 🎉',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification,
    canSendNotifications: permission === 'granted',
  };
};