import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../i18n';
import SearchBar from './SearchBar';
import { Sun, Moon, MessageSquare, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ friends, onlineUsers, selectedFriend, onSelectFriend, onFriendAdded }) => {
  const { user, logout, lang } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = translations[lang];
  const navigate = useNavigate();

  const getInitials = (firstName, lastName) => {
    return (firstName[0] + lastName[0]).toUpperCase();
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
              {getInitials(friend.firstName, friend.lastName)}
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
          font-size: 1.5rem;
          color: var(--accent);
          letter-spacing: -0.5px;
        }
        .icon-btn {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 0.75rem;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .friends-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 0.5rem;
        }
        .friend-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin: 0.25rem 0.5rem;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .friend-item:hover {
          background: rgba(59, 130, 246, 0.05);
        }
        .friend-item.active {
          background: var(--bg-primary);
          box-shadow: var(--shadow);
        }
        .avatar {
          width: 48px;
          height: 48px;
          background: var(--accent);
          color: white;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          position: relative;
          flex-shrink: 0;
        }
        .online-status {
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid var(--bg-sidebar);
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
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .friend-username {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .unread-badge {
            background: var(--accent);
            color: white;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.2rem 0.5rem;
            border-radius: 1rem;
        }
        .sidebar-footer {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          background: var(--bg-primary);
        }
        .nav-btn {
          background: transparent;
          color: var(--text-secondary);
          padding: 0.5rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          color: var(--accent);
          background: var(--bg-secondary);
        }
        .nav-btn.logout:hover {
            color: #ef4444;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            display: ${selectedFriend ? 'none' : 'flex'};
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
