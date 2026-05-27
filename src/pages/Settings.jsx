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
        <div className="settings-card glass">
          <div className="section-title">
            <Globe className="icon-blue" size={20} />
            <span>{t.language}</span>
          </div>
          <div className="language-list">
            <div 
              className={`language-item ${lang === 'uz' ? 'active' : ''}`} 
              onClick={() => changeLang('uz')}
            >
              <span>O'zbekcha</span>
              <img src="https://flagcdn.com/w20/uz.png" alt="uz" />
            </div>
            <div 
              className={`language-item ${lang === 'ru' ? 'active' : ''}`} 
              onClick={() => changeLang('ru')}
            >
              <span>Русский</span>
              <img src="https://flagcdn.com/w20/ru.png" alt="ru" />
            </div>
            <div 
              className={`language-item ${lang === 'en' ? 'active' : ''}`} 
              onClick={() => changeLang('en')}
            >
              <span>English</span>
              <img src="https://flagcdn.com/w20/gb.png" alt="en" />
            </div>
          </div>
        </div>

        <div className="settings-card glass">
          <div className="section-title">
            {theme === 'light' ? <Sun className="icon-yellow" size={20} /> : <Moon className="icon-purple" size={20} />}
            <span>{t.theme}</span>
          </div>
          <div className="setting-row" onClick={toggleTheme}>
            <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            <div className={`native-toggle ${theme === 'dark' ? 'on' : ''}`}>
              <div className="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .settings-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 6rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          padding-top: 1rem;
        }
        .settings-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -1px;
        }
        .back-btn {
          background: rgba(128, 128, 128, 0.1);
          color: var(--text-primary);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          transition: all 0.2s;
        }
        .back-btn:hover {
          background: rgba(128, 128, 128, 0.2);
          transform: scale(0.95);
        }
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          flex: 1;
        }
        .settings-card {
          padding: 2.5rem;
          border-radius: 32px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          width: 100%;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          font-weight: 800;
          color: var(--text-secondary);
          letter-spacing: 1px;
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        .language-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .language-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.15rem 1.5rem;
          border-radius: 18px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border);
        }
        .language-item:hover {
          background: rgba(128, 128, 128, 0.05);
          transform: scale(1.02);
        }
        .language-item.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          box-shadow: 0 10px 25px rgba(0, 122, 255, 0.3);
        }
        .language-item span {
          font-weight: 600;
          font-size: 1.05rem;
        }
        .language-item img {
          width: 28px;
          height: auto;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.15rem 1.5rem;
          cursor: pointer;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 18px;
        }
        .setting-row span {
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--text-primary);
        }
        .native-toggle {
          width: 52px;
          height: 31px;
          background: #e9e9ea;
          border-radius: 100px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .native-toggle.on {
          background: #34c759;
        }
        .toggle-thumb {
          width: 27px;
          height: 27px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }
        .native-toggle.on .toggle-thumb {
          left: 23px;
        }
        .icon-blue { color: #007aff; }
        .icon-yellow { color: #ffcc00; }
        .icon-purple { color: #af52de; }
        
        @media (max-width: 768px) {
            .settings-page {
                padding-bottom: 80px;
            }
        }
      `}</style>
    </div>
  );
};

export default Settings;
