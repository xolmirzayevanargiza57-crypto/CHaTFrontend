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
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
    
    socket = io('http://localhost:5000');
    socket.emit('join', user.id);

    socket.on('userOnline', (userId) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
    });

    socket.on('userOffline', (userId) => {
      setOnlineUsers((prev) => prev.filter(id => id !== userId));
    });

    socket.on('receiveMessage', (message) => {
      if (selectedFriend && (message.from === selectedFriend._id || message.to === selectedFriend._id)) {
        setMessages((prev) => [...prev, message]);
      } else {
        // Increment unread count for the sender
        setFriends(prev => prev.map(f => 
          f._id === message.from ? { ...f, unreadCount: (f.unreadCount || 0) + 1 } : f
        ));
      }
    });

    socket.on('newFriend', (newFriend) => {
        setFriends(prev => [...prev, { ...newFriend, unreadCount: 1 }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user.id, selectedFriend, fetchFriends]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
      // Clear unread count
      setFriends(prev => prev.map(f => 
        f._id === selectedFriend._id ? { ...f, unreadCount: 0 } : f
      ));
    }
  }, [selectedFriend]);

  const fetchMessages = async (friendId) => {
    try {
      const response = await axios.get(`/api/messages/${friendId}`);
      setMessages(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text) => {
    try {
      const response = await axios.post(`/api/messages/${selectedFriend._id}`, { text });
      setMessages([...messages, response.data]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-page">
      <Sidebar 
        friends={friends} 
        onlineUsers={onlineUsers}
        selectedFriend={selectedFriend}
        onSelectFriend={setSelectedFriend}
        onFriendAdded={fetchFriends}
      />
      <ChatWindow 
        friend={selectedFriend} 
        messages={messages}
        isOnline={selectedFriend && onlineUsers.includes(selectedFriend._id)}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedFriend(null)}
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
