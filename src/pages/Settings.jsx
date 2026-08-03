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
    <div className="tg-settings fade-in">
      <div className="tg-header">
        <button className="tg-back" onClick={() => navigate('/profile')}>
          <ChevronLeft size={24} />
        </button>
        <h1>{t.settings}</h1>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="tg-body">
        <div className="tg-section">
          <div className="tg-section-label">
            <Globe size={18} />
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
            <Palette size={18} />
            <span>{t.theme}</span>
          </div>
          <div className="tg-list">
            <div className="tg-list-item" onClick={toggleTheme}>
              <div className="tg-theme-icon">
                {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
              </div>
              <span className="tg-list-text">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              <div className={`tg-toggle ${theme === 'dark' ? 'on' : ''}`}>
                <div className="tg-toggle-thumb"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="tg-section">
          <div className="tg-section-label">
            <Info size={18} />
            <span>App Info</span>
          </div>
          <div className="tg-list">
            <div className="tg-list-item no-hover">
              <span className="tg-list-text" style={{color: 'var(--text-secondary)'}}>Version</span>
              <span className="tg-version">2.0.0</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .tg-settings {
          width: 100%;
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }
        .tg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          z-index: 100;
        }
        .tg-header h1 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(45deg, var(--accent), #ff512f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tg-back {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--text-primary);
          background: var(--bg-secondary);
          transition: transform 0.2s;
        }
        .tg-back:active { transform: scale(0.9); }

        .tg-body {
          flex: 1;
          padding: 12px 0 80px;
        }

        .tg-section {
          margin-bottom: 30px;
        }
        .tg-section-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 10px;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .tg-list {
          background: var(--bg-primary);
        }
        .tg-list-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
          transition: all 0.2s;
        }
        .tg-list-item:hover:not(.no-hover) {
          background: var(--bg-secondary);
        }
        .tg-list-item.active {
          background: rgba(var(--accent-rgb, 135, 116, 225), 0.08);
        }
        
        .tg-flag {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 0 1px var(--border);
        }
        .tg-list-text {
          flex: 1;
          font-size: 1rem;
          font-weight: 600;
        }
        .tg-check { color: var(--accent); }
        
        .tg-toggle {
          width: 48px;
          height: 26px;
          background: var(--border);
          border-radius: 100px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .tg-toggle.on { background: var(--accent); }
        .tg-toggle-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tg-toggle.on .tg-toggle-thumb { left: 25px; }

        .tg-version { 
          font-size: 0.9rem; 
          font-weight: 800; 
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .tg-theme-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        @media (min-width: 769px) {
            .tg-settings {
                max-width: 500px;
                margin: 60px auto;
                border: 1px solid var(--border);
                border-radius: 20px;
                min-height: auto;
                height: fit-content;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .tg-header { border-bottom-width: 1px; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
