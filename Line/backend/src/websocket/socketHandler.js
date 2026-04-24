class SocketHandler {
  constructor(io) {
    this.io = io;
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join a conversation room
      socket.on('join_room', ({ conversation_id }) => {
        if (conversation_id) {
          socket.join(`conversation:${conversation_id}`);
          console.log(`Socket ${socket.id} joined conversation:${conversation_id}`);
        }
      });

      // Leave a conversation room
      socket.on('leave_room', ({ conversation_id }) => {
        if (conversation_id) {
          socket.leave(`conversation:${conversation_id}`);
          console.log(`Socket ${socket.id} left conversation:${conversation_id}`);
        }
      });

      // Join OA-specific room for receiving all messages for an OA
      socket.on('join_oa', ({ oa_id }) => {
        if (oa_id) {
          socket.join(`oa:${oa_id}`);
          console.log(`Socket ${socket.id} joined oa:${oa_id}`);
        }
      });

      // Leave OA-specific room
      socket.on('leave_oa', ({ oa_id }) => {
        if (oa_id) {
          socket.leave(`oa:${oa_id}`);
          console.log(`Socket ${socket.id} left oa:${oa_id}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast new message to conversation room
  broadcastNewMessage(conversation_id, message) {
    this.io.to(`conversation:${conversation_id}`).emit('new_message', message);
  }

  // Broadcast conversation update to OA room
  broadcastConversationUpdate(oa_id, conversation) {
    this.io.to(`oa:${oa_id}`).emit('conversation_updated', conversation);
  }

  // Broadcast new conversation to OA room
  broadcastNewConversation(oa_id, conversation) {
    this.io.to(`oa:${oa_id}`).emit('new_conversation', conversation);
  }

  // Broadcast to all connected clients (for global updates)
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketHandler;
