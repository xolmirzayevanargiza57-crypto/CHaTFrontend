import React from 'react';
import { Home, Search, PlusSquare, Video, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="bottom-nav">
            <button className={location.pathname === '/' ? 'active' : ''} onClick={() => navigate('/')}><Home size={26} /></button>
            <button className={location.pathname === '/search' ? 'active' : ''} onClick={() => navigate('/search')}><Search size={26} /></button>
            <button className="create-btn" onClick={() => navigate('/create')}><PlusSquare size={28} /></button>
            <button className={location.pathname === '/reels' ? 'active' : ''} onClick={() => navigate('/reels')}><Video size={26} /></button>
            <button className={location.pathname === '/profile' ? 'active' : ''} onClick={() => navigate('/profile')}><User size={26} /></button>

            <style jsx="true">{`
                .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: var(--bg-primary); border-top: 1px solid var(--border); display: flex; justify-content: space-around; align-items: center; z-index: 1000; padding-bottom: env(safe-area-inset-bottom); }
                .bottom-nav button { background: transparent; border: none !important; color: var(--text-primary); opacity: 0.6; transition: 0.2s; }
                .bottom-nav button.active { opacity: 1; transform: scale(1.1); }
                .create-btn { color: var(--accent) !important; opacity: 1 !important; }
            `}</style>
        </nav>
    );
};

export default BottomNav;
