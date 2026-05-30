import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

let socket;

const Chat = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/friends');
      setFriends(response.data.map(f => ({ ...f, unreadCount: 0 })));
      localStorage.setItem('friends_cache', JSON.stringify(response.data));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const cache = localStorage.getItem('friends_cache');
    if (cache) {
      setFriends(JSON.parse(cache).map(f => ({ ...f, unreadCount: 0 })));
    }
    
    fetchFriends();
    
    if (!socket) {
      const socketUrl = import.meta.env.VITE_API_URL || 'https://chatbackend-o1i2.onrender.com';
      socket = io(socketUrl.replace('/api', ''), {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
    }

    socket.on('connect', () => {
      socket.emit('join', user.id);
    });

    socket.on('onlineUsersList', (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => {
        const isSelectedFriend = selectedFriend && (message.from === selectedFriend._id || message.to === selectedFriend._id);
        if (isSelectedFriend) {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        }
        return prev;
      });

      setFriends(prev => {
         const friendId = message.from === user.id ? message.to : message.from;
         return prev.map(f => {
           if (f._id === friendId) {
             return { 
               ...f, 
               unreadCount: (!selectedFriend || selectedFriend._id !== friendId) ? (f.unreadCount || 0) + 1 : 0,
               lastMessageAt: message.createdAt
             };
           }
           return f;
         }).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    });

    socket.on('chatCleared', (data) => {
      if (selectedFriend && data.from === selectedFriend._id) setMessages([]);
    });

    socket.on('messagesDeleted', (data) => {
      setMessages((prev) => prev.filter(msg => !data.messageIds.includes(msg._id)));
    });

    socket.on('friendRemoved', (data) => {
      setFriends(prev => prev.filter(f => f._id !== data.friendId));
      if (selectedFriend?._id === data.friendId) {
        setSelectedFriend(null);
        setMessages([]);
      }
    });

    socket.on('newFriend', (newFriend) => {
        setFriends(prev => prev.some(f => f._id === newFriend._id) ? prev : [...prev, { ...newFriend, unreadCount: 1 }]);
    });

    socket.on('friendProfileUpdated', (data) => {
        setFriends(prev => prev.map(f => f._id === data.userId ? { ...f, ...data } : f));
        if (selectedFriend?._id === data.userId) {
            setSelectedFriend(prev => ({ ...prev, ...data }));
        }
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('receiveMessage');
      socket.off('chatCleared');
      socket.off('messagesDeleted');
      socket.off('friendRemoved');
      socket.off('newFriend');
      socket.off('friendProfileUpdated');
    };
  }, [user.id, selectedFriend, fetchFriends]);

  const fetchMessages = async (friendId) => {
    try {
      const response = await axios.get(`/api/messages/${friendId}`);
      setMessages(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedFriend) {
      // Unread countni tozalash
      setFriends(prev => prev.map(f => f._id === selectedFriend._id ? { ...f, unreadCount: 0 } : f));
      fetchMessages(selectedFriend._id);
    }
  }, [selectedFriend]);

  const handleSendMessage = async (payload) => {
    try {
      const response = await axios.post(`/api/messages/${selectedFriend._id}`, payload);
      setMessages(prev => [...prev, response.data]);
      setFriends(prev => prev.map(f => f._id === selectedFriend._id ? { ...f, lastMessageAt: response.data.createdAt } : f)
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearForBoth = async () => {
    try {
      await axios.delete(`/api/messages/clear-both/${selectedFriend._id}`);
      setMessages([]);
    } catch (err) { console.error(err); }
  };

  const handleClearForMe = async () => {
    try {
      await axios.delete(`/api/messages/clear-for-me/${selectedFriend._id}`);
      setMessages([]);
    } catch (err) { console.error(err); }
  };

  const handleDeleteMessages = async (messageIds) => {
    try {
      await axios.delete('/api/messages/delete', { data: { messageIds, toUserId: selectedFriend._id } });
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg._id)));
    } catch (err) { console.error(err); }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`/api/users/friends/${friendId}`);
      setFriends(prev => prev.filter(f => f._id !== friendId));
      if (selectedFriend?._id === friendId) setSelectedFriend(null);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="chat-page">
      {/* Friends List Column */}
      <div className="chat-sidebar">
        <div className="cs-header">
          <h2>Messages</h2>
        </div>
        <div className="cs-search">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cs-list scrollable-y">
          {friends
            .filter(f => 
              f.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              f.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(friend => (
            <div 
              key={friend._id} 
              className={`cs-item ${selectedFriend?._id === friend._id ? 'active' : ''}`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="cs-avatar">
                {friend.avatar ? (
                  <img src={friend.avatar} alt="" />
                ) : (
                  <span>{friend.firstName?.[0] || friend.username?.[0]}</span>
                )}
                {onlineUsers.includes(friend._id) && <div className="online-indicator"></div>}
              </div>
              <div className="cs-info">
                <span className="cs-name">{friend.username}</span>
                {friend.unreadCount > 0 && <span className="unread-dot">{friend.unreadCount}</span>}
              </div>
              <button 
                className="cs-remove" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Do'stlikdan o'chirasizmi?")) {
                    handleRemoveFriend(friend._id);
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {friends.length === 0 && <p className="cs-empty">No friends yet</p>}
        </div>
      </div>

      {/* Chat Window Column */}
      <div className={`chat-main ${selectedFriend ? 'show' : ''}`}>
        <ChatWindow 
          friend={selectedFriend} 
          messages={messages}
          isOnline={selectedFriend && onlineUsers.includes(selectedFriend._id)}
          onSendMessage={handleSendMessage}
          onClearForBoth={handleClearForBoth}
          onClearForMe={handleClearForMe}
          onDeleteMessages={handleDeleteMessages}
          onBack={() => setSelectedFriend(null)}
          socket={socket}
        />
      </div>

      <style jsx="true">{`
        .chat-page {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: var(--bg-primary);
        }

        /* Friends Column */
        .chat-sidebar {
          width: 350px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .cs-header { padding: 25px 20px 15px; }
        .cs-header h2 { font-size: 1.5rem; font-weight: 800; }
        
        .cs-search { padding: 0 20px 15px; }
        .cs-search input {
          width: 100%; padding: 10px 14px; border-radius: 10px;
          background: var(--bg-secondary); border: none;
          color: var(--text-primary); font-size: 0.95rem;
        }

        .cs-list { flex: 1; padding: 0 10px; }
        .cs-item {
          display: flex; align-items: center; gap: 12px; padding: 12px;
          border-radius: 12px; cursor: pointer; transition: 0.2s;
          position: relative;
        }
        .cs-item:hover { background: var(--bg-secondary); }
        .cs-item.active { background: rgba(0, 149, 246, 0.05); }
        .cs-item.active .cs-name { color: var(--accent); font-weight: 700; }

        .cs-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--bg-secondary); display: flex;
          align-items: center; justify-content: center;
          position: relative; flex-shrink: 0; overflow: hidden;
          border: 1px solid var(--border);
        }
        .cs-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .cs-avatar span { font-weight: 800; font-size: 1.4rem; color: var(--text-secondary); }
        
        .online-indicator {
          position: absolute; bottom: 2px; right: 2px;
          width: 14px; height: 14px; background: #4caf50;
          border: 3px solid var(--bg-primary); border-radius: 50%;
        }

        .cs-info { flex: 1; display: flex; flex-direction: column; }
        .cs-name { font-weight: 600; font-size: 1rem; }
        
        .unread-dot {
          background: var(--accent); color: white;
          font-size: 0.7rem; min-width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; font-weight: 800; margin-top: 4px;
          align-self: flex-start;
        }

        .cs-remove {
          padding: 8px; border-radius: 50%; color: var(--text-secondary);
          opacity: 0; transition: 0.2s;
        }
        .cs-item:hover .cs-remove { opacity: 1; }
        .cs-remove:hover { background: rgba(255,0,0,0.1); color: #ff4d4d; }

        .cs-empty { text-align: center; color: var(--text-secondary); padding: 40px 20px; }

        /* Main Chat Area */
        .chat-main { flex: 1; min-width: 0; }

        @media (max-width: 935px) {
          .chat-sidebar { width: 100%; }
          .chat-main { 
            position: absolute; inset: 0; background: var(--bg-primary);
            z-index: 100; transform: translateX(100%); transition: 0.3s;
          }
          .chat-main.show { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Chat;
