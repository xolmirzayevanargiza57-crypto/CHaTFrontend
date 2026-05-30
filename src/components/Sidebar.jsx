import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Compass, PlaySquare, Send, PlusSquare, MoreHorizontal, Trash2 } from 'lucide-react';
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
        <aside className={`desktop-sidebar ${friends ? 'friends-view' : ''}`}>
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
                            .filter(f => 
                                f.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                f.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
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
                                <button 
                                    className="remove-friend-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Do'stlikdan o'chirasizmi?")) {
                                            onRemoveFriend(friend._id);
                                        }
                                    }}
                                    title="Remove Friend"
                                >
                                    <Trash2 size={16} />
                                </button>
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
                            className={`sb-item ${(location.pathname === '/profile' || location.pathname === '/profile/') ? 'active' : ''}`}
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
                .desktop-sidebar {
                    width: 245px;
                    height: 100vh;
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    padding: 8px 12px;
                    transition: width 0.3s;
                }
                .desktop-sidebar.friends-view {
                    width: 350px;
                }
                
                .sb-logo {
                    padding: 25px 12px 35px;
                    cursor: pointer;
                }
                .sb-logo-img { height: 28px; width: auto; object-fit: contain; }
                .sb-logo-img-narrow { display: none; }

                .sb-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }

                .sb-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-primary);
                }
                .sb-item:hover { background: var(--bg-secondary); }
                .sb-item.active { font-weight: 800; background: rgba(0,0,0,0.02); }
                .sb-label { font-size: 1rem; }

                .sb-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    border: 1px solid var(--border);
                }
                .sb-item.active .sb-avatar { border: 2px solid var(--text-primary); }
                .sb-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .sb-footer { margin-top: auto; padding-top: 10px; }

                /* Friends List Styling */
                .sb-friends-list { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 2px; 
                    height: 100%;
                }
                .sb-search-wrap { padding: 10px 0; margin-bottom: 10px; }
                .sb-search-wrap input { 
                    width: 100%; 
                    padding: 10px 16px; 
                    border-radius: 10px; 
                    background: var(--bg-secondary); 
                    border: none;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }
                .sb-friend-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    padding: 12px; 
                    border-radius: 12px; 
                    cursor: pointer; 
                    position: relative;
                    transition: background 0.2s;
                }
                .sb-friend-item:hover { background: var(--bg-secondary); }
                .sb-friend-item.active { background: rgba(var(--accent-rgb, 135, 116, 225), 0.1); }
                .sb-friend-item.active .friend-name { color: var(--accent); font-weight: 700; }
                
                .sb-friend-avatar { 
                    width: 52px; 
                    height: 52px; 
                    border-radius: 50%; 
                    background: var(--bg-secondary);
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    position: relative;
                    flex-shrink: 0;
                    overflow: hidden;
                    border: 1px solid var(--border);
                }
                .active .sb-friend-avatar { border: 2px solid var(--accent); }
                .sb-friend-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .sb-friend-avatar span { font-weight: 800; color: var(--text-secondary); font-size: 1.2rem; }
                
                .online-indicator { 
                    position: absolute; 
                    bottom: 2px; 
                    right: 2px; 
                    width: 14px; 
                    height: 14px; 
                    background: #4caf50; 
                    border: 3px solid var(--bg-primary); 
                    border-radius: 50%; 
                }
                .sb-friend-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
                .friend-name { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
                .unread-dot { 
                    background: var(--accent); 
                    color: white; 
                    font-size: 0.7rem; 
                    min-width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%; 
                    font-weight: 800; 
                }
                
                .remove-friend-btn {
                    padding: 8px;
                    border-radius: 50%;
                    color: var(--text-secondary);
                    opacity: 0;
                    transition: all 0.2s;
                }
                .sb-friend-item:hover .remove-friend-btn { opacity: 1; }
                .remove-friend-btn:hover { background: rgba(255,0,0,0.1); color: #ff4d4d; }

                @media (max-width: 1263px) {
                    .desktop-sidebar { width: 72px; }
                    .desktop-sidebar.friends-view { width: 350px; }
                    .sb-label { display: none; }
                    .sb-logo { justify-content: center; }
                    .sb-logo-img { display: none; }
                    .sb-logo-img-narrow { display: block; height: 28px; }
                    .sb-item { justify-content: center; padding: 12px 0; }
                }

                @media (max-width: 768px) {
                    .desktop-sidebar { display: none !important; }
                    .desktop-sidebar.friends-view { display: flex !important; width: 100% !important; border: none; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
