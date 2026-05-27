import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Send, ArrowLeft, MoreVertical, Video } from 'lucide-react';

const ChatWindow = ({ friend, messages, onSendMessage, onClearChat, onDeleteMessages, onBack, isOnline, onStartCall }) => {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const { user, lang } = useAuth();
  const t = translations[lang];
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSelectedMessages([]);
    setShowMenu(false);
  }, [friend]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const toggleMessageSelection = (msgId) => {
    setSelectedMessages(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const handleClear = () => {
    if (window.confirm(t.confirmClear)) {
      onClearChat();
      setShowMenu(false);
    }
  };

  const handleDeleteSelected = () => {
    onDeleteMessages(selectedMessages);
    setSelectedMessages([]);
  };

  const getInitials = (firstName, lastName) => {
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!friend) {
    return (
      <div className="chat-window empty">
        <div className="welcome-content fade-in">
          <div className="welcome-logo">CHaT</div>
          <h1>{t.welcome}, {user.firstName}!</h1>
          <p>{t.noMessages}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header glass">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="friend-profile">
          <div className="avatar small">
            {friend.avatar ? (
                <img src={friend.avatar} alt="avatar" />
            ) : (
                getInitials(friend.firstName, friend.lastName)
            )}
            {isOnline && <div className="online-dot"></div>}
          </div>
          <div>
            <h3>{friend.firstName} {friend.lastName}</h3>
            <p className="status">{isOnline ? t.online : t.offline}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn call-btn" onClick={onStartCall} title="Video Call">
            <Video size={22} />
          </button>
          <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={handleClear}>{t.clearChat}</button>
            </div>
          )}
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div 
            key={msg._id || index} 
            className={`message-wrapper ${msg.from === user.id ? 'sent' : 'received'} ${selectedMessages.includes(msg._id) ? 'selected' : ''}`}
            onClick={() => toggleMessageSelection(msg._id)}
          >
            <div className={`message-bubble ${msg.isSticker ? 'sticker' : ''} fade-in`}>
              {msg.isSticker ? (
                  <span className="sticker-content">{msg.text}</span>
              ) : (
                  <p>{msg.text}</p>
              )}
            </div>
            <span className="message-time">{formatTime(msg.createdAt)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {selectedMessages.length > 0 ? (
        <div className="selection-bar">
          <span>{selectedMessages.length} {t.deleteSelected}</span>
          <div className="selection-actions">
            <button className="btn-cancel" onClick={() => setSelectedMessages([])}>{t.cancel}</button>
            <button className="btn-delete" onClick={handleDeleteSelected}>{t.deleteSelected}</button>
          </div>
        </div>
      ) : (
        <form className="input-bar" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder={t.typeMessage} 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
          />
          <button type="submit" disabled={!text.trim()} className="send-btn">
            <Send size={20} />
          </button>
        </form>
      )}

      <style jsx="true">{`
        .chat-window {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          height: 100vh;
        }
        .chat-window.empty {
          justify-content: center;
          align-items: center;
          background: var(--bg-secondary);
        }
        .welcome-content {
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .welcome-logo {
            font-size: 4rem;
            font-weight: 900;
            color: var(--accent);
            opacity: 0.1;
            letter-spacing: -2px;
        }
        .chat-header {
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-primary);
          z-index: 5;
        }
        .back-btn {
          display: none;
          background: transparent;
          color: var(--text-primary);
        }
        .friend-profile {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .friend-profile h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }
        .call-btn {
            color: var(--accent);
            background: rgba(59, 130, 246, 0.08) !important;
        }
        .call-btn:hover {
            background: var(--accent) !important;
            color: white !important;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          padding: 0.5rem;
          min-width: 180px;
          z-index: 100;
          margin-top: 0.5rem;
        }
        .dropdown-menu button {
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          background: transparent;
          color: #ff3b30;
          font-size: 0.95rem;
          border-radius: 0.75rem;
          font-weight: 600;
        }
        .dropdown-menu button:hover {
          background: rgba(255, 59, 48, 0.05);
        }
        .status {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .avatar.small {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--accent), #60a5fa);
          color: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          position: relative;
          overflow: hidden;
        }
        .avatar.small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .online-dot {
            width: 12px;
            height: 12px;
            background: #34c759;
            border: 2px solid var(--bg-primary);
            border-radius: 50%;
            position: absolute;
            bottom: -1px;
            right: -1px;
            z-index: 2;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--bg-secondary);
        }
        .message-wrapper {
          max-width: 70%;
          display: flex;
          flex-direction: column;
        }
        .message-wrapper.sent {
          align-self: flex-end;
          align-items: flex-end;
        }
        .message-wrapper.received {
          align-self: flex-start;
          align-items: flex-start;
        }
        .message-wrapper.selected .message-bubble {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          font-size: 0.95rem;
          line-height: 1.4;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .sent .message-bubble {
          background: var(--message-out);
          color: var(--message-out-text);
          border-bottom-right-radius: 0.25rem;
        }
        .received .message-bubble {
          background: var(--message-in);
          color: var(--message-in-text);
          border-bottom-left-radius: 0.25rem;
        }
        .message-bubble.sticker {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0;
            font-size: 3rem;
        }
        .message-time {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          padding: 0 0.5rem;
        }
        .selection-bar {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
          animation: slideUp 0.3s ease;
        }
        .selection-actions {
          display: flex;
          gap: 1rem;
        }
        .selection-actions button {
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .btn-cancel {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .btn-delete {
          background: #ef4444;
          color: white;
        }
        .input-bar {
          padding: 1.25rem 1.5rem;
          display: flex;
          gap: 1rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
        }
        .input-bar input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          outline: none;
          font-size: 0.95rem;
        }
        .send-btn {
          background: var(--accent);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .send-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: scale(1.05);
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .back-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(128, 128, 128, 0.1);
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
          .chat-window {
              display: ${friend ? 'flex' : 'none'};
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              z-index: 2000;
              background: var(--bg-primary);
          }
          .chat-header {
            padding: 0.75rem 1rem;
          }
          .messages-area {
            padding: 1rem;
          }
          .input-bar {
            padding: 0.75rem 1rem;
            padding-bottom: env(safe-area-inset-bottom, 0.75rem);
          }
          .send-btn {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
