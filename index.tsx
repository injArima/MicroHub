import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use absolute path '/sw.js' to ensure it resolves to the domain root (standard for Vercel)
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        // Log error but do not crash app. 
        // This specific error might occur in preview environments with mismatched origins.
        console.warn('ServiceWorker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);