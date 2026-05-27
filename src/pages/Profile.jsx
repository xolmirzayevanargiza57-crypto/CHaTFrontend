import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Edit2, Calendar, Users, ChevronLeft, Save, X, Camera } from 'lucide-react';
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

  const avatars = [
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
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Jack',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Milo',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Jack',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia'
  ];

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

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'U';
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  if (!profileData) return <div className="tg-loading">Loading...</div>;

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
          {/* Avatar Selection */}
          <div className="tg-section-label">Rasm tanlash</div>
          <div className="tg-avatar-grid">
            <div 
              className={`tg-avatar-item ${!formData.avatar ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, avatar: ''})}
            >
              <span className="tg-initials">{getInitials(formData.firstName, formData.lastName)}</span>
            </div>
            {avatars.map((url, i) => (
              <div 
                key={i}
                className={`tg-avatar-item ${formData.avatar === url ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, avatar: url})}
              >
                <img src={url} alt={`avatar-${i}`} />
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
          background: var(--bg-primary);
          padding-bottom: 100px;
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
          padding: 32px 20px 24px;
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

        /* Avatar grid */
        .tg-section-label {
          padding: 14px 20px 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tg-avatar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          gap: 10px;
          padding: 10px 20px 20px;
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
          transition: all 0.2s;
          background: var(--bg-secondary);
        }
        .tg-avatar-item img {
          width: 85%;
          height: 85%;
          object-fit: cover;
          border-radius: 50%;
        }
        .tg-avatar-item.selected {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent);
        }
        .tg-initials {
          font-weight: 700;
          font-size: 18px;
          color: var(--accent);
        }

        /* Edit form */
        .tg-edit-section {
          padding: 0;
        }
        .tg-input-group {
          padding: 0 20px;
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
        }
        .tg-input-group input:focus {
          border-color: var(--accent);
        }
        .tg-edit-actions {
          display: flex;
          gap: 12px;
          padding: 8px 20px 20px;
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
        }
        .tg-btn-save {
          background: var(--accent);
          color: white;
        }
        .tg-btn-cancel {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        /* Info list */
        .tg-info-section {
          padding: 0;
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
          padding: 14px 20px;
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
          font-size: 16px;
        }
        @media (max-width: 768px) {
          .tg-profile { padding-bottom: 80px; }
          .tg-avatar-grid {
            grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
