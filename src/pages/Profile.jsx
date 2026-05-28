import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { 
  Edit2, Calendar, ChevronLeft, Save, X, Camera, 
  Info, AtSign, CheckCircle2, MessageSquare, Loader, Upload, Image as ImageIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ANIME_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Neko1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Naruto3',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luffy4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Goku5',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Anime6',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Manga7',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Kawaii8',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Otaku9',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Chibi10',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Senpai11',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Kunoichi12',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Miku13',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Hinata14',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zero15',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Rem16',
];

const Profile = () => {
  const { user, setUser, lang } = useAuth();
  const { userId } = useParams();
  const t = translations[lang];
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
    bio: ''
  });
  
  const fileInputRef = useRef(null);
  const isOwnProfile = !userId || userId === user.id;

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
    if (e) e.preventDefault();
    try {
      const response = await axios.put('/api/users/me', formData);
      setUser({ ...user, ...response.data });
      setProfileData(response.data);
      setIsEditing(false);
    } catch (err) { console.error(err); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await axios.post('/api/upload', form);
      setFormData({ ...formData, avatar: res.data.fileUrl });
    } catch (err) { alert("Xatolik!"); }
    finally { setUploading(false); }
  };

  const selectAnimeAvatar = (url) => {
    setFormData({ ...formData, avatar: url });
  };

  const getInitials = (f, l) => (f ? (f[0] + (l ? l[0] : '')).toUpperCase() : '?');

  if (loading) return (
    <div className="tg-profile-page">
      <div className="tg-loading"><div className="tg-spinner"></div></div>
    </div>
  );
  if (!profileData) return <div className="tg-profile-page"><div className="tg-error">User topilmadi</div></div>;

  return (
    <div className="tg-profile-page">
      <div className="tg-profile-container">
        <div className="tg-p-header">
          <button className="tg-back-btn" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
          <div className="tg-header-title">{isOwnProfile ? t.profile : profileData.firstName}</div>
          {isOwnProfile && (
            <button className={`tg-edit-toggle ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <X size={22} /> : <Edit2 size={22} />}
            </button>
          )}
        </div>

        <div className="tg-p-content">
          <div className="tg-hero-card">
            <div className="tg-p-avatar-wrapper">
              {uploading ? (
                <div className="tg-avatar-loader"><Loader className="spin" /></div>
              ) : formData.avatar || profileData.avatar ? (
                <img src={isEditing ? formData.avatar : profileData.avatar} alt="avatar" className="tg-p-avatar-img" />
              ) : (
                <div className="tg-p-avatar-placeholder">{getInitials(profileData.firstName, profileData.lastName)}</div>
              )}
              {isEditing && !uploading && (
                <div className="tg-avatar-badge" onClick={() => fileInputRef.current.click()}>
                   <Camera size={16} />
                </div>
              )}
            </div>
            
            <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} accept="image/*" />

            {!isEditing ? (
              <div className="tg-user-names">
                <h1 className="tg-full-name">{profileData.firstName} {profileData.lastName}</h1>
                <p className="tg-username">@{profileData.username}</p>
              </div>
            ) : (
              <div className="tg-edit-inputs">
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder={t.firstName} className="tg-p-input" />
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder={t.lastName} className="tg-p-input" />
              </div>
            )}
          </div>

          <div className="tg-p-details">
            <div className="tg-detail-item bio">
              <div className="tg-detail-icon"><Info size={20} /></div>
              <div className="tg-detail-body">
                <label>{t.bio}</label>
                {isEditing ? (
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 150)})} placeholder="Bio..." className="tg-p-textarea" rows="3" />
                ) : (
                  <p className="tg-bio-text">{profileData.bio || t.noBio}</p>
                )}
              </div>
            </div>

            <div className="tg-detail-item">
              <div className="tg-detail-icon"><AtSign size={20} /></div>
              <div className="tg-detail-body">
                <label>{t.username}</label>
                <p>@{profileData.username}</p>
              </div>
            </div>

            {isEditing && (
              <>
                {/* Gallery Upload Button */}
                <div className="gallery-upload-section fade-in">
                  <button className="gallery-upload-btn" onClick={() => fileInputRef.current.click()}>
                    <Upload size={20} />
                    <span>{t.uploadFromGallery}</span>
                  </button>
                </div>

                {/* Anime Avatars */}
                <div className="anime-selector-section fade-in">
                  <h3>{t.animeAvatars}</h3>
                  <div className="anime-grid">
                    {ANIME_AVATARS.map((url, i) => (
                      <div key={i} className={`anime-item ${formData.avatar === url ? 'active' : ''}`} onClick={() => selectAnimeAvatar(url)}>
                        <img src={url} alt="anime" />
                      </div>
                    ))}
                  </div>
                </div>

                <button className="tg-save-big" onClick={handleUpdate} disabled={uploading}>
                   <Save size={20} /> {t.save}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .tg-profile-page { width: 100vw; min-height: 100vh; background: var(--bg-secondary); position: fixed; inset: 0; z-index: 1000; overflow-y: auto; }
        .tg-loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
        .tg-spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tg-error { display: flex; justify-content: center; align-items: center; height: 100vh; color: var(--text-secondary); font-size: 1.1rem; }
        .tg-profile-container { width: 100%; max-width: 500px; margin: 0 auto; background: var(--bg-primary); min-height: 100vh; }
        .tg-p-header { padding: 12px 20px; display: flex; align-items: center; gap: 1rem; position: sticky; top: 0; background: var(--bg-primary); z-index: 10; border-bottom: 1px solid var(--border); }
        .tg-back-btn { color: var(--accent); padding: 4px; }
        .tg-header-title { flex: 1; font-size: 1.2rem; font-weight: 800; }
        .tg-edit-toggle { color: var(--accent); padding: 6px; border-radius: 50%; }
        .tg-edit-toggle:hover { background: rgba(135,116,225,0.1); }
        .tg-hero-card { padding: 2rem; display: flex; flex-direction: column; align-items: center; background: linear-gradient(to bottom, rgba(135,116,225,0.05), transparent); }
        .tg-p-avatar-wrapper { width: 120px; height: 120px; border-radius: 50%; background: var(--accent); position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .tg-p-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .tg-p-avatar-placeholder { font-size: 3rem; color: white; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .tg-avatar-loader { height: 100%; display: flex; align-items: center; justify-content: center; color: white; }
        .tg-avatar-badge { position: absolute; bottom: 6px; right: 6px; background: var(--accent); color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--bg-primary); cursor: pointer; }
        .tg-full-name { font-size: 1.5rem; font-weight: 900; margin-top: 1rem; text-align: center; }
        .tg-username { color: var(--accent); font-weight: 700; margin-top: 4px; }
        .tg-edit-inputs { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 1rem; }
        .tg-p-details { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .tg-detail-item { display: flex; gap: 15px; }
        .tg-detail-icon { color: var(--accent); opacity: 0.8; flex-shrink: 0; margin-top: 2px; }
        .tg-detail-body { flex: 1; }
        .tg-detail-body label { font-size: 0.75rem; color: var(--accent); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .tg-detail-body p { font-size: 1rem; color: var(--text-primary); }
        .tg-bio-text { color: var(--text-secondary); }
        .tg-p-input, .tg-p-textarea { width: 100%; padding: 12px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); font-size: 1rem; }
        .tg-p-textarea { resize: vertical; font-family: inherit; }
        
        .gallery-upload-section { display: flex; }
        .gallery-upload-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 14px 18px; background: var(--bg-secondary); border-radius: 14px; color: var(--accent); font-weight: 700; font-size: 1rem; border: 1.5px dashed var(--accent); cursor: pointer; }
        .gallery-upload-btn:hover { background: rgba(135,116,225,0.08); }

        .anime-selector-section { margin-top: 5px; }
        .anime-selector-section h3 { font-size: 0.85rem; font-weight: 800; margin-bottom: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .anime-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .anime-item { aspect-ratio: 1; border-radius: 50%; overflow: hidden; background: var(--bg-secondary); cursor: pointer; border: 3px solid transparent; }
        .anime-item:hover { border-color: rgba(135,116,225,0.3); transform: scale(1.05); }
        .anime-item.active { border-color: var(--accent); transform: scale(1.08); box-shadow: 0 0 0 3px rgba(135,116,225,0.2); }
        .anime-item img { width: 100%; height: 100%; object-fit: cover; }
        
        .tg-save-big { width: 100%; padding: 14px; background: var(--accent); color: white; border-radius: 50px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; border: none !important; cursor: pointer; font-size: 1rem; }
        .tg-save-big:hover { opacity: 0.9; }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Profile;
