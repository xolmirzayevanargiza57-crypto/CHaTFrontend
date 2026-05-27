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
    lastName: user?.lastName || ''
  });
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/me');
      setProfileData(response.data);
      setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName
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

      <div className="profile-card">
        <div className="avatar-large">
          {getInitials(profileData.firstName, profileData.lastName)}
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
          padding: 2rem 1rem;
          height: 100vh;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .back-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          padding: 0.5rem;
          border-radius: 0.75rem;
        }
        .profile-card {
          background: var(--bg-primary);
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: var(--shadow);
          text-align: center;
        }
        .avatar-large {
          width: 100px;
          height: 100px;
          background: var(--accent);
          color: white;
          border-radius: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 auto 1.5rem;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
        }
        .profile-info h2 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .profile-info .username {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }
        .edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: var(--bg-secondary);
          color: var(--accent);
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .profile-stats {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }
        .stat-item svg {
          color: var(--accent);
        }
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .stat-value {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .edit-form {
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .form-group label {
            display: block;
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 0.4rem;
        }
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border-radius: 0.75rem;
            border: 1px solid var(--border);
            background: var(--bg-secondary);
            color: var(--text-primary);
            outline: none;
        }
        .edit-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        .save-btn, .cancel-btn {
            flex: 1;
            padding: 0.75rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-weight: 600;
        }
        .save-btn {
            background: var(--accent);
            color: white;
        }
        .cancel-btn {
            background: var(--bg-secondary);
            color: var(--text-secondary);
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Profile;
