import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { 
  Edit2, Calendar, Users, ChevronLeft, Save, X, Camera, 
  Search, Link, Info, User, AtSign, CheckCircle2, MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, lang } = useAuth();
  const { userId } = useParams(); // Boshqa foydalanuvchini ko'rish uchun
  const t = translations[lang];
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
    bio: ''
  });
  
  const [activeCategory, setActiveCategory] = useState('avataaars');
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const isOwnProfile = !userId || userId === user.id;

  const avatarCategories = {
    avataaars: {
      label: '👤 Avatars',
      items: Array.from({length: 16}, (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`)
    },
    emoji: {
      label: '😎 Emoji',
      items: Array.from({length: 16}, (_, i) => `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${i + 25}`)
    },
    lorelei: {
      label: '🎨 Art',
      items: Array.from({length: 16}, (_, i) => `https://api.dicebear.com/7.x/lorelei/svg?seed=${i + 35}`)
    },
    photos: {
      label: '📷 Photos',
      items: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      ]
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const targetId = userId || user.id;
      const response = await axios.get(`/api/users/profile/${targetId}`);
      setProfileData(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        avatar: response.data.avatar || '',
        bio: response.data.bio || ''
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) window.location.href = '/';
    } finally {
      setLoading(false);
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

  const selectAvatar = (url) => {
    setFormData({ ...formData, avatar: url });
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName) return '?';
    return (firstName[0] + (lastName ? lastName[0] : '')).toUpperCase();
  };

  if (loading) return <div className="tg-loading"><div className="tg-spinner"></div></div>;
  if (!profileData) return <div className="tg-error">User not found</div>;

  return (
    <div className="tg-profile-page">
      <div className="tg-profile-container">
        {/* Header */}
        <div className="tg-p-header">
          <button className="tg-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div className="tg-header-title">{isOwnProfile ? t.profile : profileData.firstName}</div>
          {isOwnProfile && (
            <button 
              className={`tg-edit-toggle ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X size={22} /> : <Edit2 size={22} />}
            </button>
          )}
        </div>

        <div className="tg-p-content">
          {/* Avatar & Hero */}
          <div className="tg-hero-card">
            <div className="tg-p-avatar-wrapper">
              {formData.avatar || profileData.avatar ? (
                <img src={isEditing ? formData.avatar : profileData.avatar} alt="avatar" className="tg-p-avatar-img" />
              ) : (
                <div className="tg-p-avatar-placeholder">
                  {getInitials(profileData.firstName, profileData.lastName)}
                </div>
              )}
              {isEditing && (
                <div className="tg-avatar-badge">
                  <Camera size={16} />
                </div>
              )}
            </div>
            
            {!isEditing ? (
              <div className="tg-user-names">
                <h1 className="tg-full-name">{profileData.firstName} {profileData.lastName}</h1>
                <p className="tg-username">@{profileData.username}</p>
              </div>
            ) : (
              <div className="tg-edit-inputs">
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder={t.firstName}
                  className="tg-p-input"
                />
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder={t.lastName}
                  className="tg-p-input"
                />
              </div>
            )}

            {!isOwnProfile && (
              <button className="tg-msg-btn" onClick={() => navigate(`/chat`)}>
                <MessageSquare size={20} /> {t.send || 'Habar yuborish'}
              </button>
            )}
          </div>

          <div className="tg-p-details">
            {/* Bio */}
            <div className="tg-detail-item bio">
              <div className="tg-detail-icon"><Info size={20} /></div>
              <div className="tg-detail-body">
                <label>Bio (Bio)</label>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 150)})}
                    placeholder="O'zingiz haqingizda yozing..."
                    className="tg-p-textarea"
                    rows="3"
                  />
                ) : (
                  <p className="tg-bio-text">{profileData.bio || 'Bio yozilmagan'}</p>
                )}
                {isEditing && <span className="tg-char-count">{formData.bio.length}/150</span>}
              </div>
            </div>

            <div className="tg-detail-item">
              <div className="tg-detail-icon"><AtSign size={20} /></div>
              <div className="tg-detail-body">
                <label>Username</label>
                <p>@{profileData.username}</p>
              </div>
            </div>

            <div className="tg-detail-item">
              <div className="tg-detail-icon"><Calendar size={20} /></div>
              <div className="tg-detail-body">
                <label>A'zo bo'lgan sana</label>
                <p>{new Date(profileData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Rasm tanlash bo'limi */}
          {isEditing && (
            <div className="tg-avatar-selector">
              <h3>Profil Rasm Tanlash</h3>
              <div className="tg-cat-scroll">
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
              <div className="tg-avatar-grid">
                {avatarCategories[activeCategory].items.map((url, i) => (
                  <div 
                    key={i} 
                    className={`tg-grid-item ${formData.avatar === url ? 'selected' : ''}`}
                    onClick={() => selectAvatar(url)}
                  >
                    <img src={url} alt="option" />
                    {formData.avatar === url && <div className="tg-check"><CheckCircle2 size={16} /></div>}
                  </div>
                ))}
              </div>
              
              <div className="tg-custom-url">
                <button className="tg-url-toggle" onClick={() => setShowUrlInput(!showUrlInput)}>
                  <Link size={16} /> URL orqali rasm (External Link)
                </button>
                {showUrlInput && (
                  <div className="tg-url-bar fade-in">
                    <input 
                      type="text" 
                      placeholder="Rasm havolasini kiriting..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                    <button onClick={() => { selectAvatar(customUrl); setCustomUrl(''); setShowUrlInput(false); }}>OK</button>
                  </div>
                )}
              </div>

              <button className="tg-save-big" onClick={handleUpdate}>
                 <Save size={20} /> Saqlash (Save to MongoDB)
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .tg-profile-page {
          width: 100vw !important;
          min-height: 100vh;
          background: var(--bg-secondary);
          position: fixed;
          top: 0; left: 0;
          z-index: 1000;
          overflow-y: auto;
          color: var(--text-primary);
        }
        .tg-profile-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background: var(--bg-primary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .tg-p-header {
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          z-index: 10;
          border-bottom: 1px solid var(--border);
        }
        .tg-header-title { flex: 1; font-size: 1.25rem; font-weight: 700; }
        .tg-back-btn, .tg-edit-toggle { background: transparent; color: var(--text-primary); padding: 8px; border-radius: 12px; }
        .tg-hero-card { padding: 2.5rem 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; background: linear-gradient(to bottom, rgba(135,116,225,0.05), transparent); }
        .tg-p-avatar-wrapper {
          width: 120px; height: 120px; border-radius: 44px;
          background: linear-gradient(135deg, var(--accent), #6b21a8);
          margin-bottom: 1.5rem; position: relative;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .tg-p-avatar-img { width: 100%; height: 100%; border-radius: 44px; object-fit: cover; }
        .tg-p-avatar-placeholder { font-size: 3rem; font-weight: 800; color: white; }
        .tg-avatar-badge { position: absolute; bottom: -5px; right: -5px; background: var(--accent); color: white; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 3px solid var(--bg-primary); }
        .tg-full-name { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
        .tg-username { color: var(--accent); font-weight: 600; }
        .tg-p-details { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .tg-detail-item { display: flex; gap: 1.25rem; }
        .tg-detail-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(128,128,128,0.05); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
        .tg-detail-body { flex: 1; }
        .tg-detail-body label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase; margin-bottom: 0.25rem; }
        .tg-bio-text { line-height: 1.5; white-space: pre-wrap; }
        .tg-p-input, .tg-p-textarea { width: 100%; padding: 0.85rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; color: var(--text-primary); outline: none; }
        .tg-avatar-selector { padding: 1.5rem; border-top: 8px solid var(--bg-secondary); }
        .tg-avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 1rem; }
        .tg-grid-item { aspect-ratio: 1; border-radius: 14px; background: var(--bg-secondary); cursor: pointer; position: relative; overflow: hidden; border: 2px solid transparent; }
        .tg-grid-item img { width: 100%; height: 100%; object-fit: cover; }
        .tg-grid-item.selected { border-color: var(--accent); }
        .tg-cat-scroll { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
        .tg-cat-tab { padding: 0.5rem 1rem; border-radius: 10px; background: var(--bg-secondary); white-space: nowrap; font-size: 0.9rem; font-weight: 600; }
        .tg-cat-tab.active { background: var(--accent); color: white; }
        .tg-save-big { width: 100%; margin-top: 2rem; padding: 1rem; background: var(--accent); color: white; border-radius: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .tg-loading { height: 100vh; display: flex; align-items: center; justify-content: center; }
        .tg-spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Profile;
