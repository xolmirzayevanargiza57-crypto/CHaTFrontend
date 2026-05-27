import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';

const ChatWindow = ({ friend, messages, onSendMessage, onBack, isOnline }) => {
  const [text, setText] = useState('');
  const { user, lang } = useAuth();
  const t = translations[lang];
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
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
        <div className="welcome-content">
          <h1>{t.welcome}, {user.firstName}!</h1>
          <p>{t.noMessages}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="friend-profile">
          <div className="avatar small">
            {getInitials(friend.firstName, friend.lastName)}
            {isOnline && <div className="online-dot"></div>}
          </div>
          <div>
            <h3>{friend.firstName} {friend.lastName}</h3>
            <p className="status">{isOnline ? t.online : t.offline}</p>
          </div>
        </div>
        <button className="icon-btn">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div 
            key={msg._id || index} 
            className={`message-wrapper ${msg.from === user.id ? 'sent' : 'received'}`}
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
        }
        .chat-header {
          padding: 1rem 1.5rem;
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
          gap: 0.75rem;
        }
        .friend-profile h3 {
          font-size: 1rem;
          font-weight: 600;
        }
        .status {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .avatar.small {
          width: 40px;
          height: 40px;
          background: var(--accent);
          color: white;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          position: relative;
        }
        .online-dot {
            width: 10px;
            height: 10px;
            background: #10b981;
            border: 2px solid var(--bg-primary);
            border-radius: 50%;
            position: absolute;
            bottom: -1px;
            right: -1px;
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

        @media (max-width: 768px) {
          .back-btn {
            display: block;
          }
          .chat-window {
              display: ${friend ? 'flex' : 'none'};
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              z-index: 20;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
