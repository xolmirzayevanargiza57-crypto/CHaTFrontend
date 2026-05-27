import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../i18n';
import { Globe, Moon, Sun, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { lang, changeLang } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div className="settings-page fade-in">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/chat')}>
          <ChevronLeft size={24} />
        </button>
        <h1>{t.settings}</h1>
      </div>

      <div className="settings-content">
        <section>
          <div className="section-title">
            <Globe size={18} />
            <span>{t.language}</span>
          </div>
          <div className="language-options">
            <button 
              className={lang === 'uz' ? 'active' : ''} 
              onClick={() => changeLang('uz')}
            >
              O'zbekcha 🇺🇿
            </button>
            <button 
              className={lang === 'ru' ? 'active' : ''} 
              onClick={() => changeLang('ru')}
            >
              Русский 🇷🇺
            </button>
            <button 
              className={lang === 'en' ? 'active' : ''} 
              onClick={() => changeLang('en')}
            >
              English 🇬🇧
            </button>
          </div>
        </section>

        <section>
          <div className="section-title">
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{t.theme}</span>
          </div>
          <div className="theme-toggle-row" onClick={toggleTheme}>
            <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            <div className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}>
              <div className="toggle-handle"></div>
            </div>
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .settings-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .settings-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .back-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          padding: 0.5rem;
          border-radius: 0.75rem;
        }
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        section {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .language-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .language-options button {
          text-align: left;
          padding: 1rem;
          border-radius: 0.75rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-weight: 500;
          transition: all 0.2s;
        }
        .language-options button.active {
          background: var(--accent);
          color: white;
        }
        .theme-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: 0.75rem;
          cursor: pointer;
        }
        .toggle-switch {
          width: 48px;
          height: 24px;
          background: var(--border);
          border-radius: 12px;
          position: relative;
          transition: background 0.3s;
        }
        .toggle-switch.on {
          background: var(--accent);
        }
        .toggle-handle {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: left 0.3s;
        }
        .toggle-switch.on .toggle-handle {
          left: 26px;
        }
      `}</style>
    </div>
  );
};

export default Settings;
