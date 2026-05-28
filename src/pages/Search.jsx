import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { Search as SearchIcon, User, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
    const { lang } = useAuth();
    const t = translations[lang];
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length > 1) {
            const timer = setTimeout(handleSearch, 500);
            return () => clearTimeout(timer);
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/users/search?q=${query}`);
            setResults(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="search-page">
            <div className="search-header">
                <div className="search-input-wrapper">
                    <SearchIcon size={20} className="s-icon" />
                    <input 
                        type="text" 
                        placeholder={t.search} 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <main className="search-results">
                {loading ? (
                    <div className="search-loading"><Loader className="spin" /></div>
                ) : results.length > 0 ? (
                    results.map(user => (
                        <div key={user._id} className="search-item" onClick={() => navigate(`/profile/${user._id}`)}>
                            <div className="user-avatar">
                                {user.avatar ? <img src={user.avatar} alt="v" /> : <span>{user.firstName[0]}</span>}
                            </div>
                            <div className="user-info">
                                <h4>{user.username}</h4>
                                <p>{user.firstName} {user.lastName}</p>
                            </div>
                            <ChevronRight size={20} className="arrow" />
                        </div>
                    ))
                ) : query.length > 1 ? (
                    <div className="no-results">{t.noResults}</div>
                ) : (
                    <div className="search-placeholder">
                        <SearchIcon size={64} />
                        <p>Search for friends and creators</p>
                    </div>
                )}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .search-page { background: var(--bg-primary); min-height: 100vh; padding-bottom: 80px; }
                .search-header { padding: 15px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-primary); z-index: 100; }
                .search-input-wrapper { display: flex; align-items: center; background: var(--bg-secondary); padding: 10px 15px; border-radius: 12px; gap: 10px; }
                .search-input-wrapper input { background: transparent; border: none; color: var(--text-primary); font-size: 1rem; flex: 1; outline: none; }
                .s-icon { color: var(--text-secondary); }

                .search-results { display: flex; flex-direction: column; }
                .search-item { display: flex; align-items: center; gap: 15px; padding: 12px 20px; cursor: pointer; border-bottom: 1px solid var(--border); transition: 0.2s; }
                .search-item:hover { background: var(--bg-secondary); }
                .user-avatar { width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.2rem; overflow: hidden; border: 1px solid var(--border); }
                .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .user-info { flex: 1; }
                .user-info h4 { margin: 0; font-size: 1rem; font-weight: 800; }
                .user-info p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }
                .arrow { color: var(--text-secondary); }

                .search-loading, .search-placeholder, .no-results { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: var(--text-secondary); gap: 15px; text-align: center; padding: 20px; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SearchPage;
