import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import '../index.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, lang } = useAuth();
  const t = translations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(endpoint, formData);
      login(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <h1>CHaT</h1>
        <div className="auth-tabs">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            {t.login}
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            {t.register}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>{t.firstName}</label>
                <input 
                  type="text" 
                  name="firstName" 
                  required 
                  value={formData.firstName} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>{t.lastName}</label>
                <input 
                  type="text" 
                  name="lastName" 
                  required 
                  value={formData.lastName} 
                  onChange={handleChange} 
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>{t.username}</label>
            <input 
              type="text" 
              name="username" 
              required 
              value={formData.username} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>{t.password}</label>
            <input 
              type="password" 
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="submit-btn">
            {isLogin ? t.login : t.register}
          </button>
        </form>
      </div>

      <style jsx="true">{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: var(--bg-secondary);
        }
        .auth-card {
          background: var(--bg-primary);
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 {
          font-size: 2.5rem;
          color: var(--accent);
          margin-bottom: 2rem;
          font-weight: 800;
          letter-spacing: -1px;
        }
        .auth-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: var(--bg-secondary);
          padding: 0.5rem;
          border-radius: 0.75rem;
        }
        .auth-tabs button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .auth-tabs button.active {
          background: var(--bg-primary);
          color: var(--accent);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        form {
          text-align: left;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          outline: none;
        }
        input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          margin-top: 1rem;
          background: var(--accent);
          color: white;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
        }
        .submit-btn:hover {
          background: var(--accent-hover);
        }
        .error-text {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Auth;
