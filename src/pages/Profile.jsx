import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { 
  Edit2, Calendar, ChevronLeft, Save, X, Camera, 
  Info, AtSign, CheckCircle2, MessageSquare, Loader, Upload, 
  Image as ImageIcon, Grid, Video, Heart, Settings, Archive, Plus
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, lang } = useAuth();
  const { userId } = useParams();
  const t = translations[lang];
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [uploading, setUploading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', avatar: '', bio: ''
  });
  
  const fileInputRef = useRef(null);
  const isOwnProfile = !userId || userId === user.id;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const targetId = userId || user.id;
      const res = await axios.get(`/api/users/profile/${targetId}`);
      setProfileData(res.data);
      setIsFollowing(res.data.followers?.includes(user.id));
      setFormData({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        avatar: res.data.avatar || '',
        bio: res.data.bio || ''
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUserPosts = async () => {
    try {
      const targetId = userId || user.id;
      const res = await axios.get(`/api/posts/user/${targetId}`);
      setPosts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleFollow = async () => {
    try {
      const res = await axios.post(`/api/users/${profileData._id}/follow`);
      setIsFollowing(res.data.isFollowing);
      setProfileData(prev => ({
        ...prev,
        followers: res.data.isFollowing 
          ? [...prev.followers, user.id] 
          : prev.followers.filter(id => id !== user.id)
      }));
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
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

  if (loading) return <div className="loading-screen"><Loader className="spin" /></div>;
  if (!profileData) return <div className="error-screen">User Not Found</div>;

  return (
    <div className="insta-profile">
      <header className="profile-header">
        <button onClick={() => navigate(-1)} className="back-link"><ChevronLeft size={24} /></button>
        <h2 className="username-title">{profileData.username}</h2>
        <div className="header-icons">
          {isOwnProfile && <button onClick={() => navigate('/settings')}><Settings size={22} /></button>}
        </div>
      </header>

      <main className="profile-main">
        <section className="user-intro">
          <div className="avatar-section">
            <div className="avatar-circle">
                {profileData.avatar ? <img src={profileData.avatar} alt="v" /> : <span>{profileData.firstName[0]}</span>}
                {isOwnProfile && <button className="add-story-btn" onClick={() => fileInputRef.current.click()}><Plus size={16} /></button>}
            </div>
            <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} />
          </div>

          <div className="stats-section">
             <div className="stat-item"><b>{posts.length}</b> <span>{t.posts}</span></div>
             <div className="stat-item"><b>{profileData.followers?.length || 0}</b> <span>{t.followers}</span></div>
             <div className="stat-item"><b>{profileData.following?.length || 0}</b> <span>{t.following}</span></div>
          </div>
        </section>

        <section className="bio-section">
          <h1 className="display-name">{profileData.firstName} {profileData.lastName}</h1>
          <p className="bio-text">{profileData.bio || 'Social user'}</p>
          <div className="profile-actions">
            {isOwnProfile ? (
              <>
                <button className="action-btn secondary" onClick={() => setIsEditing(true)}>{t.editProfile}</button>
                <button className="action-btn secondary" onClick={() => navigate('/archive')}>{t.viewArchive}</button>
              </>
            ) : (
                <button 
                  className={`action-btn ${isFollowing ? 'secondary' : 'primary'}`} 
                  onClick={handleFollow}
                >
                  {isFollowing ? t.unfollow : t.follow}
                </button>
            )}
          </div>
        </section>

        <div className="profile-tabs">
          <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}><Grid size={20} /></button>
          <button className={activeTab === 'reels' ? 'active' : ''} onClick={() => setActiveTab('reels')}><Video size={20} /></button>
        </div>

        <div className="post-grid">
          {posts.filter(p => activeTab === 'reels' ? p.isReel : !p.isReel).map(post => (
            <div key={post._id} className="grid-item" onClick={() => navigate(`/post/${post._id}`)}>
              {post.fileType === 'video' ? <video src={post.fileUrl} /> : <img src={post.fileUrl} alt="p" />}
              {post.isReel && <div className="reel-badge"><Video size={14} /></div>}
            </div>
          ))}
          {posts.length === 0 && <div className="no-posts">{t.noPostsYet}</div>}
        </div>
      </main>

      {isEditing && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>{t.editProfile}</h3>
            <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder={t.firstName} />
            <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder={t.lastName} />
            <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Bio..." rows="4"></textarea>
            <div className="modal-btns">
              <button onClick={() => setIsEditing(false)}>{t.cancel}</button>
              <button className="save" onClick={handleUpdate}>{t.save}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .insta-profile { width: 100%; max-width: 600px; margin: 0 auto; background: var(--bg-primary); min-height: 100vh; padding-bottom: 80px; }
        .profile-header { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-primary); z-index: 100; }
        .username-title { flex: 1; text-align: center; font-size: 1.1rem; font-weight: 800; }
        .profile-main { padding: 20px; }
        
        .user-intro { display: flex; align-items: center; gap: 30px; margin-bottom: 20px; }
        .avatar-section { position: relative; }
        .avatar-circle { width: 90px; height: 90px; border-radius: 50%; background: var(--bg-secondary); border: 2px solid var(--border); overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .add-story-btn { position: absolute; bottom: 0; right: 0; background: var(--accent); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-primary); }
        
        .stats-section { flex: 1; display: flex; justify-content: space-around; }
        .stat-item { display: flex; flex-direction: column; align-items: center; }
        .stat-item b { font-size: 1.1rem; }
        .stat-item span { font-size: 0.85rem; color: var(--text-secondary); }

        .bio-section { margin-bottom: 20px; }
        .display-name { font-size: 1rem; font-weight: 800; margin-bottom: 4px; }
        .bio-text { font-size: 0.95rem; color: var(--text-primary); line-height: 1.4; white-space: pre-wrap; }
        
        .profile-actions { display: flex; gap: 8px; margin-top: 15px; }
        .action-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; border: none !important; font-size: 0.9rem; }
        .action-btn.primary { background: var(--accent); color: white; }
        .action-btn.secondary { background: var(--bg-secondary); color: var(--text-primary); }

        .profile-tabs { display: flex; border-top: 1px solid var(--border); margin-top: 20px; }
        .profile-tabs button { flex: 1; padding: 15px; border: none !important; background: transparent; color: var(--text-secondary); opacity: 0.5; }
        .profile-tabs button.active { color: var(--text-primary); opacity: 1; border-top: 2px solid var(--text-primary) !important; border-radius: 0; }

        .post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .grid-item { aspect-ratio: 1; background: var(--bg-secondary); overflow: hidden; position: relative; }
        .grid-item img, .grid-item video { width: 100%; height: 100%; object-fit: cover; }
        .reel-badge { position: absolute; top: 8px; right: 8px; color: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
        
        .edit-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .edit-modal { background: var(--bg-primary); width: 100%; max-width: 400px; padding: 20px; border-radius: 20px; display: flex; flex-direction: column; gap: 15px; }
        .edit-modal input, .edit-modal textarea { padding: 12px; border-radius: 10px; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); }
        .modal-btns { display: flex; gap: 10px; }
        .modal-btns button { flex: 1; padding: 12px; border-radius: 10px; font-weight: 800; border: none !important; }
        .modal-btns .save { background: var(--accent); color: white; }

        .loading-screen, .error-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); color: var(--accent); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .insta-profile { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Profile;

