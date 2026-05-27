import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Search, UserPlus } from 'lucide-react';

const SearchBar = ({ onFriendAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { lang } = useAuth();
  const t = translations[lang];

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
      if (onFriendAdded) onFriendAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding friend");
    }
  };

  const getInitials = (firstName, lastName) => {
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder={t.search} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="search-results fade-in">
            <p className="results-title">{t.searchResult}</p>
          {results.map((user) => (
            <div key={user._id} className="search-user-card">
              <div className="user-info">
                <div className="avatar small">{getInitials(user.firstName, user.lastName)}</div>
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
        </div>
      )}

      {query && results.length === 0 && !loading && (
          <div className="search-results">
              <p className="no-results">{t.noResults}</p>
              <div className="add-by-username">
                <span>{t.addByUsernameHelp}</span>
                <button className="add-btn username-btn" onClick={addFriendByUsername}>
                  <UserPlus size={16} /> {t.addByUsername}
                </button>
              </div>
          </div>
      )}

      <style jsx="true">{`
        .search-container {
          padding: 1rem;
          position: relative;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-secondary);
        }
        input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }
        input:focus {
          border-color: var(--accent);
        }
        .search-results {
          position: absolute;
          top: 100%;
          left: 0.5rem;
          right: 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 0.5rem;
        }
        .results-title {
            padding: 0.75rem 1rem 0.25rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
        }
        .search-user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          cursor: pointer;
        }
        .search-user-card:hover {
          background: var(--bg-secondary);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .avatar.small {
          width: 32px;
          height: 32px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .username {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .add-btn {
          background: var(--bg-secondary);
          color: var(--accent);
          border-radius: 0.5rem;
          padding: 0.5rem;
        }
        .add-btn:hover {
          background: var(--accent);
          color: white;
        }
        .no-results {
            padding: 1rem;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .add-by-username {
          padding: 0 1rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: stretch;
        }
        .add-by-username span {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: center;
        }
        .username-btn {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
