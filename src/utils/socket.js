import io from 'socket.io-client';

let socket;

export const getSocket = (userId) => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(socketUrl.replace('/api', ''), {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    
    if (userId) {
      socket.emit('join', userId);
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
