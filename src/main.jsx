import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker for PWA (skip in development for hot reload)
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('ServiceWorker registered:', registration);

        // Check for updates immediately and periodically
        registration.update();
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, reload to activate
                console.log('New service worker available, reloading...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('ServiceWorker registration failed:', error);
      });
  });
} else if (import.meta.env.DEV) {
  // In development mode, unregister all service workers to avoid conflicts with HMR
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('DEV MODE: Unregistering service worker for hot reload:', registration.active?.scriptURL);
      registration.unregister();
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

