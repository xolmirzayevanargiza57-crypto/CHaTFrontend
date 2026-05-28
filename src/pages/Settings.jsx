import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../i18n';
import { Globe, Moon, Sun, ChevronLeft, Check, Palette, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { lang, changeLang } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <div className="tg-header">
        <button className="tg-back" onClick={() => navigate('/chat')}>
          <ChevronLeft size={22} />
        </button>
        <h1>{t.settings}</h1>
      </div>

      <div className="tg-section">
        <div className="tg-section-label">
          <Globe size={16} />
          <span>{t.language}</span>
        </div>
        <div className="tg-list">
          {[
            { code: 'uz', name: "O'zbekcha", flag: 'https://flagcdn.com/w40/uz.png' },
            { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/w40/ru.png' },
            { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
          ].map((item) => (
            <div 
              key={item.code}
              className={`tg-list-item ${lang === item.code ? 'active' : ''}`}
              onClick={() => changeLang(item.code)}
            >
              <img src={item.flag} alt={item.code} className="tg-flag" />
              <span className="tg-list-text">{item.name}</span>
              {lang === item.code && <Check size={20} className="tg-check" />}
            </div>
          ))}
        </div>
      </div>

      <div className="tg-section">
        <div className="tg-section-label">
          <Palette size={16} />
          <span>{t.theme}</span>
        </div>
        <div className="tg-list">
          <div className="tg-list-item" onClick={toggleTheme}>
            <div className="tg-theme-icon">
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <span className="tg-list-text">{theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
            <div className={`tg-toggle ${theme === 'dark' ? 'on' : ''}`}>
              <div className="tg-toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="tg-section">
        <div className="tg-section-label">
          <Info size={16} />
          <span>CHaT</span>
        </div>
        <div className="tg-list">
          <div className="tg-list-item">
            <span className="tg-list-text" style={{color: 'var(--text-secondary)'}}>Version</span>
            <span className="tg-version">2.0.0</span>
          </div>
        </div>
      </div>

      <style>{`
        .tg-settings {
          width: 100% !important;
          min-height: 100vh;
          background: var(--bg-primary);
          padding-bottom: 120px;
          display: flex;
          flex-direction: column;
          margin: 0 !important;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 999;
        }
        .tg-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          z-index: 10;
          width: 100%;
        }
        .tg-header h1 {
          font-size: 20px;
          font-weight: 700;
          flex: 1;
        }
        .tg-back {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--accent);
          transition: background 0.2s;
        }
        .tg-back:hover { background: rgba(135,116,225,0.1); }

        .tg-section {
          width: 100%;
          background: var(--bg-primary);
        }
        .tg-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
        }
        .tg-list {
          width: 100%;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .tg-list-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          width: 100%;
        }
        .tg-list-item:last-child {
          border-bottom: none;
        }
        .tg-list-item:hover {
          background: rgba(135,116,225,0.05);
        }
        .tg-list-item.active {
          background: rgba(135,116,225,0.08);
        }
        
        .tg-flag {
          width: 32px;
          height: 22px;
          border-radius: 4px;
          object-fit: cover;
        }
        .tg-list-text {
          flex: 1;
          font-size: 17px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .tg-toggle {
          width: 52px;
          height: 30px;
          background: #ccc;
          border-radius: 100px;
          position: relative;
          transition: 0.3s;
        }
        .tg-toggle.on { background: var(--accent); }
        .tg-toggle-thumb {
          width: 26px;
          height: 26px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: 0.3s;
        }
        .tg-toggle.on .tg-toggle-thumb { left: 24px; }

        @media (max-width: 768px) {
          .tg-settings { padding-bottom: 70px; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
