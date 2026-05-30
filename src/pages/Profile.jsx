import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import {
  Grid, Video, Loader, X, Settings, Plus, Trash2,
  Camera, Lock, Eye, EyeOff, CheckCircle, AlertCircle,
  Heart, MessageCircle, Send
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

/* ─────────────────────────── EDIT MODAL ─────────────────────────── */
const EditProfileModal = ({ profileData, onClose, onSaved }) => {
  const { setUser, user, lang } = useAuth();
  const t = translations[lang];
  const [tab, setTab] = useState('profile'); // 'profile' | 'password'
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' }); // type: 'ok'|'err'

  // Profile fields
  const [form, setForm] = useState({
    username: profileData.username || '',
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    bio: profileData.bio || '',
    avatar: profileData.avatar || '',
  });
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password fields
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  const showMsg = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await axios.post('/api/upload', formData);
      setForm(prev => ({ ...prev, avatar: uploadRes.data.fileUrl }));
      showMsg("Rasm tanlandi ✓", 'ok');
    } catch (err) {
      showMsg("Yuklashda xato", 'err');
    } finally { setUploadingAvatar(false); }
  };

  const handleRemoveAvatar = () => {
    if (window.confirm(lang === 'uz' ? "Profil rasmuni o'chirmoqchimisiz?" : "Remove profile photo?")) {
      setForm(prev => ({ ...prev, avatar: '' }));
      showMsg("Rasm o'chirildi", 'ok');
    }
  };

  const handleSaveProfile = async () => {
    if (!form.username.trim()) return showMsg("Username bo'sh bo'lishi mumkin emas", 'err');
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(form.username)) {
      return showMsg("Username faqat harf, raqam, . va _ bo'lishi mumkin", 'err');
    }
    setSaving(true);
    try {
      const res = await axios.put('/api/users/me', form);
      setUser({ ...user, ...res.data });
      onSaved(res.data);
      showMsg("Profil saqlandi ✓", 'ok');
    } catch (err) {
      showMsg(err.response?.data?.message || "Xatolik yuz berdi", 'err');
    } finally { setSaving(false); }
  };

  const handleSavePassword = async () => {
    if (!pwForm.current) return showMsg("Joriy parolni kiriting", 'err');
    if (pwForm.newPw.length < 6) return showMsg("Yangi parol kamida 6 ta belgi", 'err');
    if (pwForm.newPw !== pwForm.confirm) return showMsg("Parollar mos emas", 'err');
    setSaving(true);
    try {
      await axios.put('/api/users/me/password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw
      });
      setPwForm({ current: '', newPw: '', confirm: '' });
      showMsg("Parol muvaffaqiyatli o'zgartirildi ✓", 'ok');
    } catch (err) {
      showMsg(err.response?.data?.message || "Joriy parol noto'g'ri", 'err');
    } finally { setSaving(false); }
  };

  return (
    <div className="ep-overlay" onClick={onClose}>
      <div className="ep-modal" onClick={e => e.stopPropagation()}>
        <div className="ep-modal-header">
          <h3>{t.editProfile}</h3>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        {/* Tabs */}
        <div className="ep-tabs">
          <button
            className={tab === 'profile' ? 'active' : ''}
            onClick={() => setTab('profile')}
          >
            Profile Info
          </button>
          <button
            className={tab === 'password' ? 'active' : ''}
            onClick={() => setTab('password')}
          >
            <Lock size={14} /> Change Password
          </button>
        </div>

        {/* Message */}
        {msg.text && (
          <div className={`ep-msg ${msg.type}`}>
            {msg.type === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {msg.text}
          </div>
        )}

        <div className="ep-body scrollable-y">
          {tab === 'profile' ? (
            <div className="ep-form">
              <div className="ep-avatar-section">
                <div className="ep-avatar-preview">
                  {form.avatar ? (
                    <img src={form.avatar} alt="v" />
                  ) : (
                    <div className="avatar-placeholder">{form.firstName?.[0] || form.username?.[0]}</div>
                  )}
                  {uploadingAvatar && <div className="avatar-loading"><Loader className="spin" size={20} /></div>}
                </div>
                <div className="ep-avatar-actions">
                  <button 
                    className="ep-change-photo" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {t.changePhoto}
                  </button>
                  {form.avatar && (
                    <button className="ep-remove-photo" onClick={handleRemoveAvatar}>
                      {lang === 'uz' ? "O'chirish" : "Remove"}
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>

              <div className="ep-field">
                <label>{t.firstName}</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="ep-field">
                <label>{t.lastName}</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <div className="ep-field">
                <label>{t.username}</label>
                <div className="ep-input-wrap">
                  <span className="ep-prefix">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm({ 
                      ...form, 
                      username: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._]/g, '')
                    })}
                  />
                </div>
              </div>
              <div className="ep-field">
                <label>{t.bio}</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="3"
                  maxLength="150"
                />
                <span className="ep-counter">{form.bio.length} / 150</span>
              </div>
              <button className="ep-save-btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader className="spin" size={18} /> : t.save}
              </button>
            </div>
          ) : (
            <div className="ep-form">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'newPw', label: 'New Password' },
                { key: 'confirm', label: 'Confirm Password' },
              ].map(f => (
                <div className="ep-field" key={f.key}>
                  <label>{f.label}</label>
                  <div className="ep-input-wrap">
                    <input
                      type={showPw[f.key] ? 'text' : 'password'}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                    />
                    <button
                      className="ep-eye"
                      onClick={() => setShowPw({ ...showPw, [f.key] : !showPw[f.key] })}
                      type="button"
                    >
                      {showPw[f.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
              <button className="ep-save-btn" onClick={handleSavePassword} disabled={saving}>
                {saving ? <Loader className="spin" size={18} /> : 'Change Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── MAIN PROFILE ─────────────────────────── */
const Profile = () => {
  const { user, setUser, lang, token } = useAuth();
  const { userId } = useParams();
  const t = translations[lang];
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fileInputRef = useRef(null);
  const storyInputRef = useRef(null);
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchUserPosts();
  }, [userId, token]);

  const fetchProfile = async () => {
    if (!user?.id && !userId) return; // Wait for initial auth
    setLoading(true);
    try {
      const targetId = userId || user.id;
      const res = await axios.get(`/api/users/profile/${targetId}`);
      setProfileData(res.data);
      if (user?.id) {
        setIsFollowing(res.data.followers?.includes(user.id));
      }
    } catch (err) { 
      console.error(err);
      if (err.response?.status === 404) {
        setProfileData(null);
      }
    } finally { setLoading(false); }
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

  const handleLikePost = async (postId) => {
    try {
      const res = await axios.post(`/api/posts/${postId}/like`);
      const updatedPost = { 
        ...selectedPost, 
        likes: res.data.hasLiked 
          ? [...selectedPost.likes, user.id] 
          : selectedPost.likes.filter(id => id !== user.id) 
      };
      setSelectedPost(updatedPost);
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
    } catch (err) { console.error(err); }
  };


  const handleDeletePost = async (postId) => {
    if (!window.confirm("Postni o'chirishni istaysizmi?")) return;
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      setSelectedPost(null);
    } catch (err) { console.error(err); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await axios.post('/api/upload', form, {
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
      });
      const updated = { ...profileData, avatar: res.data.fileUrl };
      await axios.put('/api/users/me', { avatar: res.data.fileUrl });
      setUser({ ...user, avatar: res.data.fileUrl });
      setProfileData(updated);
    } catch { alert("Xatolik!"); }
    finally { setUploading(false); setUploadProgress(0); }
  };

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const uploadRes = await axios.post('/api/upload', form, {
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
      });
      await axios.post('/api/stories', {
        fileUrl: uploadRes.data.fileUrl,
        fileType: file.type.startsWith('video') ? 'video' : 'image'
      });
      alert("Story yuklandi!");
    } catch { alert("Story yuklashda xatolik!"); }
    finally { setUploading(false); setUploadProgress(0); }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm(lang === 'uz' ? "Profil rasmuni o'chirmoqchimisiz?" : "Remove profile photo?")) return;
    setUploading(true);
    try {
      await axios.put('/api/users/me', { avatar: '' });
      setUser({ ...user, avatar: '' });
      setProfileData(prev => ({ ...prev, avatar: '' }));
    } catch { alert("Xatolik!"); }
    finally { setUploading(true); setUploading(false); }
  };

  if (loading) return <div className="loading-screen"><Loader className="spin" size={32} /></div>;
  if (!profileData) return (
    <div className="error-screen">
      <AlertCircle size={48} />
      <p>{lang === 'uz' ? 'Foydalanuvchi topilmadi' : 'User not found'}</p>
      <button className="ip-btn primary" onClick={() => navigate('/')} style={{ marginTop: 20, maxWidth: 200 }}>
        {lang === 'uz' ? 'Bosh sahifaga qaytish' : 'Go back Home'}
      </button>
    </div>
  );

  const displayedPosts = posts.filter(p => activeTab === 'reels' ? p.isReel || p.fileType === 'video' : !p.isReel);

  return (
    <div className="insta-profile">
      {/* ── Header ── */}
      <header className="ip-header">
        <h2 className="ip-username">@{profileData.username}</h2>
        {isOwnProfile && (
          <button className="ip-settings-btn" onClick={() => navigate('/settings')}>
            <Settings size={22} />
          </button>
        )}
      </header>

      <main className="ip-main">
        {/* ── User Intro Row ── */}
        <section className="ip-intro">
          {/* Avatar */}
          <div className="ip-avatar-wrap">
            <div
              className={`ip-avatar ${uploading ? 'uploading' : ''}`}
              onClick={() => isOwnProfile && fileInputRef.current.click()}
            >
              {profileData.avatar
                ? <img src={profileData.avatar} alt="avatar" />
                : <span>{profileData.firstName?.[0] || profileData.username?.[0]}</span>
              }
              {uploading && (
                <div className="ip-avatar-overlay">
                  <Loader size={20} className="spin" color="white" />
                  <span>{uploadProgress}%</span>
                </div>
              )}
            </div>
            {isOwnProfile && profileData.avatar && (
                <button className="ip-avatar-remove" onClick={handleRemoveAvatar} title="Remove photo">
                    <X size={12} strokeWidth={3} />
                </button>
            )}
            {isOwnProfile && (
              <button
                className="ip-story-add"
                onClick={() => storyInputRef.current.click()}
                title="Add story"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            )}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
            <input type="file" ref={storyInputRef} hidden accept="image/*,video/*" onChange={handleStoryUpload} />
          </div>

          {/* Stats */}
          <div className="ip-stats">
            <div className="ip-stat">
              <b>{posts.length}</b>
              <span>posts</span>
            </div>
            <div className="ip-stat">
              <b>{profileData.followers?.length || 0}</b>
              <span>followers</span>
            </div>
            <div className="ip-stat">
              <b>{profileData.following?.length || 0}</b>
              <span>following</span>
            </div>
          </div>
        </section>

        {/* ── Bio ── */}
        <section className="ip-bio">
          <h1 className="ip-name">{profileData.firstName} {profileData.lastName}</h1>
          {profileData.bio && <p className="ip-bio-text">{profileData.bio}</p>}
        </section>

        {/* ── Action Buttons ── */}
        <div className="ip-actions">
          {isOwnProfile ? (
            <>
              <button className="ip-btn secondary" onClick={() => setShowEditModal(true)}>
                Edit profile
              </button>
              <button className="ip-btn secondary" onClick={() => navigate('/archive')}>
                {t.viewArchive}
              </button>
            </>
          ) : (
            <button
              className={`ip-btn ${isFollowing ? 'secondary' : 'primary'}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="ip-tabs">
          <button
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            <Grid size={20} />
          </button>
          <button
            className={activeTab === 'reels' ? 'active' : ''}
            onClick={() => setActiveTab('reels')}
          >
            <Video size={20} />
          </button>
        </div>

        {/* ── Post Grid ── */}
        <div className="ip-grid">
          {displayedPosts.map(post => (
            <div key={post._id} className="ip-grid-item" onClick={() => setSelectedPost(post)}>
              {post.fileType === 'video'
                ? <video src={post.fileUrl} muted preload="metadata" />
                : <img src={post.fileUrl} alt="" loading="lazy" />
              }
              {(post.isReel || post.fileType === 'video') && (
                <div className="ip-reel-indicator"><Video size={14} /></div>
              )}
              {isOwnProfile && (
                <button
                  className="ip-grid-delete"
                  onClick={e => { e.stopPropagation(); handleDeletePost(post._id); }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {displayedPosts.length === 0 && (
            <div className="ip-empty">
              {activeTab === 'posts' ? <Grid size={40} opacity={0.3} /> : <Video size={40} opacity={0.3} />}
              <p>{activeTab === 'posts' ? t.noPostsYet : (lang === 'uz' ? 'Hali reelslar yo\'q' : 'No reels yet')}</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Post Preview Modal ── */}
      {selectedPost && (
        <div className="ip-preview-overlay" onClick={() => setSelectedPost(null)}>
          <div className="ip-preview-modal" onClick={e => e.stopPropagation()}>
            <button className="ip-preview-close" onClick={() => setSelectedPost(null)}>
              <X size={26} />
            </button>

            <div className="ip-preview-media" onDoubleClick={() => handleLikePost(selectedPost._id)}>
              {selectedPost.fileType === 'video'
                ? <video src={selectedPost.fileUrl} controls autoPlay loop />
                : <img src={selectedPost.fileUrl} alt="" />
              }
            </div>

              <div className="ip-preview-sidebar">
                <div className="ip-preview-owner">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="" />
                  ) : (
                    <div className="ip-preview-avatar-placeholder">
                      {profileData.firstName?.[0] || profileData.username?.[0]}
                    </div>
                  )}
                  <b>{profileData.username}</b>
                  {isOwnProfile && (
                    <button
                      className="ip-delete-btn"
                      onClick={() => handleDeletePost(selectedPost._id)}
                      title="Delete post"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                
                <div className="ip-preview-content">
                  <div className="ip-preview-caption">
                    <p>{selectedPost.caption}</p>
                    <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  </div>
                </div>
 
                <div className="ip-preview-actions">
                  <Heart
                    size={24}
                    fill={selectedPost.likes.includes(user.id) ? "#ed4956" : "none"}
                    color={selectedPost.likes.includes(user.id) ? "#ed4956" : "var(--text-primary)"}
                    onClick={() => handleLikePost(selectedPost._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Send size={24} onClick={() => { setShowShareModal(selectedPost); setSelectedPost(null); }} />
                </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <EditProfileModal
          profileData={profileData}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setProfileData(prev => ({ ...prev, ...updated }));
            setShowEditModal(false);
          }}
        />
      )}

      <BottomNav />

      <style jsx="true">{`
        .insta-profile {
          width: 100%;
          max-width: 935px;
          margin: 0 auto;
          background: var(--bg-primary);
          min-height: 100vh;
          padding-bottom: 40px;
        }

        /* Header */
        .ip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px 8px;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          z-index: 100;
        }
        .ip-username {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .ip-settings-btn {
          color: var(--text-primary);
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .ip-settings-btn:hover { background: var(--bg-secondary); }

        /* Intro */
        .ip-main { padding: 24px 24px 0; }
        .ip-intro {
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 18px;
        }

        /* Avatar */
        .ip-avatar-wrap { position: relative; flex-shrink: 0; }
        .ip-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.4rem;
          font-weight: 800;
          cursor: pointer;
          position: relative;
          transition: opacity 0.2s;
        }
        .ip-avatar:hover { opacity: 0.85; }
        .ip-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ip-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 50%;
        }
        .ip-avatar.uploading { cursor: not-allowed; }

        .ip-story-add {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-primary);
          transition: transform 0.15s;
        }
        .ip-story-add:hover { transform: scale(1.1); }

        /* Stats */
        .ip-stats {
          flex: 1;
          display: flex;
          justify-content: space-around;
          gap: 20px;
        }
        .ip-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .ip-stat b { font-size: 1.15rem; font-weight: 700; }
        .ip-stat span { font-size: 0.87rem; color: var(--text-secondary); }

        /* Bio */
        .ip-bio { margin-bottom: 14px; }
        .ip-name { font-size: 0.97rem; font-weight: 700; margin-bottom: 4px; }
        .ip-bio-text { font-size: 0.95rem; line-height: 1.45; white-space: pre-wrap; color: var(--text-primary); }

        /* Actions */
        .ip-actions { display: flex; gap: 8px; margin-bottom: 18px; }
        .ip-btn {
          flex: 1;
          padding: 8px 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none !important;
          transition: opacity 0.15s;
        }
        .ip-btn:hover { opacity: 0.85; }
        .ip-btn.primary { background: var(--accent); color: white; }
        .ip-btn.secondary { background: var(--bg-secondary); color: var(--text-primary); }

        /* Tabs */
        .ip-tabs {
          display: flex;
          border-top: 1px solid var(--border);
          margin: 10px -24px 0;
        }
        .ip-tabs button {
          flex: 1;
          padding: 14px;
          border: none !important;
          background: transparent;
          color: var(--text-secondary);
          opacity: 0.5;
          transition: opacity 0.15s;
        }
        .ip-tabs button.active {
          color: var(--text-primary);
          opacity: 1;
          border-top: 2px solid var(--text-primary) !important;
        }

        /* Grid */
        .ip-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin: 3px -24px 0;
        }
        .ip-grid-item {
          aspect-ratio: 1;
          position: relative;
          overflow: hidden;
          background: var(--bg-secondary);
          cursor: pointer;
        }
        .ip-grid-item img, .ip-grid-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.2s;
        }
        .ip-grid-item:hover img, .ip-grid-item:hover video { transform: scale(1.04); }

        .ip-reel-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          color: white;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));
        }
        .ip-grid-delete {
          position: absolute;
          top: 6px;
          left: 6px;
          background: rgba(0,0,0,0.6);
          color: white;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ip-grid-item:hover .ip-grid-delete { opacity: 1; }

        .ip-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        /* Post Preview */
        .ip-preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .ip-preview-modal {
          background: var(--bg-primary);
          width: 100%;
          max-width: 900px;
          height: 82vh;
          display: flex;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .ip-preview-close {
          position: absolute;
          top: -40px;
          right: 0;
          color: white;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ip-preview-media {
          flex: 1.5;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .ip-preview-media img, .ip-preview-media video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ip-preview-sidebar {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
        }
        .ip-preview-owner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
        }
        .ip-preview-owner img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border);
        }
        .ip-preview-owner b { flex: 1; font-size: 0.95rem; }
        .ip-preview-avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          border: 1px solid var(--border);
        }
        .ip-delete-btn {
          color: #ed4956;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .ip-delete-btn:hover { background: rgba(237,73,86,0.1); }
        .ip-preview-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .ip-preview-caption {
          padding: 16px 16px 8px;
        }
        .ip-preview-caption p { font-size: 0.93rem; line-height: 1.5; margin-bottom: 4px; }
        .ip-preview-caption span { font-size: 0.75rem; color: var(--text-secondary); }

        .ip-preview-comments {
          padding: 0 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ip-comment { font-size: 0.88rem; line-height: 1.4; }
        .ip-comment b { margin-right: 6px; }

        .ip-preview-actions {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 16px;
          color: var(--text-primary);
        }
        .ip-preview-comment-input {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
        }
        .ip-preview-comment-input input {
          width: 100%;
          border: none !important;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }

        /* Edit Modal */
        .ep-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .ep-modal {
          background: var(--bg-primary);
          width: 100%;
          max-width: 440px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .ep-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .ep-modal-header h3 { font-size: 1.1rem; font-weight: 700; }
        .ep-modal-header button { color: var(--text-secondary); padding: 4px; border-radius: 50%; }
        .ep-modal-header button:hover { background: var(--bg-secondary); }

        .ep-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
        }
        .ep-tabs button {
          flex: 1;
          padding: 12px 10px;
          font-size: 0.87rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .ep-tabs button.active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary) !important;
          font-weight: 700;
        }

        .ep-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: 0.87rem;
          font-weight: 500;
        }
        .ep-msg.ok { background: rgba(0, 180, 90, 0.1); color: #00b45a; }
        .ep-msg.err { background: rgba(237, 73, 86, 0.1); color: #ed4956; }

        .ep-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

        .ep-field { display: flex; flex-direction: column; gap: 5px; }
        .ep-field label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

        .ep-input-wrap { position: relative; display: flex; align-items: center; }
        .ep-prefix {
          position: absolute;
          left: 12px;
          color: var(--text-secondary);
          font-size: 0.95rem;
          pointer-events: none;
        }
        .ep-input-wrap input { padding-left: 28px !important; }
        .ep-eye {
          position: absolute;
          right: 10px;
          color: var(--text-secondary);
          padding: 4px;
        }
        .ep-eye:hover { color: var(--text-primary); }

        .ep-field input, .ep-field textarea {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border) !important;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: border-color 0.15s;
        }
        .ep-field input:focus, .ep-field textarea:focus {
          border-color: var(--accent) !important;
          outline: none;
        }
        .ep-field textarea { resize: vertical; font-family: inherit; line-height: 1.4; }
        .ep-counter { font-size: 0.75rem; color: var(--text-secondary); text-align: right; margin-top: -10px; }

        .ep-save-btn {
          padding: 12px;
          background: var(--accent);
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s;
          margin-top: 4px;
        }
        .ep-save-btn:hover { opacity: 0.88; }
        .ep-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Responsive */
        @media (max-width: 768px) {
          .insta-profile { max-width: 100%; }
          .ip-main { padding: 16px 16px 0; }
          .ip-intro { gap: 24px; }
          .ip-avatar { width: 80px; height: 80px; font-size: 2rem; }
          .ip-tabs { margin: 10px -16px 0; }
          .ip-grid { margin: 3px -16px 0; }
          .ip-preview-modal { flex-direction: column; height: 90vh; }
          .ip-preview-sidebar { width: 100%; height: 180px; flex-shrink: 0; }
          .ip-preview-media { flex: 1; }
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Profile;
