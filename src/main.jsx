import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Fix for globals if needed by libraries
if (typeof window !== 'undefined') {
  window.global = window;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = apiUrl;
console.log(`[APP] Connecting to: ${apiUrl}`);
console.log(`[APP] Build Date: ${new Date().toLocaleString()}`);


// Add token to all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Logout on 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registered:', reg);
      })
      .catch(err => {
        console.error('[PWA] Service Worker registration failed:', err);
      });
  });
}

// Handle PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Store in localStorage to check if user dismissed it
  const lastDismissed = localStorage.getItem('installPromptDismissed');
  const now = Date.now();
  if (!lastDismissed || (now - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000) {
    // Show install button after 2 seconds (only if not recently dismissed)
    setTimeout(() => {
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.style.display = 'flex';
      }
    }, 2000);
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed');
  deferredPrompt = null;
  localStorage.removeItem('installPromptDismissed');
  const installBtn = document.getElementById('install-pwa-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
});

// Global function to trigger install
window.installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] App install accepted');
    } else {
      console.log('[PWA] App install dismissed');
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    }
    deferredPrompt = null;
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
