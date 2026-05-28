import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../i18n';
import SearchBar from './SearchBar';
import { Sun, Moon, MessageSquare, Settings, User, LogOut, Plus, X, Heart, Eye, ChevronLeft, ChevronRight, Music, StopCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ friends, onlineUsers, selectedFriend, onSelectFriend, onFriendAdded, onRemoveFriend }) => {
  const { user, logout, lang } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = translations[lang];
  const navigate = useNavigate();
  
  const [storyGroups, setStoryGroups] = useState([]);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const storyTimerRef = useRef(null);

  useEffect(() => {
    fetchStories();
    const interval = setInterval(fetchStories, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get('/api/stories');
      setStoryGroups(res.data);
    } catch (err) { console.error(err); }
  };

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingStory(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await axios.post('/api/upload', formData);
      await axios.post('/api/stories', {
        fileUrl: uploadRes.data.fileUrl,
        fileType: uploadRes.data.fileType
      });
      fetchStories();
    } catch (err) { alert("Story yuklashda xatolik!"); }
    finally { setUploadingStory(false); }
  };

  const openStoryViewer = async (group, idx = 0) => {
    setViewingStory(group);
    setCurrentStoryIdx(idx);
    // Mark as viewed
    const story = group.stories[idx];
    if (story && !story.hasViewed) {
      try { await axios.post(`/api/stories/${story._id}/view`); } catch(e) {}
    }
    startStoryTimer(group, idx);
  };

  const [isMuted, setIsMuted] = useState(true);

  const startStoryTimer = (group, idx, duration = 5000) => {
    clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      if (idx < group.stories.length - 1) {
        nextStory(group, idx + 1);
      } else {
        setViewingStory(null);
      }
    }, duration);
  };

  const handleVideoLoad = (e) => {
    const duration = e.target.duration * 1000;
    startStoryTimer(viewingStory, currentStoryIdx, duration);
  };

  const nextStory = async (group, idx) => {
    if (idx >= group.stories.length) {
      setViewingStory(null);
      return;
    }
    setCurrentStoryIdx(idx);
    const story = group.stories[idx];
    if (story && !story.hasViewed) {
      try { await axios.post(`/api/stories/${story._id}/view`); } catch(e) {}
    }
    // If not a video, start standard 5s timer. Video uses onLoadedMetadata
    if (story.fileType !== 'video') {
      startStoryTimer(group, idx, 5000);
    }
  };

  const prevStory = (group, idx) => {
    if (idx <= 0) return;
    const prevIdx = idx - 1;
    setCurrentStoryIdx(prevIdx);
    const story = group.stories[prevIdx];
    if (story.fileType !== 'video') {
      startStoryTimer(group, prevIdx, 5000);
    }
  };

  const handleLikeStory = async (e, storyId) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/stories/${storyId}/like`);
      fetchStories();
    } catch(e) {}
  };

  const handleDeleteStory = async (e, storyId) => {
    e.stopPropagation();
    if (!window.confirm("Storyni o'chirasizmi?")) return;
    try {
      await axios.delete(`/api/stories/${storyId}`);
      setViewingStory(null);
      fetchStories();
    } catch(e) { alert("Xatolik!"); }
  };

  const closeStoryViewer = () => {
    clearTimeout(storyTimerRef.current);
    setViewingStory(null);
    setCurrentStoryIdx(0);
  };

  const getInitials = (f, l) => (f && l ? (f[0] + l[0]).toUpperCase() : 'U');

  // Do'stlarni oxirgi xabar vaqti bo'yicha saralash
  const sortedFriends = [...friends].sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || 0).getTime();
    const timeB = new Date(b.lastMessageAt || 0).getTime();
    return timeB - timeA;
  });

  const currentStory = viewingStory?.stories?.[currentStoryIdx];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">CHaT</h2>
        <div className="header-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>

      <SearchBar onFriendAdded={() => { onFriendAdded(); fetchStories(); }} />

      <div className="stories-container">
        <div className="story-item min-add" onClick={() => document.getElementById('story-input').click()}>
          <div className="story-avatar add">
            {user.avatar ? <img src={user.avatar} alt="my" /> : <User size={24} />}
            <div className="add-icon"><Plus size={14} /></div>
          </div>
          <span>{t.story}</span>
          <input type="file" id="story-input" hidden onChange={handleStoryUpload} accept="image/*,video/*" />
        </div>
        
        {storyGroups.map((group) => (
          <div key={group.user._id} className="story-item" onClick={() => openStoryViewer(group)}>
            <div className={`story-avatar ${group.stories.some(s => !s.hasViewed) ? 'unseen-border' : 'seen-border'}`}>
              <img src={group.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${group.user.username}`} alt="story" />
            </div>
            <span>{group.user.firstName}</span>
          </div>
        ))}
      </div>

      <div className="friends-list">
        {sortedFriends.map((friend) => (
          <div 
            key={friend._id} 
            className={`friend-item ${selectedFriend?._id === friend._id ? 'active' : ''}`}
            onClick={() => onSelectFriend(friend)}
          >
            <div className="avatar">
              {friend.avatar ? <img src={friend.avatar} alt="avatar" /> : getInitials(friend.firstName, friend.lastName)}
              {onlineUsers.includes(friend._id) && <div className="online-status"></div>}
            </div>
            <div className="friend-info">
              <div className="friend-name-row">
                <span className="friend-name">{friend.firstName} {friend.lastName}</span>
                {friend.unreadCount > 0 && <span className="unread-badge">{friend.unreadCount}</span>}
              </div>
              <span className="friend-username">@{friend.username}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="nav-btn" onClick={() => navigate('/chat')}><MessageSquare size={24} /></button>
        <button className="nav-btn" onClick={() => navigate('/profile')}><User size={24} /></button>
        <button className="nav-btn" onClick={() => navigate('/settings')}><Settings size={24} /></button>
        <button className="nav-btn logout" onClick={logout}><LogOut size={24} /></button>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && currentStory && (
        <div className="story-viewer-overlay" onClick={closeStoryViewer}>
          <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="story-progress-bar">
              {viewingStory.stories.map((_, i) => (
                <div key={i} className={`progress-segment ${i < currentStoryIdx ? 'done' : i === currentStoryIdx ? 'active' : ''}`}>
                  <div className="progress-fill" style={{ animationDuration: currentStory.fileType === 'video' ? '0s' : '5s' }}></div>
                </div>
              ))}
            </div>
            <div className="story-header">
              <div className="story-user-info">
                <img src={viewingStory.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${viewingStory.user.username}`} alt="u" className="story-user-avatar" />
                <div>
                  <p className="story-user-name">{viewingStory.user.firstName} {viewingStory.user.lastName}</p>
                  <p className="story-time">{new Date(currentStory.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
              <div className="header-story-actions">
                 {currentStory.fileType === 'video' && (
                    <button className="story-audio-toggle" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <Music size={20} /> : <StopCircle size={20} />}
                    </button>
                 )}
                 {viewingStory.user._id === user.id && (
                    <button className="story-del-btn" onClick={(e) => handleDeleteStory(e, currentStory._id)}><Trash2 size={20} /></button>
                 )}
                 <button className="story-close" onClick={closeStoryViewer}><X size={24} /></button>
              </div>
            </div>
            
            
            <div className="story-media">
              {currentStory.fileType === 'video' ? (
                <video 
                  src={currentStory.fileUrl} 
                  autoPlay 
                  muted={isMuted} 
                  playsInline 
                  onLoadedMetadata={handleVideoLoad} 
                  className="story-img" 
                />
              ) : (
                <img src={currentStory.fileUrl} alt="story" className="story-img" />
              )}
              
              <button className="story-nav-btn left" onClick={() => prevStory(viewingStory, currentStoryIdx)}>
                <ChevronLeft size={28} />
              </button>
              <button className="story-nav-btn right" onClick={() => nextStory(viewingStory, currentStoryIdx + 1)}>
                <ChevronRight size={28} />
              </button>
            </div>

            {currentStory.caption && (
              <div className="story-caption">{currentStory.caption}</div>
            )}

            <div className="story-footer">
              <div className="story-stats">
                <div className="story-stat"><Eye size={16} /> {currentStory.viewsCount}</div>
                <button className="story-stat like-btn" onClick={(e) => handleLikeStory(e, currentStory._id)}>
                  <Heart size={18} fill={currentStory.hasLiked ? '#ff3b5c' : 'none'} color={currentStory.hasLiked ? '#ff3b5c' : 'white'} /> 
                  {currentStory.likesCount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .sidebar { 
          width: 320px; 
          height: 100vh; 
          background: var(--bg-sidebar); 
          border-right: 1px solid var(--border); 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          transition: transform 0.3s ease;
        }
        .sidebar-header { padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: 900; font-size: 1.5rem; color: var(--accent); letter-spacing: -0.5px; }
        .icon-btn { color: var(--text-secondary); padding: 8px; border-radius: 50%; transition: 0.2s; }
        .icon-btn:hover { color: var(--accent); background: rgba(135,116,225,0.1); }
        
        .stories-container { 
          display: flex; 
          gap: 16px; 
          padding: 12px 18px; 
          overflow-x: auto; 
          border-bottom: 1px solid var(--border); 
          scrollbar-width: none; 
          min-height: 105px;
          background: var(--bg-sidebar);
        }
        .stories-container::-webkit-scrollbar { display: none; }
        .story-item { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 68px; cursor: pointer; transition: 0.2s; }
        .story-item:active { transform: scale(0.95); }
        .story-item span { font-size: 11px; font-weight: 600; color: var(--text-primary); width: 64px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .story-avatar { width: 62px; height: 62px; border-radius: 20px; padding: 3px; background: var(--bg-primary); position: relative; transition: 0.3s; }
        .story-avatar.unseen-border { border: 2.5px solid var(--accent); }
        .story-avatar.seen-border { border: 2.5px solid var(--border); opacity: 0.7; }
        .story-avatar img { width: 100%; height: 100%; border-radius: 17px; object-fit: cover; }
        .story-avatar.add { background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 2px dashed var(--border); }
        .add-icon { position: absolute; bottom: -2px; right: -2px; background: var(--accent); color: white; border-radius: 8px; padding: 2px; border: 2px solid var(--bg-sidebar); }

        .friends-list { flex: 1; overflow-y: auto; padding: 10px 0; }
        .friend-item { display: flex; align-items: center; gap: 14px; padding: 12px 20px; margin: 4px 12px; border-radius: 18px; cursor: pointer; transition: 0.2s; position: relative; }
        .friend-item:hover { background: rgba(135,116,225,0.08); }
        .friend-item.active { background: var(--accent); color: white; box-shadow: 0 4px 15px rgba(135,116,225,0.3); }
        .friend-item.active .friend-name, .friend-item.active .friend-username { color: white; }
        
        .avatar { width: 54px; height: 54px; border-radius: 18px; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; position: relative; flex-shrink: 0; overflow: hidden; font-size: 1.1rem; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .online-status { width: 14px; height: 14px; background: #34c759; border: 3px solid var(--bg-sidebar); border-radius: 50%; position: absolute; bottom: 0; right: 0; }
        .friend-item.active .online-status { border-color: var(--accent); }
        
        .friend-info { flex: 1; min-width: 0; }
        .friend-name-row { display: flex; justify-content: space-between; align-items: center; }
        .friend-name { font-weight: 700; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .friend-username { font-size: 0.8rem; color: var(--text-secondary); opacity: 0.8; }
        .unread-badge { background: #34c759; color: white; font-size: 0.72rem; font-weight: 800; min-width: 20px; height: 20px; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

        .sidebar-footer { padding: 12px 20px; display: flex; justify-content: space-evenly; border-top: 1px solid var(--border); background: var(--bg-primary); z-index: 10; gap: 8px; }
        .nav-btn { color: var(--text-secondary); padding: 12px; border-radius: 16px; transition: 0.2s; flex: 1; display: flex; justify-content: center; }
        .nav-btn:hover { color: var(--accent); background: rgba(135,116,225,0.1); }
        .nav-btn.logout:hover { color: #ff3b30; background: rgba(255, 59, 48, 0.1); }

        /* Story Viewer - Critical Fixes */
        .story-viewer-overlay { position: fixed; inset: 0; background: #000; z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .story-viewer { 
          width: 100%; 
          max-width: 480px; 
          height: 100vh; 
          background: #000; 
          position: relative; 
          display: flex; 
          flex-direction: column; 
          justify-content: center;
        }
        
        .story-progress-bar { display: flex; gap: 4px; padding: 15px 15px 0; position: absolute; top: 0; left: 0; right: 0; z-index: 30; }
        .progress-segment { flex: 1; height: 2.5px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden; }
        .progress-segment.done .progress-fill { width: 100%; height: 100%; background: white; }
        .progress-segment.active .progress-fill { height: 100%; background: white; animation: storyProgress 5s linear forwards; }
        @keyframes storyProgress { from { width: 0; } to { width: 100%; } }
        
        .story-header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 30px 15px 15px; 
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          z-index: 30; 
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); 
        }
        .story-user-info { display: flex; align-items: center; gap: 12px; }
        .story-user-avatar { width: 40px; height: 40px; border-radius: 12px; object-fit: cover; border: 2px solid white; }
        .story-user-name { color: white; font-weight: 700; font-size: 1rem; }
        .story-time { color: rgba(255,255,255,0.7); font-size: 0.8rem; }
        
        .header-story-actions { display: flex; align-items: center; gap: 10px; }
        .story-audio-toggle, .story-del-btn { background: rgba(0,0,0,0.3); color: white; border: none; padding: 8px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .story-audio-toggle:hover { background: rgba(135,116,225,0.5); }
        .story-del-btn:hover { background: rgba(255, 59, 48, 0.5); }
        .story-close { color: white; padding: 8px; cursor: pointer; border-radius: 50%; transition: 0.2s; }
        .story-close:hover { background: rgba(255,255,255,0.1); }
        
        .story-media { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; background: #000; overflow: hidden; }
        .story-img { 
          max-width: 100%; 
          max-height: 100%; 
          object-fit: contain !important; 
        }
        
        .story-nav-btn { 
          position: absolute; 
          top: 0; 
          bottom: 0; 
          padding: 0 20px;
          color: white; 
          opacity: 0; 
          transition: 0.3s; 
          z-index: 25;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .story-nav-btn:hover { opacity: 0.6; }
        .story-nav-btn.left { left: 0; }
        .story-nav-btn.right { right: 0; }
        
        .story-caption { 
          position: absolute; 
          bottom: 100px; 
          left: 0; 
          right: 0; 
          padding: 20px; 
          color: white; 
          text-align: center; 
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); 
          z-index: 30; 
          font-size: 1rem;
        }
        
        .story-footer { 
          padding: 20px; 
          display: flex; 
          justify-content: space-around; 
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); 
          position: absolute; 
          bottom: 0; 
          left: 0; 
          right: 0; 
          z-index: 30; 
        }
        .story-stat { display: flex; align-items: center; gap: 8px; color: white; font-weight: 700; font-size: 0.95rem; }
        .like-btn { cursor: pointer; background: none; border: none; transition: 0.2s; }
        .like-btn:hover { transform: scale(1.1); }

        @media (max-width: 768px) {
          .sidebar { 
            width: 100% !important; 
            display: ${selectedFriend ? 'none' : 'flex'}; 
          }
          .sidebar-footer { 
            position: fixed; 
            bottom: 0; 
            left: 0; 
            width: 100%; 
            padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px)); 
          }
          .friends-list { padding-bottom: 80px; }
          .story-viewer { max-width: 100%; border-radius: 0; }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
