import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { 
  Send, ArrowLeft, MoreVertical, Smile, X, Trash2, UserX, 
  Paperclip, Image as ImageIcon, Video, Music, Mic, StopCircle, 
  CheckCircle2, Play, Pause, Search, Gift, Heart, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EMOJIS = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪','😎','🤓','🧐','🫡','🫢','🫣','🤫','🤔','😶‍🌫️','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','🫨','😌','🤑','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','🫦','💋'];

const STICKERS = ['🔥','✨','⭐','🌟','⚡','💥','🎈','🎉','🎊','🎁','🎂','🏆','🥇','🥈','🥉','⚽','🏀','🏈','🎾','🏐','🏉','🎱','🏓','🏸','🥅','🎮','🕹️','🎲','🧩','🧸','🎨','🎭','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻'];

const GIPHY_API_KEY = 'GlVGYR8SqkvlIVKR8cBqALfNHq0IDKQH'; // Public beta key

const ChatWindow = ({ friend, messages, onSendMessage, onClearForBoth, onClearForMe, onBack, isOnline, socket }) => {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('emoji');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [captionText, setCaptionText] = useState('');
  const [gifs, setGifs] = useState([]);
  const [gifSearch, setGifSearch] = useState('');
  const [gifLoading, setGifLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, lang } = useAuth();
  const t = translations[lang];
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const panelRef = useRef(null);
  const audioRefs = useRef({});

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { 
    setPreview(null); 
    setShowMediaPanel(false);
    setText('');
    setCaptionText('');
  }, [friend]);

  // Click outside to close panel
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.panel-toggle')) {
        setShowMediaPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load trending GIFs
  useEffect(() => {
    if (activeTab === 'gifs' && gifs.length === 0) {
      fetchTrendingGifs();
    }
  }, [activeTab]);

  // GIF search debounce
  useEffect(() => {
    if (activeTab !== 'gifs') return;
    const delay = setTimeout(() => {
      if (gifSearch.trim()) {
        searchGifs(gifSearch);
      } else {
        fetchTrendingGifs();
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [gifSearch]);

  const fetchTrendingGifs = async () => {
    setGifLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=30&rating=g`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (err) { console.error(err); }
    finally { setGifLoading(false); }
  };

  const searchGifs = async (q) => {
    setGifLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=30&rating=g`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (err) { console.error(err); }
    finally { setGifLoading(false); }
  };

  const handleSendGif = (gif) => {
    const gifUrl = gif.images.fixed_height.url;
    onSendMessage({ text: '', fileUrl: gifUrl, fileType: 'gif', isGif: true });
    setShowMediaPanel(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('video/') ? 'video' : 
                 file.type.startsWith('audio/') ? 'audio' : 'file';
    setPreview({ url: URL.createObjectURL(file), type, file, name: file.name });
    setCaptionText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg' });
        setPreview({
          url: URL.createObjectURL(blob),
          type: 'voice',
          file: new File([blob], "voice.ogg", { type: 'audio/ogg' }),
          name: t.voiceMessage
        });
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const uploadAndSend = async (customPayload = null) => {
    if (!preview && !text.trim() && !customPayload) return;
    setUploading(true);
    let payload = customPayload || { text: text.trim() };
    
    if (preview) {
      const formData = new FormData();
      formData.append('file', preview.file);
      try {
        const uploadRes = await axios.post('/api/upload', formData);
        payload = { ...payload, ...uploadRes.data };
        if (captionText.trim()) {
          payload.caption = captionText.trim();
        }
      } catch (err) { alert("Yuklashda xatolik!"); setUploading(false); return; }
    }
    
    onSendMessage(payload);
    setText(''); setPreview(null); setUploading(false); setShowMediaPanel(false); setCaptionText('');
  };

  const handleSendSticker = (sticker) => {
      uploadAndSend({ text: sticker, isSticker: true });
  };

  const toggleAudioPlay = (msgId) => {
    const audio = audioRefs.current[msgId];
    if (!audio) return;
    if (audioPlaying === msgId) {
      audio.pause();
      setAudioPlaying(null);
    } else {
      // Stop all playing
      Object.values(audioRefs.current).forEach(a => a && a.pause());
      audio.play();
      setAudioPlaying(msgId);
      audio.onended = () => setAudioPlaying(null);
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !friend) return;
    
    const handleTyping = (data) => {
      if (friend && data.from === friend._id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socket.on('userTyping', handleTyping);
    socket.on('userStopTyping', (data) => {
      if (friend && data.from === friend._id) setIsTyping(false);
    });

    return () => {
      socket.off('userTyping');
      socket.off('userStopTyping');
    };
  }, [friend, socket]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        uploadAndSend();
    }
  };

  const handleTextChange = (val) => {
    setText(val);
    if (socket && friend) {
      socket.emit('typing', { from: user.id, to: friend._id });
    }
  };

  if (!friend) return (
    <div className="chat-window empty hide-mobile">
      <div className="welcome-content">
        <h1 className="welcome-logo">CHaT</h1>
        <p>{t.selectChat}</p>
      </div>
      <style jsx="true">{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={24} /></button>
        <div className="friend-profile" onClick={() => navigate(`/profile/${friend._id}`)}>
          <div className="avatar small">
            {friend.avatar ? <img src={friend.avatar} alt="v" /> : friend.firstName[0]}
            {isOnline && <div className="online-dot"></div>}
          </div>
          <div className="friend-info-text">
            <h3>{friend.firstName} {friend.lastName}</h3>
            <p className="status-container">
              {isTyping ? (
                <span className="typing-status">{t.typing}</span>
              ) : (
                <span className={`status ${isOnline ? 'online' : ''}`}>{isOnline ? t.online : t.offline}</span>
              )}
            </p>
          </div>
        </div>
        {isSelecting ? (
            <button className="icon-btn red" onClick={() => { onDeleteMessages(selectedMessages); setIsSelecting(false); setSelectedMessages([]); }}><Trash2 size={22} /></button>
        ) : (
            <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={20} /></button>
        )}
        {showMenu && (
          <div className="dropdown-menu fade-in">
            <button className="menu-item red" onClick={() => { onClearForBoth(); setShowMenu(false); }}>
               <Trash2 size={16} /> {t.clearForBoth}
            </button>
            <button className="menu-item" onClick={() => { onClearForMe(); setShowMenu(false); }}>
               <Trash2 size={16} /> {t.clearForMe}
            </button>
          </div>
        )}
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={msg._id || index} 
               className={`message-wrapper ${msg.from === user.id ? 'sent' : 'received'} ${selectedMessages.includes(msg._id) ? 'selected' : ''}`}
               onClick={() => isSelecting && setSelectedMessages(prev => prev.includes(msg._id) ? prev.filter(id => id !== msg._id) : [...prev, msg._id])}
               onContextMenu={(e) => { e.preventDefault(); setIsSelecting(true); setSelectedMessages([msg._id]); }}
          >
            <div className={`message-bubble ${msg.isSticker ? 'sticker-msg' : ''} ${msg.isGif ? 'gif-msg' : ''} ${(msg.fileType === 'image' && !msg.text && !msg.isSticker) ? 'image-msg' : ''}`}>
              {msg.isGif && msg.fileUrl && (
                <img src={msg.fileUrl} className="msg-gif" alt="GIF" />
              )}
              {msg.fileType === 'image' && !msg.isGif && (
                <div className="image-container">
                  <img src={msg.fileUrl} className="msg-media" onClick={() => window.open(msg.fileUrl)} />
                  {msg.caption && <p className="image-caption">{msg.caption}</p>}
                </div>
              )}
              {msg.fileType === 'video' && <video src={msg.fileUrl} controls className="msg-media" />}
              {msg.fileType === 'voice' && (
                <div className="voice-message-tg" onClick={() => toggleAudioPlay(msg._id)}>
                  <audio ref={el => audioRefs.current[msg._id] = el} src={msg.fileUrl} preload="metadata" />
                  <div className="voice-play-btn">
                    {audioPlaying === msg._id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  </div>
                  <div className="voice-waveform-container">
                    <div className="voice-waveform">
                      {Array.from({length: 20}, () => Math.random() * 60 + 20).map((h, i) => (
                        <div key={i} className={`wave-bar ${audioPlaying === msg._id ? 'animate' : ''}`} style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}></div>
                      ))}
                    </div>
                    <span className="voice-duration">
                      {audioRefs.current[msg._id] ? formatDuration(audioRefs.current[msg._id].duration || 0) : '0:00'}
                    </span>
                  </div>
                </div>
              )}
              {msg.fileType === 'audio' && (
                <div className="voice-message-tg" onClick={() => toggleAudioPlay(msg._id)}>
                  <audio ref={el => audioRefs.current[msg._id] = el} src={msg.fileUrl} preload="metadata" />
                  <div className="voice-play-btn">
                    {audioPlaying === msg._id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  </div>
                  <div className="voice-waveform-container">
                    <div className="voice-waveform">
                      {Array.from({length: 20}, () => Math.random() * 60 + 20).map((h, i) => (
                        <div key={i} className="wave-bar" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                    <span className="voice-duration">{msg.fileName || 'Audio'}</span>
                  </div>
                </div>
              )}
              {msg.text && (
                 msg.isSticker ? <span className="sticker-content">{msg.text}</span> : <p className="msg-text">{msg.text}</p>
              )}
              {!msg.isSticker && !msg.isGif && (
                <div className="msg-meta">
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.from === user.id && <CheckCircle2 size={12} className="check-icon" />}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {preview && (
        <div className="preview-float fade-in">
          <div className="preview-header">
            <h3>{t.preview}</h3>
            <button className="close-preview" onClick={() => { setPreview(null); setCaptionText(''); }}><X size={18} /></button>
          </div>
          <div className="preview-content">
            {preview.type === 'image' ? (
              <img src={preview.url} alt="p" />
            ) : preview.type === 'video' ? (
              <video src={preview.url} controls />
            ) : (
              <div className="file-box"><Music size={24} /> {preview.name}</div>
            )}
            {(preview.type === 'image' || preview.type === 'video') ? (
              <div className="caption-row">
                <input 
                  type="text" 
                  className="caption-input"
                  placeholder={t.sendAsCaption}
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                />
                <button className="preview-send-btn" onClick={() => uploadAndSend()} disabled={uploading}>
                  {uploading ? <div className="tg-spinner xsmall"></div> : <Send size={20} />}
                </button>
              </div>
            ) : (
              <div className="caption-row" style={{justifyContent: 'flex-end'}}>
                <button className="preview-send-btn" onClick={() => uploadAndSend()} disabled={uploading}>
                  {uploading ? <div className="tg-spinner xsmall"></div> : <Send size={20} />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Panel (Emoji, Stickers, GIFs) */}
      {showMediaPanel && (
        <div className="media-panel fade-in" ref={panelRef}>
          <div className="panel-tabs">
            <button className={activeTab === 'emoji' ? 'active' : ''} onClick={() => setActiveTab('emoji')}>Emoji</button>
            <button className={activeTab === 'stickers' ? 'active' : ''} onClick={() => setActiveTab('stickers')}>{t.stickers}</button>
            <button className={activeTab === 'gifs' ? 'active' : ''} onClick={() => setActiveTab('gifs')}>GIFs</button>
          </div>
          <div className="panel-content">
            {activeTab === 'emoji' && (
              <div className="emoji-grid">
                {EMOJIS.map((e, i) => <span key={`${e}-${i}`} onClick={() => setText(prev => prev + e)}>{e}</span>)}
              </div>
            )}
            {activeTab === 'stickers' && (
              <div className="stickers-grid">
                {STICKERS.map((s, i) => <span key={`${s}-${i}`} onClick={() => handleSendSticker(s)}>{s}</span>)}
              </div>
            )}
            {activeTab === 'gifs' && (
              <div className="gifs-section">
                <div className="gif-search-bar">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder={t.searchGifs}
                    value={gifSearch}
                    onChange={(e) => setGifSearch(e.target.value)}
                  />
                </div>
                {gifLoading ? (
                  <div className="gif-loading"><div className="tg-spinner"></div></div>
                ) : (
                  <div className="gifs-grid">
                    {gifs.map((gif) => (
                      <div key={gif.id} className="gif-item" onClick={() => handleSendGif(gif)}>
                        <img src={gif.images.fixed_height_small.url} alt={gif.title} loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="input-area">
        {isRecording ? (
          <div className="recording-container fade-in">
             <div className="rec-status">
               <div className="rec-dot"></div>
               <span>{recordingTime}s</span>
             </div>
             <p>{t.recording}</p>
             <button type="button" className="stop-btn" onClick={stopRecording}><StopCircle size={32} /></button>
          </div>
        ) : (
          <form className="input-form" onSubmit={(e) => { e.preventDefault(); uploadAndSend(); }}>
            <button type="button" className="icon-btn" title={t.attachFile} onClick={() => { fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); }}><Paperclip size={22} /></button>
            <button type="button" className="icon-btn hide-on-small" onClick={() => { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); }}><ImageIcon size={22} /></button>
            <button type="button" className="icon-btn hide-on-small" onClick={() => { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); }}><Video size={22} /></button>
            <button type="button" className="icon-btn panel-toggle" onClick={() => setShowMediaPanel(!showMediaPanel)}>
               <Smile size={22} color={showMediaPanel ? 'var(--accent)' : 'currentColor'} />
            </button>
            <textarea 
              placeholder={t.typeMessage} 
              value={text} 
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowMediaPanel(false)}
              rows="1"
              className="chat-textarea"
            />
            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
            {text.trim() || preview ? (
              <button type="submit" className="send-btn" disabled={uploading}>
                <Send size={20} />
              </button>
            ) : (
              <button type="button" className="mic-btn" onClick={startRecording}>
                <Mic size={22} />
              </button>
            )}
          </form>
        )}
      </div>

      <style jsx="true">{`
        .chat-window { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            background: var(--bg-primary); 
            height: 100vh; 
            position: relative; 
            overflow: hidden; 
        }
        .chat-window.empty { 
          align-items: center; 
          justify-content: center; 
          background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
        }
        .welcome-content { 
          text-align: center; 
          background: rgba(var(--accent-rgb, 135, 116, 225), 0.05); 
          padding: 60px; 
          border-radius: 40px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(var(--accent-rgb), 0.1);
          max-width: 80%;
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .welcome-logo { 
          font-size: 5rem; 
          font-weight: 950; 
          color: var(--accent); 
          margin-bottom: 20px; 
          letter-spacing: -3px;
          text-shadow: 0 10px 30px rgba(var(--accent-rgb), 0.25);
        }
        .welcome-content p {
          color: var(--text-secondary);
          font-size: 1.2rem;
          font-weight: 500;
        }

        .chat-header { 
          padding: 16px 24px; 
          display: flex; 
          align-items: center; 
          gap: 20px; 
          border-bottom: 1px solid var(--border); 
          background: rgba(var(--bg-primary-rgb), 0.8);
          backdrop-filter: blur(15px);
          z-index: 100; 
          position: sticky;
          top: 0;
        }
        .friend-profile { flex: 1; display: flex; align-items: center; gap: 16px; cursor: pointer; }
        .avatar.small { 
            width: 50px; 
            height: 50px; 
            border-radius: 18px; 
            background: var(--accent); 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 800; 
            position: relative; 
            font-size: 1.3rem;
            box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15);
        }
        .avatar.small img { width: 100%; height: 100%; border-radius: 18px; object-fit: cover; }
        .online-dot { width: 14px; height: 14px; background: #34c759; border: 3px solid var(--bg-primary); border-radius: 50%; position: absolute; bottom: -2px; right: -2px; }
        .friend-info-text h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 3px; color: var(--text-primary); }
        .status { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; }
        .status.online { color: #34c759; font-weight: 700; }
        .status-container { height: 20px; display: flex; align-items: center; }
        .typing-status { color: var(--accent); font-size: 0.85rem; font-weight: 700; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        
        .dropdown-menu { position: absolute; top: 100%; right: 16px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); z-index: 100; overflow: hidden; min-width: 220px; }
        .menu-item { display: flex; align-items: center; gap: 10px; padding: 14px 18px; width: 100%; color: var(--text-primary); font-size: 0.95rem; font-weight: 500; }
        .menu-item:hover { background: rgba(135,116,225,0.06); }
        .menu-item.red { color: #ff3b30; }

        .messages-area { flex: 1; overflow-y: auto; padding: 16px; background: var(--bg-secondary); display: flex; flex-direction: column; gap: 6px; }
        .message-wrapper { max-width: 80%; display: flex; flex-direction: column; }
        .message-wrapper.sent { align-self: flex-end; }
        .message-wrapper.received { align-self: flex-start; }
        .message-wrapper.selected { background: rgba(135,116,225,0.1); border-radius: 10px; }
        
        .message-bubble { padding: 8px 14px; border-radius: 18px; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
        .sent .message-bubble { background: var(--accent); color: white; border-bottom-right-radius: 4px; }
        .received .message-bubble { background: var(--bg-primary); color: var(--text-primary); border-bottom-left-radius: 4px; }
        .message-bubble.sticker-msg { background: transparent !important; box-shadow: none !important; padding: 0; }
        .message-bubble.gif-msg { padding: 4px; overflow: hidden; background: transparent !important; box-shadow: none !important; }
        .message-bubble.image-msg { padding: 4px; overflow: hidden; }
        .sticker-content { font-size: 3.5rem; display: block; }
        
        .msg-gif { max-width: 250px; border-radius: 14px; cursor: pointer; display: block; }
        .image-container { position: relative; }
        .msg-media { max-width: 100%; border-radius: 14px; margin-bottom: 2px; cursor: pointer; display: block; max-height: 350px; object-fit: cover; }
        .image-caption { padding: 6px 10px 2px; font-size: 0.9rem; line-height: 1.4; opacity: 0.95; margin: 0; }
        .msg-text { font-size: 1rem; line-height: 1.5; margin: 0; word-wrap: break-word; }
        .msg-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 0.72rem; opacity: 0.6; margin-top: 4px; }
        .check-icon { opacity: 0.7; }
        
        /* TG Voice Style */
        .voice-message-tg { display: flex; align-items: center; gap: 12px; padding: 6px 4px; min-width: 200px; cursor: pointer; }
        .voice-play-btn { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .received .voice-play-btn { background: var(--accent); color: white; }
        .voice-waveform-container { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .voice-waveform { display: flex; align-items: flex-end; gap: 2px; height: 28px; }
        .wave-bar { width: 3px; background: currentColor; opacity: 0.35; border-radius: 2px; transition: opacity 0.2s; }
        .wave-bar.animate { animation: waveAnim 0.8s ease-in-out infinite alternate; }
        @keyframes waveAnim { from { opacity: 0.2; } to { opacity: 0.8; } }
        .voice-duration { font-size: 11px; opacity: 0.7; }

        /* Media Panel */
        .media-panel { position: absolute; bottom: 80px; left: 16px; right: 16px; max-width: 420px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.18); z-index: 100; display: flex; flex-direction: column; max-height: 380px; overflow: hidden; }
        .panel-tabs { display: flex; border-bottom: 1px solid var(--border); padding: 4px; }
        .panel-tabs button { flex: 1; padding: 10px; font-weight: 700; border-radius: 12px; color: var(--text-secondary); border: none !important; font-size: 0.9rem; }
        .panel-tabs button.active { background: rgba(135,116,225,0.12); color: var(--accent); }
        .panel-content { flex: 1; overflow-y: auto; padding: 12px; }
        .emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; font-size: 1.5rem; }
        .emoji-grid span, .stickers-grid span { cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; padding: 4px; }
        .emoji-grid span:hover, .stickers-grid span:hover { transform: scale(1.2); background: rgba(135,116,225,0.08); }
        .stickers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; font-size: 2.5rem; }
        
        /* GIF Section */
        .gifs-section { display: flex; flex-direction: column; gap: 10px; }
        .gif-search-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-secondary); border-radius: 12px; }
        .gif-search-bar input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 0.9rem; outline: none; }
        .gif-loading { display: flex; justify-content: center; padding: 30px; }
        .tg-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .gifs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 250px; overflow-y: auto; }
        .gif-item { border-radius: 10px; overflow: hidden; cursor: pointer; aspect-ratio: 1; }
        .gif-item:hover { transform: scale(1.03); }
        .gif-item img { width: 100%; height: 100%; object-fit: cover; }
        
        .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .preview-header h3 { font-size: 1.1rem; font-weight: 800; margin: 0; }
        .preview-float { position: absolute; bottom: 90px; left: 16px; right: 16px; max-width: 400px; background: var(--bg-primary); padding: 20px; border-radius: 24px; box-shadow: 0 15px 50px rgba(0,0,0,0.2); border: 1px solid var(--border); z-index: 150; }
        .preview-content { display: flex; flex-direction: column; gap: 15px; }
        .preview-float img, .preview-float video { width: 100%; max-height: 300px; border-radius: 16px; object-fit: contain; background: #000; }
        .close-preview { background: rgba(255,255,255,0.1); color: var(--text-primary); border-radius: 50%; padding: 6px; }
        .caption-row { display: flex; gap: 10px; align-items: center; }
        .caption-input { flex: 1; padding: 12px 16px; border-radius: 14px; background: var(--bg-secondary); color: var(--text-primary); font-size: 1rem; border: 1px solid var(--border) !important; }
        .preview-send-btn { width: 48px; height: 48px; border-radius: 16px; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(135,116,225,0.3); }
        .preview-send-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .tg-spinner.xsmall { width: 18px; height: 18px; border-width: 2px; }

        .input-area { padding: 12px 16px; background: var(--bg-primary); border-top: 1px solid var(--border); }
        .input-form { display: flex; align-items: center; gap: 10px; }
        .chat-textarea { flex: 1; padding: 12px 18px; border-radius: 22px; background: var(--bg-secondary); border: none !important; color: var(--text-primary); font-size: 1rem; resize: none; max-height: 150px; font-family: inherit; line-height: 1.4; outline: none; }
        .icon-btn { color: var(--text-secondary); padding: 6px; border-radius: 50%; }
        .icon-btn.red { color: #ff3b30; }
        .icon-btn:hover { color: var(--accent); background: rgba(135,116,225,0.08); }
        .send-btn, .mic-btn { width: 46px; height: 46px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; border: none !important; flex-shrink: 0; }
        .mic-btn { background: #34c759; cursor: pointer; }
        .mic-btn:active { transform: scale(1.3); background: #ff3b30; }

        .recording-container { display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; color: #ff3b30; }
        .rec-status { display: flex; align-items: center; gap: 8px; font-weight: 800; }
        .rec-dot { width: 12px; height: 12px; background: #ff3b30; border-radius: 50%; animation: pulse 1s infinite; }
        @keyframes pulse { 50% { opacity: 0.3; } }
        .stop-btn { color: #ff3b30; }

        .back-btn { display: none; color: var(--accent); padding: 4px; }

        @media (max-width: 768px) {
          .chat-window { position: fixed; inset: 0; z-index: 2000; display: ${friend ? 'flex' : 'none'}; }
          .back-btn { display: flex; }
          .input-area { padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
          .media-panel { bottom: 90px; left: 8px; right: 8px; width: auto; max-width: none; }
          .preview-float { bottom: 90px; left: 8px; right: 8px; max-width: none; }
          .hide-on-small { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
