import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Compass, PlaySquare, Send, PlusSquare, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '/chatlogo.png';

const Sidebar = ({ 
    friends, 
    onSelectFriend, 
    selectedFriend, 
    onlineUsers, 
    onRemoveFriend,
    onFriendAdded // redundant but kept for compatibility
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: PlaySquare, label: 'Reels', path: '/reels' },
        { icon: Send, label: 'Messages', path: '/chat' },
        { icon: PlusSquare, label: 'Create', path: '/create' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="desktop-sidebar">
            {/* Logo - custom CHaT image */}
            <div className="sb-logo" onClick={() => navigate('/')}>
                <img src={logoImg} alt="CHaT" className="sb-logo-img" />
                <img src={logoImg} alt="CHaT" className="sb-logo-img-narrow" />
            </div>

            {/* Navigation */}
            <nav className="sb-nav">
                {friends ? (
                    <div className="sb-friends-list">
                        <div className="sb-search-wrap">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {friends
                            .filter(f => f.username?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(friend => (
                            <div 
                                key={friend._id} 
                                className={`sb-friend-item ${selectedFriend?._id === friend._id ? 'active' : ''}`}
                                onClick={() => onSelectFriend(friend)}
                            >
                                <div className="sb-friend-avatar">
                                    {friend.avatar ? (
                                        <img src={friend.avatar} alt="" />
                                    ) : (
                                        <span>{friend.firstName?.[0] || friend.username?.[0]}</span>
                                    )}
                                    {onlineUsers?.includes(friend._id) && <div className="online-indicator"></div>}
                                </div>
                                <div className="sb-friend-info">
                                    <span className="friend-name">{friend.username}</span>
                                    {friend.unreadCount > 0 && <span className="unread-dot">{friend.unreadCount}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {menuItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`sb-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                                title={item.label}
                            >
                                <item.icon size={26} strokeWidth={isActive(item.path) ? 2.5 : 1.8} />
                                <span className="sb-label">{item.label}</span>
                            </div>
                        ))}

                        {/* Profile with avatar */}
                        <div
                            className={`sb-item ${(location.pathname === '/profile' || location.pathname.startsWith('/profile/')) ? 'active' : ''}`}
                            onClick={() => navigate('/profile')}
                            title="Profile"
                        >
                            <div className="sb-avatar">
                                {user?.avatar
                                    ? <img src={user.avatar} alt="" />
                                    : <span>{user?.firstName?.[0] || user?.username?.[0] || 'U'}</span>
                                }
                            </div>
                            <span className="sb-label">Profile</span>
                        </div>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="sb-footer">
                <div className="sb-item" title="More">
                    <MoreHorizontal size={26} strokeWidth={1.8} />
                    <span className="sb-label">More</span>
                </div>
            </div>

            <style jsx="true">{`
                .sb-logo {
                    padding: 16px 12px 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .sb-logo-img {
                    height: 44px;
                    width: auto;
                    object-fit: contain;
                    display: block;
                }
                .sb-logo-img-narrow { display: none; }

                .sb-nav { flex: 1; display: flex; flex-direction: column; }

                .sb-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    margin: 2px 0;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.15s;
                    color: var(--text-primary);
                }
                .sb-item:hover { background: var(--bg-secondary); }
                .sb-item.active { font-weight: 700; }
                .sb-label { font-size: 1rem; white-space: nowrap; }

                .sb-avatar {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.8rem;
                    border: 2px solid var(--border);
                    flex-shrink: 0;
                }
                .sb-item.active .sb-avatar { border-color: var(--text-primary); }
                .sb-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .sb-footer { padding-bottom: 8px; }

                /* Narrow sidebar (medium screens) */
                @media (max-width: 1263px) {
                    .sb-label { display: none; }
                    .sb-logo { padding: 16px 12px 24px; justify-content: center; }
                    .sb-logo-img { display: none; }
                    .sb-logo-img-narrow {
                        display: block;
                        height: 32px;
                        width: 32px;
                        object-fit: contain;
                    }
                    .sb-item { justify-content: center; gap: 0; }
                }

                @media (max-width: 768px) {
                    .desktop-sidebar { 
                        display: ${friends ? 'flex' : 'none'} !important;
                        width: ${friends ? '100vw' : '0'} !important;
                        min-width: ${friends ? '100vw' : '0'} !important;
                        border-right: none;
                        display: ${friends && selectedFriend ? 'none' : 'flex'} !important; /* Hide sidebar if friend selected on mobile */
                    }
                }

                .sb-friends-list { display: flex; flex-direction: column; gap: 4px; padding: 0 8px; }
                .sb-search-wrap { padding: 8px; margin-bottom: 8px; }
                .sb-search-wrap input { 
                    width: 100%; 
                    padding: 8px 12px; 
                    border-radius: 20px; 
                    background: var(--bg-secondary); 
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                }
                .sb-friend-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    padding: 10px; 
                    border-radius: 12px; 
                    cursor: pointer; 
                }
                .sb-friend-item:hover { background: var(--bg-secondary); }
                .sb-friend-item.active { background: var(--accent); color: white; }
                .sb-friend-avatar { 
                    width: 44px; 
                    height: 44px; 
                    border-radius: 50%; 
                    background: #eee; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    position: relative;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .sb-friend-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .sb-friend-avatar span { font-weight: 700; color: #666; }
                .sb-friend-item.active .sb-friend-avatar span { color: var(--accent); }
                .online-indicator { 
                    position: absolute; 
                    bottom: 2px; 
                    right: 2px; 
                    width: 10px; 
                    height: 10px; 
                    background: #4caf50; 
                    border: 2px solid var(--bg-primary); 
                    border-radius: 50%; 
                }
                .sb-friend-info { flex: 1; display: flex; align-items: center; justify-content: space-between; }
                .friend-name { font-weight: 600; font-size: 0.95rem; }
                .unread-dot { 
                    background: #ff4444; 
                    color: white; 
                    font-size: 0.75rem; 
                    padding: 2px 6px; 
                    border-radius: 10px; 
                    font-weight: 700; 
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
