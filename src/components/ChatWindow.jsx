import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import { 
  Send, ArrowLeft, MoreVertical, Smile, X, Trash2, UserX, 
  Paperclip, Image as ImageIcon, Video, Music, Mic, StopCircle, 
  Download, Play, Pause, FileText, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CHaT website's own sticker packs
const STICKER_PACKS = {
  emoji: { label: '😀', stickers: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪'] },
  animals: { label: '🐶', stickers: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🐣'] },
  love: { label: '❤️', stickers: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝'] }
};

const ChatWindow = ({ friend, messages, onSendMessage, onClearForBoth, onClearForMe, onDeleteMessages, onBack, isOnline }) => {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showClearSubmenu, setShowClearSubmenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const [activeStickerPack, setActiveStickerPack] = useState('emoji');
  
  // Media States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null); // { url, type, file }

  const { user, lang } = useAuth();
  const navigate = useNavigate();
  const t = translations[lang];
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { 
    setSelectedMessages([]); setShowMenu(false); setShowClearSubmenu(false); setShowStickers(false); setPreview(null);
  }, [friend]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('video/') ? 'video' : 
                 file.type.startsWith('audio/') ? 'audio' : 'file';

    setPreview({
      url: URL.createObjectURL(file),
      type,
      file,
      name: file.name
    });
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        setPreview({
          url: URL.createObjectURL(blob),
          type: 'voice',
          file: new File([blob], "voice_message.ogg", { type: 'audio/ogg' }),
          name: 'Ovozli xabar'
        });
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { console.error("Mic access denied", err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const uploadAndSend = async () => {
    if (!preview && !text.trim()) return;
    setUploading(true);

    let payload = { text: text.trim() };

    if (preview) {
      const formData = new FormData();
      formData.append('file', preview.file);
      try {
        const uploadRes = await axios.post('/api/upload', formData);
        payload = {
          ...payload,
          fileType: uploadRes.data.fileType,
          file_id: uploadRes.data.file_id,
          fileName: uploadRes.data.fileName,
          fileMimeType: uploadRes.data.fileMimeType,
          fileUrl: uploadRes.data.fileUrl
        };
      } catch (err) {
        console.error("Upload failed", err);
        alert("Fayl yuklashda xatolik yuz berdi");
        setUploading(false);
        return;
      }
    }

    onSendMessage(payload);
    setText('');
    setPreview(null);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadAndSend();
  };

  const getInitials = (f, l) => (f && l ? (f[0] + l[0]).toUpperCase() : 'U');
  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!friend) {
    return (
      <div className="chat-window empty">
        <div className="welcome-content fade-in">
          <div className="welcome-logo">CHaT</div>
          <h1>Salom, {user.firstName}!</h1>
          <p>Muloqotni boshlash uchun do'stingizni tanlang.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={24} /></button>
        <div className="friend-profile" onClick={() => navigate(`/profile/${friend._id}`)}>
          <div className="avatar small">
            {friend.avatar ? <img src={friend.avatar} alt="avatar" /> : getInitials(friend.firstName, friend.lastName)}
            {isOnline && <div className="online-dot"></div>}
          </div>
          <div>
            <h3>{friend.firstName} {friend.lastName}</h3>
            <p className={`status ${isOnline ? 'online' : ''}`}>{isOnline ? 'online' : 'offline'}</p>
          </div>
        </div>
        <div className="header-actions" ref={menuRef}>
          <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={20} /></button>
          {showMenu && (
            <div className="dropdown-menu fade-in">
              <button className="menu-item red" onClick={() => setShowClearSubmenu(!showClearSubmenu)}>
                <Trash2 size={16} /> <span>Chatni tozalash</span>
              </button>
              {showClearSubmenu && (
                <div className="clear-submenu">
                  <button className="submenu-item" onClick={() => { onClearForBoth(); setShowMenu(false); }}>Hamma uchun</button>
                  <button className="submenu-item" onClick={() => { onClearForMe(); setShowMenu(false); }}>Faqat o'zim uchun</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={msg._id || index} className={`message-wrapper ${msg.from === user.id ? 'sent' : 'received'}`}>
            <div className={`message-bubble ${msg.isSticker ? 'sticker' : ''} fade-in`}>
              {msg.fileType === 'image' && (
                <div className="media-content image">
                  <img src={msg.fileUrl} alt="media" onClick={() => window.open(msg.fileUrl)} />
                </div>
              )}
              {msg.fileType === 'video' && (
                <div className="media-content video">
                  <video src={msg.fileUrl} controls />
                </div>
              )}
              {msg.fileType === 'audio' && (
                <div className="media-content audio">
                  <audio src={msg.fileUrl} controls />
                </div>
              )}
              {msg.fileType === 'voice' && (
                <div className="media-content voice">
                  <audio src={msg.fileUrl} controls />
                </div>
              )}
              {msg.text && <p className="msg-text">{msg.text}</p>}
              <div className="msg-info">
                <span className="msg-time">{formatTime(msg.createdAt)}</span>
                {msg.from === user.id && <CheckCircle2 size={12} className="msg-icon" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview Area */}
      {preview && (
        <div className="preview-overlay fade-in">
          <div className="preview-card glass">
            <button className="close-preview" onClick={() => setPreview(null)}><X size={20} /></button>
            {preview.type === 'image' && <img src={preview.url} alt="preview" />}
            {preview.type === 'video' && <video src={preview.url} controls />}
            {(preview.type === 'audio' || preview.type === 'voice') && (
              <div className="audio-preview">
                {preview.type === 'voice' ? <Mic size={40} color="var(--accent)" /> : <Music size={40} color="var(--accent)" />}
                <p>{preview.name}</p>
              </div>
            )}
            <div className="preview-actions">
               <button className="send-preview-btn" onClick={uploadAndSend} disabled={uploading}>
                  {uploading ? 'Yuborilmoqda...' : 'Yuborish'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="input-section">
        {isRecording ? (
          <div className="recording-bar fade-in">
            <div className="rec-info">
              <div className="rec-dot"></div>
              <span>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
            </div>
            <p>Ovoz yozilmoqda...</p>
            <button className="stop-rec-btn" onClick={stopRecording}><StopCircle size={32} /></button>
          </div>
        ) : (
          <form className="input-bar" onSubmit={handleSubmit}>
            <div className="input-actions-left">
              <button type="button" className="icon-btn" onClick={() => fileInputRef.current.click()}><Paperclip size={22} /></button>
              <button type="button" className="icon-btn" onClick={() => setShowStickers(!showStickers)}><Smile size={22} /></button>
            </div>
            
            <input 
              type="text" 
              placeholder="Xabar yozing..." 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              disabled={uploading}
            />
            
            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*,video/*,audio/*" />

            <div className="input-actions-right">
              {text.trim() || preview ? (
                <button type="submit" className="send-btn" disabled={uploading}><Send size={20} /></button>
              ) : (
                <button type="button" className="mic-btn" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}>
                  <Mic size={22} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <style jsx="true">{`
        .chat-window { flex: 1; display: flex; flex-direction: column; background: var(--bg-primary); height: 100vh; position: relative; }
        .chat-window.empty { justify-content: center; align-items: center; background: var(--bg-secondary); }
        .welcome-content { text-align: center; color: var(--text-secondary); }
        .welcome-logo { font-size: 4rem; font-weight: 900; opacity: 0.1; color: var(--accent); }

        .chat-header { padding: 0.8rem 1.5rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); }
        .back-btn { display: none; }
        .friend-profile { flex: 1; display: flex; align-items: center; gap: 1rem; cursor: pointer; }
        .avatar.small { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; position: relative; font-weight: 700; overflow: hidden; }
        .avatar.small img { width: 100%; height: 100%; object-fit: cover; }
        .online-dot { width: 12px; height: 12px; background: #34c759; border: 2px solid white; border-radius: 50%; position: absolute; bottom: 0; right: 0; }
        .status.online { color: #34c759; font-weight: 600; }
        .header-actions { position: relative; }

        .dropdown-menu { position: absolute; top: 100%; right: 0; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 12px; padding: 5px; min-width: 180px; box-shadow: var(--shadow); z-index: 100; }
        .menu-item { width: 100%; padding: 10px; display: flex; align-items: center; gap: 8px; font-weight: 500; border-radius: 8px; border: none !important; }
        .menu-item.red { color: #ff3b30; }

        .messages-area { flex: 1; overflow-y: auto; padding: 1.5rem; background: var(--bg-secondary); display: flex; flex-direction: column; gap: 8px; }
        .message-wrapper { max-width: 80%; display: flex; flex-direction: column; }
        .message-wrapper.sent { align-self: flex-end; }
        .message-wrapper.received { align-self: flex-start; }
        .message-bubble { padding: 8px 12px; border-radius: 18px; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .sent .message-bubble { background: var(--accent); color: white; border-bottom-right-radius: 4px; }
        .received .message-bubble { background: var(--bg-primary); color: var(--text-primary); border-bottom-left-radius: 4px; }
        .media-content { margin-bottom: 5px; border-radius: 12px; overflow: hidden; }
        .media-content img { max-width: 100%; max-height: 300px; display: block; cursor: pointer; }
        .media-content video, .media-content audio { max-width: 100%; display: block; }
        .msg-text { margin: 0; font-size: 1rem; line-height: 1.4; }
        .msg-info { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px; font-size: 0.7rem; opacity: 0.8; }

        .preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .preview-card { background: var(--bg-primary); padding: 20px; border-radius: 24px; position: relative; width: 100%; max-width: 400px; text-align: center; }
        .preview-card img, .preview-card video { max-width: 100%; max-height: 300px; border-radius: 12px; margin-bottom: 20px; }
        .audio-preview { padding: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .send-preview-btn { width: 100%; padding: 12px; background: var(--accent); color: white; border-radius: 12px; font-weight: 700; border: none !important; }
        .close-preview { position: absolute; top: 10px; right: 10px; padding: 5px; background: rgba(255,59,48,0.1); color: #ff3b30; border-radius: 50%; }

        .input-section { padding: 10px 15px; background: var(--bg-primary); border-top: 1px solid var(--border); }
        .input-bar { display: flex; align-items: center; gap: 10px; }
        .input-bar input[type="text"] { flex: 1; padding: 12px 20px; border-radius: 25px; background: var(--bg-secondary); border: none !important; font-size: 1rem; }
        .send-btn, .mic-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; border: none !important; transition: transform 0.2s; }
        .mic-btn { background: #34c759; }
        .mic-btn:active { transform: scale(1.3); background: #ff3b30; }

        .recording-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(255,59,48,0.05); border-radius: 16px; }
        .rec-info { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #ff3b30; }
        .rec-dot { width: 10px; height: 10px; background: #ff3b30; border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        @media (max-width: 768px) {
          .chat-window { position: fixed; inset: 0; z-index: 2000; display: ${friend ? 'flex' : 'none'}; }
          .back-btn { display: flex; }
          .input-section { padding-bottom: 30px; }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
