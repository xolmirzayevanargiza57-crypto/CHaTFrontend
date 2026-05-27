import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import VideoCall from '../components/VideoCall';

let socket;

const Chat = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Call States
  const [call, setCall] = useState({ isReceiving: false, from: null, signal: null, active: false });

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
    
    if (!socket) {
      const socketUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '5000');
      socket = io(socketUrl);
    }

    socket.emit('join', user.id);

    socket.on('userOnline', (userId) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
    });

    socket.on('userOffline', (userId) => {
      setOnlineUsers((prev) => prev.filter(id => id !== userId));
    });

    socket.on('callUser', ({ from, signal }) => {
        const caller = friends.find(f => f._id === from);
        setCall({ isReceiving: true, from: caller || { _id: from, firstName: 'User' }, signal, active: true });
    });

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => {
        if (selectedFriend && (message.from === selectedFriend._id || message.to === selectedFriend._id)) {
          return [...prev, message];
        }
        return prev;
      });

      if (!selectedFriend || message.from !== selectedFriend._id) {
         setFriends(prev => prev.map(f => 
          f._id === message.from ? { ...f, unreadCount: (f.unreadCount || 0) + 1 } : f
        ));
      }
    });

    socket.on('chatCleared', (data) => {
      if (selectedFriend && data.from === selectedFriend._id) {
        setMessages([]);
      }
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
        setFriends(prev => [...prev, { ...newFriend, unreadCount: 1 }]);
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('callUser');
      socket.off('receiveMessage');
      socket.off('chatCleared');
      socket.off('messagesDeleted');
      socket.off('friendRemoved');
      socket.off('newFriend');
    };
  }, [user.id, selectedFriend, friends, fetchFriends]);

  const handleStartCall = () => {
      setCall({ isReceiving: false, from: selectedFriend, signal: null, active: true });
  };

  const handleEndCall = () => {
      setCall({ isReceiving: false, from: null, signal: null, active: false });
  };

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

  const handleClearChat = async () => {
    try {
      await axios.delete(`/api/messages/clear/${selectedFriend._id}`);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessages = async (messageIds) => {
    try {
      await axios.delete('/api/messages/delete', { 
        data: { 
          messageIds, 
          toUserId: selectedFriend._id 
        } 
      });
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg._id)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`/api/users/remove-friend/${friendId}`);
      setFriends(prev => prev.filter(f => f._id !== friendId));
      if (selectedFriend?._id === friendId) {
        setSelectedFriend(null);
        setMessages([]);
      }
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
        onRemoveFriend={handleRemoveFriend}
      />
      <ChatWindow 
        friend={selectedFriend} 
        messages={messages}
        isOnline={selectedFriend && onlineUsers.includes(selectedFriend._id)}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        onDeleteMessages={handleDeleteMessages}
        onBack={() => setSelectedFriend(null)}
        onStartCall={handleStartCall}
      />

      {call.active && (
          <VideoCall 
            socket={socket} 
            friend={call.from} 
            isReceiving={call.isReceiving} 
            signal={call.signal}
            onEnd={handleEndCall}
          />
      )}

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
