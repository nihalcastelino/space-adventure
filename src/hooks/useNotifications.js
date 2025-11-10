import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(async (title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    // Only send notification if tab is not focused
    if (document.hidden) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'turn-notification',
          renotify: true,
          ...options
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification
  };
}
