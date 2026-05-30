import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Eye, EyeOff } from 'lucide-react';
import '../index.css';
import logoImg from '/chatlogo.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', firstName: '', lastName: '', password: '' });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
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

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <img src={logoImg} alt="CHaT" className="auth-logo-img" />
        </div>
        <p className="auth-tagline">Connect, Share & Chat</p>

        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>{t.login}</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>{t.register}</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>{t.firstName}</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="John" />
              </div>
              <div className="form-group">
                <label>{t.lastName}</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" />
              </div>
            </>
          )}
          <div className="form-group">
            <label>{t.username}</label>
            <input type="text" name="username" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} placeholder="username" />
          </div>
          <div className="form-group">
            <label>{t.password}</label>
            <div className="pw-wrap">
              <input type={showPw ? 'text' : 'password'} name="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              <button type="button" className="pw-eye" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="error-text">⚠ {error}</p>}
          <button type="submit" className="submit-btn">{isLogin ? t.login : t.register}</button>
        </form>
      </div>

      <style jsx="true">{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: var(--bg-secondary);
          padding: 20px;
        }
        .auth-card {
          background: var(--bg-primary);
          padding: 2.5rem 2rem;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          width: 100%;
          max-width: 400px;
          text-align: center;
          border: 1px solid var(--border);
        }
        .auth-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }
        .auth-logo-img {
          height: 80px;
          width: auto;
          object-fit: contain;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .auth-logo-img:hover { transform: scale(1.05); }
        .auth-tagline {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .auth-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: var(--bg-secondary);
          padding: 5px;
          border-radius: 12px;
        }
        .auth-tabs button {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .auth-tabs button.active {
          background: var(--bg-primary);
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        form { text-align: left; }
        .form-group { margin-bottom: 16px; }
        label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border) !important;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: border-color 0.15s;
        }
        input:focus { border-color: var(--accent) !important; outline: none; }
        .pw-wrap { position: relative; }
        .pw-wrap input { padding-right: 44px; }
        .pw-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          padding: 4px;
        }
        .submit-btn {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          background: var(--accent);
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          transition: opacity 0.15s;
        }
        .submit-btn:hover { opacity: 0.88; }
        .error-text {
          color: #ed4956;
          font-size: 0.85rem;
          margin: 8px 0;
          padding: 10px 14px;
          background: rgba(237,73,86,0.08);
          border-radius: 8px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Auth;
