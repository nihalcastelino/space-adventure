import { useState, useEffect } from 'react';
import { NotificationToast } from './ProgressionUI';

export function NotificationManager({ notifications, onClearNotifications }) {
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  useEffect(() => {
    if (notifications.length > 0) {
      // Add new notifications
      setDisplayedNotifications(prev => [...prev, ...notifications]);

      // Clear from parent
      onClearNotifications();

      // Auto-dismiss after 5 seconds
      const timers = notifications.map((_, index) =>
        setTimeout(() => {
          setDisplayedNotifications(prev => prev.slice(1));
        }, 5000 + (index * 500)) // Stagger dismissals
      );

      return () => timers.forEach(clearTimeout);
    }
  }, [notifications, onClearNotifications]);

  const handleClose = (index) => {
    setDisplayedNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {displayedNotifications.map((notification, index) => (
        <div
          key={`${notification.type}-${index}`}
          style={{ top: `${1 + index * 7}rem` }}
          className="fixed right-4 z-50"
        >
          <NotificationToast
            notification={notification}
            onClose={() => handleClose(index)}
          />
        </div>
      ))}
    </>
  );
}
