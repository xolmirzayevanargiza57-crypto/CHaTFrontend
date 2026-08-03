import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Search, UserPlus, X, ArrowLeft } from 'lucide-react';

const SearchBar = ({ onFriendAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { lang } = useAuth();
  const t = translations[lang];
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchUsers();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/users/search?q=${query}`);
      setResults(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (userId) => {
    try {
      await axios.post(`/api/users/add-friend/${userId}`);
      setResults([]);
      setQuery('');
      setFocused(false);
      if (onFriendAdded) onFriendAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding friend");
    }
  };

  const addFriendByUsername = async () => {
    try {
      const username = query.trim().toLowerCase();
      await axios.post(`/api/users/add-friend/username/${username}`);
      setResults([]);
      setQuery('');
      setFocused(false);
      if (onFriendAdded) onFriendAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding friend");
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    if (!query) setFocused(false);
  };

  const getInitials = (firstName, lastName) => {
    return (firstName[0] + (lastName ? lastName[0] : '')).toUpperCase();
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className={`search-input-wrapper ${focused ? 'focused' : ''}`}>
        {focused ? (
          <button className="search-back" onClick={() => { setFocused(false); setQuery(''); setResults([]); }}>
            <ArrowLeft size={18} />
          </button>
        ) : (
          <Search size={18} className="search-icon" />
        )}
        <input 
          ref={inputRef}
          type="text" 
          placeholder={t.search} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        {query && (
          <button className="search-clear" onClick={handleClear}>
            <X size={16} />
          </button>
        )}
      </div>

      {focused && (results.length > 0 || (query && !loading)) && (
        <div className="search-results fade-in">
          {loading && (
            <div className="search-loading">
              <div className="search-spinner"></div>
            </div>
          )}
          
          {results.length > 0 && (
            <>
              <p className="results-title">{t.searchResult}</p>
              {results.map((user) => (
                <div key={user._id} className="search-user-card">
                  <div className="user-info">
                    <div className="avatar-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt="a" />
                      ) : (
                        getInitials(user.firstName, user.lastName)
                      )}
                    </div>
                    <div>
                      <p className="name">{user.firstName} {user.lastName}</p>
                      <p className="username">@{user.username}</p>
                    </div>
                  </div>
                  <button onClick={() => addFriend(user._id)} className="add-btn">
                    <UserPlus size={16} />
                  </button>
                </div>
              ))}
            </>
          )}

          {query && results.length === 0 && !loading && (
            <>
              <p className="no-results">{t.noResults}</p>
              <div className="add-by-username">
                <span>{t.addByUsernameHelp}</span>
                <button className="add-btn username-btn" onClick={addFriendByUsername}>
                  <UserPlus size={16} /> {t.addByUsername}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx="true">{`
        .search-container {
          padding: 0.75rem 1rem;
          position: relative;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border-radius: 22px;
          border: 1.5px solid var(--border);
          padding: 0 12px;
          transition: all 0.2s;
        }
        .search-input-wrapper.focused {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(135,116,225,0.1);
        }
        .search-icon, .search-back {
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .search-back { padding: 2px; }
        .search-clear { color: var(--text-secondary); padding: 2px; flex-shrink: 0; }
        .search-clear:hover { color: var(--accent); }
        input {
          width: 100%;
          padding: 10px 8px;
          border-radius: 20px;
          border: none !important;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }
        .search-results {
          position: absolute;
          top: 100%;
          left: 0.5rem;
          right: 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 100;
          max-height: 400px;
          overflow-y: auto;
          margin-top: 6px;
          padding: 6px 0;
        }
        .search-loading { display: flex; justify-content: center; padding: 20px; }
        .search-spinner { width: 24px; height: 24px; border: 2.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .results-title {
          padding: 10px 16px 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .search-user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          cursor: pointer;
        }
        .search-user-card:hover {
          background: rgba(135,116,225,0.04);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar-sm {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, var(--accent), #60a5fa);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        .avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .username {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .add-btn {
          background: rgba(135,116,225,0.1);
          color: var(--accent);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .add-btn:hover {
          background: var(--accent);
          color: white;
          transform: scale(1.05);
        }
        .no-results {
          padding: 1.5rem 1rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .add-by-username {
          padding: 0 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .add-by-username span {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.4;
        }
        .username-btn {
          width: 100%;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          padding: 12px;
          border-radius: 14px;
          border-radius: 50px !important;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
