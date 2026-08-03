import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = () => {
      // The prompt will be shown by main.jsx
      const btn = document.getElementById('install-pwa-btn');
      if (btn) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!showPrompt) return null;

  const handleInstall = () => {
    window.installPWA?.();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <div 
      id="install-pwa-btn"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #0095f6 0%, #0a66c2 100%)',
        color: 'white',
        padding: '14px 18px',
        borderRadius: '12px',
        display: 'none',
        alignItems: 'center',
        gap: '10px',
        zIndex: 9999,
        boxShadow: '0 8px 16px rgba(0, 149, 246, 0.3)',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        maxWidth: '280px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 149, 246, 0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 149, 246, 0.3)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <button
        onClick={handleInstall}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          padding: 0,
          flex: 1
        }}
      >
        <Download size={18} />
        <span>Ilovani o'rnatish</span>
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px'
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
