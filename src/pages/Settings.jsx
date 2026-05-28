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
    <div className="tg-settings">
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
          width: 100%;
          min-height: 100vh;
          max-width: 100%;
          background: var(--bg-primary);
          padding-bottom: 100px;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .tg-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          z-index: 10;
        }
        .tg-header h1 {
          font-size: 20px;
          font-weight: 700;
          flex: 1;
        }
        .tg-back {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--accent);
        }
        .tg-back:hover {
          background: rgba(135,116,225,0.1);
        }
        .tg-section {
          padding: 0;
          width: 100%;
        }
        .tg-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tg-list {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          width: 100%;
        }
        .tg-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 24px;
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
          width: 28px;
          height: 20px;
          border-radius: 3px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .tg-theme-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .tg-list-text {
          flex: 1;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .tg-check {
          color: var(--accent);
          flex-shrink: 0;
        }
        .tg-version {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
        }
        .tg-toggle {
          width: 50px;
          height: 28px;
          background: #ccc;
          border-radius: 100px;
          position: relative;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .tg-toggle.on {
          background: var(--accent);
        }
        .tg-toggle-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .tg-toggle.on .tg-toggle-thumb {
          left: 24px;
        }
        @media (max-width: 768px) {
          .tg-settings {
            padding-bottom: 80px;
          }
          .tg-header { padding: 14px 16px; }
          .tg-section-label { padding: 14px 16px 8px; }
          .tg-list-item { padding: 14px 16px; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
