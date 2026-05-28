import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { Send, ArrowLeft, MoreVertical, Video, Smile, X, Trash2, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CHaT website's own sticker packs - iPhone/Telegram style
const STICKER_PACKS = {
  emoji: {
    label: '😀',
    title: 'Emoji',
    stickers: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊',
      '😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪',
      '😝','🤑','🤗','🤭','🫢','🤫','🤔','🫡','🤐','🤨',
      '😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌',
      '😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵',
      '🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐',
    ]
  },
  animals: {
    label: '🐶',
    title: 'Animals',
    stickers: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨',
      '🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒',
      '🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇',
      '🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞',
      '🐜','🪰','🪲','🪳','🦟','🦗','🕷','🦂','🐢','🐍',
      '🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠',
    ]
  },
  love: {
    label: '❤️',
    title: 'Love',
    stickers: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
      '❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝',
      '💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️',
      '💋','💌','💐','🌹','🥀','🌺','🌷','🌸','💮','🏵️',
      '🫶','🫰','🤝','👫','👬','👭','💏','💑','👪','🫂',
      '😍','🥰','😘','😻','💒','💍','🎀','🎁','🪷','✨',
    ]
  },
  fun: {
    label: '🎉',
    title: 'Fun',
    stickers: [
      '🎉','🎊','🎈','🎂','🎁','🎃','🎄','🎋','🎍','🎎',
      '🎏','🎐','🎑','🧨','✨','🎇','🎆','🎌','🏮','🪅',
      '🪩','🪄','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁',
      '🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','🎯','🎳',
      '🎮','🕹️','🧩','🪀','🪁','🃏','🀄','🎴','🔮','🧿',
      '💊','🧪','🎪','🎠','🎡','🎢','🛝','💎','👑','🎵',
    ]
  },
  gestures: {
    label: '👋',
    title: 'Gestures',
    stickers: [
      '👋','🤚','🖐','✋','🖖','🫱','🫲','🫳','🫴','👌',
      '🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
      '👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
      '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💪',
      '🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁',
      '🦷','🦴','👀','👁','👅','👄','🫦','💅','🤳','💃',
    ]
  },
  food: {
    label: '🍕',
    title: 'Food',
    stickers: [
      '🍕','🍔','🍟','🌭','🍿','🧂','🥨','🥯','🍞','🧇',
      '🥞','🧈','🍳','🥚','🥓','🥩','🍗','🍖','🦴','🌮',
      '🌯','🫔','🥙','🧆','🥗','🥘','🫕','🍝','🍜','🍲',
      '🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥',
      '🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰',
      '🎂','🍮','🍭','🍬','🍫','🍩','🍪','🌰','🥜','🍯',
    ]
  }
};

const ChatWindow = ({ friend, messages, onSendMessage, onClearForBoth, onClearForMe, onClearChat, onDeleteMessages, onBack, isOnline, onStartCall }) => {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showClearSubmenu, setShowClearSubmenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const [activeStickerPack, setActiveStickerPack] = useState('emoji');
  const { user, lang } = useAuth();
  const navigate = useNavigate();
  const t = translations[lang];
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSelectedMessages([]);
    setShowMenu(false);
    setShowClearSubmenu(false);
    setShowStickers(false);
  }, [friend]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowClearSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text, false);
      setText('');
    }
  };

  const handleSendSticker = (sticker) => {
    onSendMessage(sticker, true);
    setShowStickers(false);
  };

  const toggleMessageSelection = (msgId) => {
    setSelectedMessages(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const handleClearBoth = () => {
    if (window.confirm(t.confirmClearBoth)) {
      onClearForBoth();
      setShowMenu(false);
      setShowClearSubmenu(false);
    }
  };

  const handleClearMe = () => {
    if (window.confirm(t.confirmClearForMe)) {
      onClearForMe();
      setShowMenu(false);
      setShowClearSubmenu(false);
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

        <style jsx="true">{`
          .chat-window { flex: 1; display: flex; flex-direction: column; background: var(--bg-primary); height: 100vh; }
          .chat-window.empty { justify-content: center; align-items: center; background: var(--bg-secondary); }
          .welcome-content { text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
          .welcome-logo { font-size: 4rem; font-weight: 900; color: var(--accent); opacity: 0.1; letter-spacing: -2px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="friend-profile" onClick={() => navigate(`/profile/${friend._id}`)} style={{ cursor: 'pointer' }}>
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
        <div className="header-actions" ref={menuRef}>
          <button className="icon-btn call-btn" onClick={onStartCall} title="Video Call">
            <Video size={22} />
          </button>
          <button className="icon-btn" onClick={() => { setShowMenu(!showMenu); setShowClearSubmenu(false); }}>
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button className="menu-item clear-item" onClick={() => setShowClearSubmenu(!showClearSubmenu)}>
                <Trash2 size={16} />
                <span>{t.clearChat}</span>
              </button>
              {showClearSubmenu && (
                <div className="clear-submenu">
                  <button className="submenu-item" onClick={handleClearBoth}>
                    <UserX size={14} />
                    <span>{t.clearForBoth}</span>
                  </button>
                  <button className="submenu-item" onClick={handleClearMe}>
                    <Trash2 size={14} />
                    <span>{t.clearForMe}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
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

      {/* Sticker Panel */}
      {showStickers && (
        <div className="sticker-panel">
          <div className="sticker-panel-header">
            <div className="sticker-tabs">
              {Object.entries(STICKER_PACKS).map(([key, pack]) => (
                <button
                  key={key}
                  className={`sticker-tab ${activeStickerPack === key ? 'active' : ''}`}
                  onClick={() => setActiveStickerPack(key)}
                  title={pack.title}
                >
                  {pack.label}
                </button>
              ))}
            </div>
            <button className="sticker-close" onClick={() => setShowStickers(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="sticker-pack-title">{STICKER_PACKS[activeStickerPack].title}</div>
          <div className="sticker-grid">
            {STICKER_PACKS[activeStickerPack].stickers.map((sticker, i) => (
              <button
                key={i}
                className="sticker-item"
                onClick={() => handleSendSticker(sticker)}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input / Selection Bar */}
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
          <button 
            type="button" 
            className={`sticker-toggle ${showStickers ? 'active' : ''}`}
            onClick={() => setShowStickers(!showStickers)}
          >
            <Smile size={24} />
          </button>
          <input 
            type="text" 
            placeholder={t.typeMessage} 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowStickers(false)}
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

        /* Header */
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

        /* Dropdown menu with clear submenu */
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          padding: 6px;
          min-width: 220px;
          z-index: 100;
          margin-top: 0.5rem;
          animation: menuFadeIn 0.15s ease;
        }
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .menu-item {
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.95rem;
          border-radius: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .menu-item:hover {
          background: rgba(135,116,225,0.08);
        }
        .clear-item {
          color: #ff3b30;
        }
        .clear-item:hover {
          background: rgba(255, 59, 48, 0.06);
        }
        .clear-submenu {
          padding: 4px 0 0 0;
          border-top: 1px solid var(--border);
          margin-top: 4px;
        }
        .submenu-item {
          width: 100%;
          text-align: left;
          padding: 10px 14px 10px 24px;
          background: transparent;
          font-size: 0.9rem;
          border-radius: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
        }
        .submenu-item:first-child {
          color: #ff3b30;
        }
        .submenu-item:last-child {
          color: var(--accent);
        }
        .submenu-item:hover {
          background: rgba(135,116,225,0.06);
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
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
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

        /* Messages */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: var(--bg-secondary);
        }
        .message-wrapper {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          animation: msgSlide 0.2s ease;
        }
        @keyframes msgSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
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
          padding: 0.6rem 0.9rem;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          word-break: break-word;
        }
        .sent .message-bubble {
          background: var(--message-out);
          color: var(--message-out-text);
          border-bottom-right-radius: 4px;
        }
        .received .message-bubble {
          background: var(--message-in);
          color: var(--message-in-text);
          border-bottom-left-radius: 4px;
        }
        .message-bubble.sticker {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0;
          font-size: 3.5rem;
          line-height: 1.1;
        }
        .sticker-content {
          display: block;
          transition: transform 0.15s;
          cursor: default;
        }
        .sticker-content:hover {
          transform: scale(1.15);
        }
        .message-time {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 2px;
          padding: 0 0.5rem;
        }

        /* Selection bar */
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

        /* Input bar */
        .input-bar {
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.5rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
          align-items: center;
        }
        .sticker-toggle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: transparent;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .sticker-toggle:hover,
        .sticker-toggle.active {
          color: var(--accent);
          background: rgba(135,116,225,0.1);
        }
        .input-bar input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 22px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          outline: none;
          font-size: 0.95rem;
        }
        .input-bar input:focus {
          border-color: var(--accent);
        }
        .send-btn {
          background: var(--accent);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: scale(1.08);
        }
        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Sticker Panel - Telegram style */
        .sticker-panel {
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
          max-height: 320px;
          display: flex;
          flex-direction: column;
          animation: stickerSlideUp 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes stickerSlideUp {
          from { max-height: 0; opacity: 0; }
          to { max-height: 320px; opacity: 1; }
        }
        .sticker-panel-header {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          gap: 4px;
        }
        .sticker-tabs {
          display: flex;
          gap: 2px;
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .sticker-tabs::-webkit-scrollbar { display: none; }
        .sticker-tab {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          background: transparent;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .sticker-tab:hover {
          background: rgba(135,116,225,0.08);
        }
        .sticker-tab.active {
          background: var(--accent);
          border-radius: 12px;
          transform: scale(1.05);
        }
        .sticker-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: transparent;
          flex-shrink: 0;
        }
        .sticker-close:hover {
          background: rgba(255,59,48,0.08);
          color: #ff3b30;
        }
        .sticker-pack-title {
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sticker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
          gap: 2px;
          padding: 4px 8px 12px;
          overflow-y: auto;
          flex: 1;
        }
        .sticker-item {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sticker-item:hover {
          background: rgba(135,116,225,0.1);
          transform: scale(1.2);
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
            padding: 0.6rem 0.75rem;
          }
          .messages-area {
            padding: 0.75rem;
          }
          .input-bar {
            padding: 0.5rem 0.75rem;
            padding-bottom: env(safe-area-inset-bottom, 0.5rem);
          }
          .send-btn {
            width: 40px;
            height: 40px;
          }
          .sticker-toggle {
            width: 40px;
            height: 40px;
          }
          .sticker-panel {
            max-height: 260px;
          }
          .sticker-grid {
            grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
          }
          .sticker-item {
            font-size: 1.5rem;
          }
          .dropdown-menu {
            min-width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
