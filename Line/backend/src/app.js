require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const SocketHandler = require('./websocket/socketHandler');

// Import routes
const webhookRoutes = require('./routes/webhookRoutes');
const messageRoutes = require('./routes/messageRoutes');
const oaRoutes = require('./routes/oaRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

// Initialize socket handler
const socketHandler = new SocketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach socket handler to request object for use in controllers
app.use((req, res, next) => {
  req.socketHandler = socketHandler;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/webhook', webhookRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/oa', oaRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Multi-Line OA Unified Inbox API',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook/line/:oa_id',
      messages: {
        send: 'POST /api/messages/send',
        getMessages: 'GET /api/messages/conversation/:conversation_id',
        getConversation: 'GET /api/messages/conversation/:conversation_id/details',
        getConversations: 'GET /api/messages/conversations',
      },
      oa: {
        create: 'POST /api/oa',
        getAll: 'GET /api/oa',
        getOne: 'GET /api/oa/:oa_id',
        update: 'PUT /api/oa/:oa_id',
        delete: 'DELETE /api/oa/:oa_id',
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`📝 API documentation available at http://localhost:${PORT}`);
});

module.exports = { app, server, io };
