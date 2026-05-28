import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Edit2, Calendar, Users, ChevronLeft, Save, X, Camera, Search, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, lang } = useAuth();
  const t = translations[lang];
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || ''
  });
  const [profileData, setProfileData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('avataaars');
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Avatar categories with lots of options
  const avatarCategories = {
    avataaars: {
      label: '👤 Avatars',
      items: [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Bear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Mango',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Rocky',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
      ]
    },
    emoji: {
      label: '😎 Emoji',
      items: [
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Jack',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Milo',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Luna',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Leo',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Nala',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bear',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Tigger',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rocky',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Charlie',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Max',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Daisy',
      ]
    },
    lorelei: {
      label: '🎨 Art',
      items: [
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Jack',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Milo',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Luna',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Leo',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Nala',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Bear',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Rocky',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Max',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Daisy',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie',
      ]
    },
    notionists: {
      label: '✏️ Sketch',
      items: [
        'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Jack',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Milo',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Luna',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Leo',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Nala',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Rocky',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Max',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Bella',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Daisy',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Charlie',
        'https://api.dicebear.com/7.x/notionists/svg?seed=Tigger',
      ]
    },
    bottts: {
      label: '🤖 Robots',
      items: [
        'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Nala',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Rocky',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Max',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Daisy',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Charlie',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Tigger',
      ]
    },
    photos: {
      label: '📷 Photos',
      items: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544725176-7c40e128714e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
      ]
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/me');
      setProfileData(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        avatar: response.data.avatar || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/users/me', formData);
      setUser({ ...user, ...response.data });
      setProfileData(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      setFormData({ ...formData, avatar: customUrl.trim() });
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'U';
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  if (!profileData) return <div className="tg-loading"><div className="tg-loading-spinner"></div></div>;

  return (
    <div className="tg-profile">
      <div className="tg-header">
        <button className="tg-back" onClick={() => navigate('/chat')}>
          <ChevronLeft size={22} />
        </button>
        <h1>{t.profile}</h1>
        {!isEditing && (
          <button className="tg-edit-icon" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} />
          </button>
        )}
      </div>

      {/* Avatar + Name section */}
      <div className="tg-profile-hero">
        <div className="tg-avatar-big">
          {formData.avatar ? (
            <img src={formData.avatar} alt="avatar" />
          ) : (
            getInitials(profileData.firstName, profileData.lastName)
          )}
          {isEditing && (
            <div className="tg-avatar-overlay" onClick={() => setFormData({...formData, avatar: ''})}>
              <Camera size={24} />
            </div>
          )}
        </div>
        {!isEditing && (
          <>
            <h2>{profileData.firstName} {profileData.lastName}</h2>
            <p className="tg-username">@{profileData.username}</p>
          </>
        )}
      </div>

      {/* Edit form */}
      {isEditing ? (
        <div className="tg-edit-section">
          {/* Category tabs */}
          <div className="tg-section-label">{t.selectAvatar}</div>
          <div className="tg-cat-tabs">
            {Object.entries(avatarCategories).map(([key, cat]) => (
              <button
                key={key}
                className={`tg-cat-tab ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Custom URL input */}
          <div className="tg-url-section">
            <button 
              className={`tg-url-toggle ${showUrlInput ? 'active' : ''}`}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <Link size={16} />
              <span>URL orqali rasm qo'shish</span>
            </button>
            {showUrlInput && (
              <div className="tg-url-input-row">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomUrlSubmit()}
                />
                <button className="tg-url-btn" onClick={handleCustomUrlSubmit}>
                  <Save size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Avatar grid */}
          <div className="tg-avatar-grid">
            <div 
              className={`tg-avatar-item ${!formData.avatar ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, avatar: ''})}
            >
              <span className="tg-initials">{getInitials(formData.firstName, formData.lastName)}</span>
            </div>
            {avatarCategories[activeCategory].items.map((url, i) => (
              <div 
                key={i}
                className={`tg-avatar-item ${formData.avatar === url ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, avatar: url})}
              >
                <img src={url} alt={`avatar-${i}`} loading="lazy" />
              </div>
            ))}
          </div>

          {/* Name fields */}
          <form onSubmit={handleUpdate}>
            <div className="tg-input-group">
              <label>{t.firstName}</label>
              <input 
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="tg-input-group">
              <label>{t.lastName}</label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <div className="tg-edit-actions">
              <button type="submit" className="tg-btn-save"><Save size={16} /> {t.save}</button>
              <button type="button" className="tg-btn-cancel" onClick={() => {
                setIsEditing(false);
                setFormData({ firstName: profileData.firstName, lastName: profileData.lastName, avatar: profileData.avatar || '' });
              }}><X size={16} /> {t.cancel}</button>
            </div>
          </form>
        </div>
      ) : (
        /* Info section */
        <div className="tg-info-section">
          <div className="tg-section-label">{t.profile}</div>
          <div className="tg-list">
            <div className="tg-list-item">
              <Calendar size={20} className="tg-icon" />
              <div>
                <div className="tg-item-label">{t.memberSince}</div>
                <div className="tg-item-value">{new Date(profileData.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="tg-list-item">
              <Users size={20} className="tg-icon" />
              <div>
                <div className="tg-item-label">{t.friendsCount}</div>
                <div className="tg-item-value">{profileData.friends?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tg-profile {
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
        .tg-back:hover { background: rgba(135,116,225,0.1); }
        .tg-edit-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--accent);
        }
        .tg-edit-icon:hover { background: rgba(135,116,225,0.1); }

        .tg-profile-hero {
          text-align: center;
          padding: 32px 24px 24px;
        }
        .tg-avatar-big {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 800;
          margin: 0 auto 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(135,116,225,0.3);
        }
        .tg-avatar-big img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tg-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .tg-avatar-big:hover .tg-avatar-overlay {
          opacity: 1;
        }
        .tg-profile-hero h2 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .tg-username {
          color: var(--text-secondary);
          font-size: 15px;
        }

        /* Category tabs */
        .tg-cat-tabs {
          display: flex;
          gap: 8px;
          padding: 8px 24px 12px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tg-cat-tabs::-webkit-scrollbar { display: none; }
        .tg-cat-tab {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .tg-cat-tab.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .tg-cat-tab:hover:not(.active) {
          background: rgba(135,116,225,0.1);
        }

        /* URL input */
        .tg-url-section {
          padding: 0 24px 12px;
        }
        .tg-url-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .tg-url-toggle.active {
          color: var(--accent);
          border-color: var(--accent);
        }
        .tg-url-input-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .tg-url-input-row input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
        }
        .tg-url-input-row input:focus {
          border-color: var(--accent);
        }
        .tg-url-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Avatar grid */
        .tg-section-label {
          padding: 14px 24px 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tg-avatar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 12px;
          padding: 10px 24px 24px;
          width: 100%;
        }
        .tg-avatar-item {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          background: var(--bg-secondary);
        }
        .tg-avatar-item:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .tg-avatar-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .tg-avatar-item.selected {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(135,116,225,0.3);
          transform: scale(1.05);
        }
        .tg-initials {
          font-weight: 700;
          font-size: 20px;
          color: var(--accent);
        }

        /* Edit form */
        .tg-edit-section {
          padding: 0;
          width: 100%;
        }
        .tg-input-group {
          padding: 0 24px;
          margin-bottom: 16px;
        }
        .tg-input-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 6px;
        }
        .tg-input-group input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .tg-input-group input:focus {
          border-color: var(--accent);
        }
        .tg-edit-actions {
          display: flex;
          gap: 12px;
          padding: 12px 24px 24px;
        }
        .tg-btn-save, .tg-btn-cancel {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .tg-btn-save {
          background: var(--accent);
          color: white;
        }
        .tg-btn-save:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }
        .tg-btn-cancel {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        /* Info list */
        .tg-info-section {
          padding: 0;
          width: 100%;
        }
        .tg-list {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .tg-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--border);
        }
        .tg-list-item:last-child { border-bottom: none; }
        .tg-icon { color: var(--accent); flex-shrink: 0; }
        .tg-item-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .tg-item-value {
          font-size: 16px;
          font-weight: 600;
        }
        .tg-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: var(--text-secondary);
        }
        .tg-loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .tg-profile { padding-bottom: 80px; }
          .tg-header { padding: 14px 16px; }
          .tg-profile-hero { padding: 24px 16px 20px; }
          .tg-avatar-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 10px;
            padding: 10px 16px 20px;
          }
          .tg-cat-tabs { padding: 8px 16px 12px; }
          .tg-input-group { padding: 0 16px; }
          .tg-edit-actions { padding: 12px 16px 20px; }
          .tg-section-label { padding: 14px 16px 8px; }
          .tg-list-item { padding: 14px 16px; }
          .tg-url-section { padding: 0 16px 12px; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
