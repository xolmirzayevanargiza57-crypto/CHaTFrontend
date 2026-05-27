import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { User, Edit2, Calendar, Users, ChevronLeft, Save, X } from 'lucide-react';
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
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo'
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

  if (!profileData) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page fade-in">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/chat')}>
          <ChevronLeft size={24} />
        </button>
        <h1>{t.profile}</h1>
      </div>

      <div className="profile-card glass">
        <div className="avatar-section">
          <div className="avatar-large">
            {formData.avatar ? (
                <img src={formData.avatar} alt="avatar" />
            ) : (
                getInitials(profileData.firstName, profileData.lastName)
            )}
          </div>
          {isEditing && (
              <div className="avatar-grid">
                  {avatars.map((url, i) => (
                      <div 
                        key={i} 
                        className={`avatar-option ${formData.avatar === url ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, avatar: url})}
                      >
                          <img src={url} alt={`avatar-${i}`} />
                      </div>
                  ))}
                  <div 
                    className={`avatar-option initials ${!formData.avatar ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, avatar: ''})}
                  >
                      {getInitials(formData.firstName, formData.lastName)}
                  </div>
              </div>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="form-group">
                <label>{t.firstName}</label>
                <input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>{t.lastName}</label>
                <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
            </div>
            <div className="edit-actions">
                <button type="submit" className="save-btn"><Save size={18} /> {t.save}</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}><X size={18} /> {t.cancel}</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h2>{profileData.firstName} {profileData.lastName}</h2>
            <p className="username">@{profileData.username}</p>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} /> {t.editProfile}
            </button>
          </div>
        )}

        <div className="profile-stats">
          <div className="stat-item">
            <Calendar size={20} />
            <div>
              <p className="stat-label">{t.memberSince}</p>
              <p className="stat-value">{new Date(profileData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="stat-item">
            <Users size={20} />
            <div>
              <p className="stat-label">{t.friendsCount}</p>
              <p className="stat-value">{profileData.friends?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .profile-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1.5rem 6rem;
          min-height: 100vh;
          overflow-y: auto;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2rem;
          padding-top: 1rem;
        }
        .profile-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .back-btn {
          background: rgba(128, 128, 128, 0.1);
          color: var(--text-primary);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        }
        .profile-card {
          background: var(--bg-secondary);
          border-radius: 2rem;
          padding: 2rem;
          box-shadow: var(--shadow);
          text-align: center;
          border: 1px solid var(--border);
        }
        .glass {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .avatar-section {
            margin-bottom: 2rem;
        }
        .avatar-large {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, var(--accent), #60a5fa);
          color: white;
          border-radius: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          margin: 0 auto 1.5rem;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
          overflow: hidden;
        }
        .avatar-large img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .avatar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(128, 128, 128, 0.05);
            border-radius: 1.25rem;
        }
        .avatar-option {
            aspect-ratio: 1;
            border-radius: 14px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
        }
        .avatar-option img {
            width: 80%;
            height: 80%;
        }
        .avatar-option.selected {
            border-color: var(--accent);
            transform: scale(1.1);
            background: rgba(59, 130, 246, 0.1);
        }
        .avatar-option.initials {
            font-weight: 700;
            color: var(--accent);
            font-size: 0.9rem;
        }
        .profile-info h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .profile-info .username {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }
        .edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--accent);
          color: white;
          border-radius: 1rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .profile-stats {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }
        .stat-item svg {
          color: var(--accent);
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .stat-value {
          font-weight: 700;
          font-size: 1rem;
        }
        .edit-form {
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        .form-group label {
            display: block;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }
        .form-group input {
            width: 100%;
            padding: 0.85rem 1rem;
            border-radius: 1rem;
            border: 1px solid var(--border);
            background: var(--bg-primary);
            color: var(--text-primary);
            outline: none;
            font-size: 1rem;
        }
        .form-group input:focus {
            border-color: var(--accent);
        }
        .edit-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .save-btn, .cancel-btn {
            flex: 1;
            padding: 1rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-weight: 600;
        }
        .save-btn {
            background: var(--accent);
            color: white;
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .cancel-btn {
            background: rgba(128, 128, 128, 0.1);
            color: var(--text-secondary);
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: var(--text-secondary);
            font-size: 1.2rem;
            font-weight: 600;
        }
        @media (max-width: 768px) {
            .profile-page {
                padding-bottom: 80px;
            }
            .profile-stats {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

    </div>
  );
};

export default Profile;
