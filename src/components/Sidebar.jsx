import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Compass, PlaySquare, Send, Heart, PlusSquare, User, Menu, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 1263 && window.innerWidth > 768);

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: Compass, label: 'Explore', path: '/search' },
        { icon: PlaySquare, label: 'Reels', path: '/reels' },
        { icon: Send, label: 'Messages', path: '/chat' },
        { icon: Heart, label: 'Notifications', path: '#' },
        { icon: PlusSquare, label: 'Create', path: '/create' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        if (path === '/search') return location.pathname === '/search';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="desktop-sidebar">
            {/* Logo */}
            <div className="sb-logo" onClick={() => navigate('/')}>
                <svg className="sb-logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="sb-logo-text">CHaT</span>
            </div>

            {/* Navigation */}
            <nav className="sb-nav">
                {menuItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`sb-item ${isActive(item.path) && item.path !== '#' ? 'active' : ''}`}
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        title={item.label}
                    >
                        <item.icon
                            size={26}
                            strokeWidth={isActive(item.path) && item.path !== '#' ? 2.5 : 1.8}
                        />
                        <span className="sb-label">{item.label}</span>
                    </div>
                ))}

                {/* Profile item with avatar */}
                <div
                    className={`sb-item ${location.pathname === '/profile' || location.pathname.startsWith('/profile/') ? 'active' : ''}`}
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
                    padding: 20px 12px 26px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-primary);
                }
                .sb-logo-icon { flex-shrink: 0; }
                .sb-logo-text {
                    font-size: 1.4rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    white-space: nowrap;
                }

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
                    text-decoration: none;
                    position: relative;
                }
                .sb-item:hover { background: var(--bg-secondary); }
                .sb-item.active { font-weight: 700; }

                .sb-label {
                    font-size: 1rem;
                    white-space: nowrap;
                }

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
                .sb-item.active .sb-avatar {
                    border-color: var(--text-primary);
                    border-width: 2px;
                }
                .sb-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .sb-footer { padding-bottom: 8px; }

                /* Narrow sidebar (medium screens) */
                @media (max-width: 1263px) {
                    .sb-logo-text, .sb-label { display: none; }
                    .sb-logo { padding: 20px 12px 26px; justify-content: center; }
                    .sb-logo-icon { }
                    .sb-item { justify-content: center; gap: 0; padding: 12px; }
                }

                /* Hide on mobile */
                @media (max-width: 768px) {
                    .desktop-sidebar { display: none !important; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
