const { io } = require('socket.io-client');

console.log('🔌 Testing Socket.IO Connection...');

const socket = io('http://localhost:5000', {
  timeout: 5000,
  forceNew: true
});

setTimeout(() => {
  console.log('❌ Socket.IO Connection Timeout');
  process.exit(1);
}, 6000);

socket.on('connect', () => {
  console.log('✅ Socket.IO Connected successfully:', socket.id);
  console.log('🎉 Real-time notifications system is working!');
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.log('❌ Socket.IO Connection Failed:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket.IO Disconnected:', reason);
});