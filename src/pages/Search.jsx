import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { Search as SearchIcon, Loader, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length > 0) {
            const timer = setTimeout(handleSearch, 400);
            return () => clearTimeout(timer);
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
            setResults(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="search-page">
            {/* Header */}
            <div className="search-header">
                <h2 className="search-title">Search</h2>
                <div className="search-input-wrapper">
                    <SearchIcon size={18} className="s-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        id="search-input"
                    />
                    {query && (
                        <button className="s-clear" onClick={() => setQuery('')}>✕</button>
                    )}
                </div>
            </div>

            {/* Results */}
            <main className="search-results">
                {loading ? (
                    <div className="search-state">
                        <Loader className="spin" size={28} />
                    </div>
                ) : results.length > 0 ? (
                    results.map(u => (
                        <div key={u._id} className="search-item" onClick={() => navigate(`/profile/${u._id}`)}>
                            <div className="s-avatar">
                                {u.avatar
                                    ? <img src={u.avatar} alt="" />
                                    : <span>{u.firstName?.[0] || u.username?.[0]}</span>
                                }
                            </div>
                            <div className="s-info">
                                <span className="s-username">{u.username}</span>
                                <span className="s-name">{u.firstName} {u.lastName}</span>
                            </div>
                            <button
                                className="s-msg-btn"
                                onClick={(e) => { e.stopPropagation(); navigate('/chat'); }}
                                title="Send message"
                            >
                                <MessageSquare size={20} />
                            </button>
                        </div>
                    ))
                ) : query.trim().length > 0 && !loading ? (
                    <div className="search-state">
                        <SearchIcon size={48} opacity={0.3} />
                        <p>No results for "<b>{query}</b>"</p>
                    </div>
                ) : (
                    <div className="search-state">
                        <SearchIcon size={52} opacity={0.25} />
                        <p>Search for people</p>
                    </div>
                )}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .search-page {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .search-header {
                    padding: 20px 16px 12px;
                    position: sticky;
                    top: 0;
                    background: var(--bg-primary);
                    z-index: 100;
                    border-bottom: 1px solid var(--border);
                }
                .search-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    margin-bottom: 12px;
                }
                .search-input-wrapper {
                    display: flex;
                    align-items: center;
                    background: var(--bg-secondary);
                    padding: 10px 14px;
                    border-radius: 12px;
                    gap: 10px;
                }
                .search-input-wrapper input {
                    background: transparent;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    flex: 1;
                    outline: none;
                    border: none;
                }
                .s-icon { color: var(--text-secondary); flex-shrink: 0; }
                .s-clear {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    padding: 2px 6px;
                    border-radius: 50%;
                    background: var(--border);
                    line-height: 1;
                }

                .search-results {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .search-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border);
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .search-item:hover { background: var(--bg-secondary); }

                .s-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1.2rem;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 1px solid var(--border);
                }
                .s-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .s-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }
                .s-username {
                    font-weight: 700;
                    font-size: 0.95rem;
                }
                .s-name {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .s-msg-btn {
                    color: var(--text-secondary);
                    padding: 8px;
                    border-radius: 50%;
                    transition: background 0.15s;
                }
                .s-msg-btn:hover {
                    background: var(--bg-secondary);
                    color: var(--accent);
                }

                .search-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: var(--text-secondary);
                    padding: 60px 20px;
                    font-size: 0.95rem;
                    text-align: center;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SearchPage;
