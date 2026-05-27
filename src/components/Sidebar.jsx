import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../i18n';
import SearchBar from './SearchBar';
import { Sun, Moon, MessageSquare, Settings, User, LogOut, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ friends, onlineUsers, selectedFriend, onSelectFriend, onFriendAdded, onRemoveFriend }) => {
  const { user, logout, lang } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = translations[lang];
  const navigate = useNavigate();

  const getInitials = (firstName, lastName) => {
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  const handleRemove = (e, friendId) => {
    e.stopPropagation();
    if (window.confirm(t.confirmRemoveFriend)) {
      onRemoveFriend(friendId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">CHaT</h2>
        <button className="icon-btn theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <SearchBar onFriendAdded={onFriendAdded} />

      <div className="friends-list">
        {friends.map((friend) => (
          <div 
            key={friend._id} 
            className={`friend-item ${selectedFriend?._id === friend._id ? 'active' : ''}`}
            onClick={() => onSelectFriend(friend)}
          >
            <div className="avatar">
              {friend.avatar ? (
                  <img src={friend.avatar} alt="avatar" />
              ) : (
                  getInitials(friend.firstName, friend.lastName)
              )}
              {onlineUsers.includes(friend._id) && <div className="online-status"></div>}
            </div>
            <div className="friend-info">
              <div className="friend-name-row">
                <span className="friend-name">{friend.firstName} {friend.lastName}</span>
                {friend.unreadCount > 0 && <span className="unread-badge">{friend.unreadCount}</span>}
              </div>
              <span className="friend-username">@{friend.username}</span>
            </div>
            <button className="remove-friend-btn" onClick={(e) => handleRemove(e, friend._id)} title={t.removeFriend}>
              <UserMinus size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="nav-btn" onClick={() => navigate('/chat')} title={t.chat}>
          <MessageSquare size={24} />
        </button>
        <button className="nav-btn" onClick={() => navigate('/profile')} title={t.profile}>
          <User size={24} />
        </button>
        <button className="nav-btn" onClick={() => navigate('/settings')} title={t.settings}>
          <Settings size={24} />
        </button>
        <button className="nav-btn logout" onClick={logout} title={t.logout}>
          <LogOut size={24} />
        </button>
      </div>

      <style jsx="true">{`
        .sidebar {
          width: 320px;
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 10;
        }
        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-weight: 800;
          font-size: 1.6rem;
          color: var(--accent);
          letter-spacing: -1px;
        }
        .icon-btn {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 12px;
          padding: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .friends-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }
        .friend-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          margin: 0.25rem 0.5rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .friend-item:hover {
          background: rgba(128, 128, 128, 0.05);
        }
        .friend-item.active {
          background: var(--bg-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--accent), #60a5fa);
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          position: relative;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
          overflow: hidden;
        }
        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .online-status {
          width: 14px;
          height: 14px;
          background: #34c759;
          border: 2.5px solid var(--bg-sidebar);
          border-radius: 50%;
          position: absolute;
          bottom: -2px;
          right: -2px;
        }
        .friend-info {
          flex: 1;
          overflow: hidden;
        }
        .friend-name-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .friend-name {
          font-weight: 600;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-primary);
        }
        .friend-username {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .remove-friend-btn {
            background: transparent;
            color: var(--text-secondary);
            padding: 0.5rem;
            border-radius: 10px;
            opacity: 0;
            transition: all 0.2s;
        }
        .friend-item:hover .remove-friend-btn {
            opacity: 1;
        }
        .remove-friend-btn:hover {
            color: #ff3b30;
            background: rgba(255, 59, 48, 0.08);
        }
        .unread-badge {
            background: var(--accent);
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            padding: 0 6px;
        }
        .sidebar-footer {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          background: var(--bg-primary);
        }
        .nav-btn {
          background: transparent;
          color: var(--text-secondary);
          padding: 0.75rem;
          border-radius: 14px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-btn:hover {
          color: var(--accent);
          background: rgba(59, 130, 246, 0.08);
          transform: translateY(-2px);
        }
        .nav-btn.logout:hover {
            color: #ff3b30;
            background: rgba(255, 59, 48, 0.08);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            display: ${selectedFriend ? 'none' : 'flex'};
            padding-bottom: 65px;
          }
          .logo {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
