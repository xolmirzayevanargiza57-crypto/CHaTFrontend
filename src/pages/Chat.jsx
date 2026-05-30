import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
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
      <Sidebar 
        friends={friends} 
        onlineUsers={onlineUsers}
        selectedFriend={selectedFriend}
        onSelectFriend={setSelectedFriend}
        onFriendAdded={fetchFriends}
        onRemoveFriend={handleRemoveFriend}
      />
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

      <style jsx="true">{`
        .chat-page {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default Chat;
