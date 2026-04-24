import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const useStore = create((set, get) => ({
  // Socket
  socket: null,
  isConnected: false,

  // Data
  conversations: [],
  activeConversationId: null,
  messages: {},
  oaAccounts: [],
  selectedOAId: null,
  selectedStatus: null,

  // Loading states
  isLoadingConversations: false,
  isLoadingMessages: false,

  // Initialize socket connection
  connectSocket: () => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      set({ isConnected: true, socket });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      set({ isConnected: false });
    });

    socket.on('new_message', (message) => {
      const { messages } = get();
      const conversationId = message.conversation_id;
      
      set({
        messages: {
          ...messages,
          [conversationId]: [...(messages[conversationId] || []), message],
        },
      });
    });

    socket.on('conversation_updated', (conversation) => {
      const { conversations } = get();
      const index = conversations.findIndex(c => c.id === conversation.id);
      
      if (index >= 0) {
        const updatedConversations = [...conversations];
        updatedConversations[index] = conversation;
        set({ conversations: updatedConversations });
      }
    });

    socket.on('new_conversation', (conversation) => {
      const { conversations } = get();
      set({ conversations: [conversation, ...conversations] });
    });

    set({ socket });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  // Join conversation room
  joinConversation: (conversationId) => {
    const { socket } = get();
    if (socket && conversationId) {
      socket.emit('join_room', { conversation_id: conversationId });
    }
  },

  // Leave conversation room
  leaveConversation: (conversationId) => {
    const { socket } = get();
    if (socket && conversationId) {
      socket.emit('leave_room', { conversation_id: conversationId });
    }
  },

  // Join OA room
  joinOA: (oaId) => {
    const { socket } = get();
    if (socket && oaId) {
      socket.emit('join_oa', { oa_id: oaId });
    }
  },

  // Leave OA room
  leaveOA: (oaId) => {
    const { socket } = get();
    if (socket && oaId) {
      socket.emit('leave_oa', { oa_id: oaId });
    }
  },

  // Set conversations
  setConversations: (conversations) => set({ conversations }),

  // Add conversation
  addConversation: (conversation) => {
    const { conversations } = get();
    set({ conversations: [conversation, ...conversations] });
  },

  // Set active conversation
  setActiveConversationId: (conversationId) => {
    const { activeConversationId } = get();
    
    // Leave previous room
    if (activeConversationId) {
      get().leaveConversation(activeConversationId);
    }
    
    // Join new room
    if (conversationId) {
      get().joinConversation(conversationId);
    }
    
    set({ activeConversationId: conversationId });
  },

  // Set messages for a conversation
  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    }));
  },

  // Add message to conversation
  addMessage: (conversationId, message) => {
    const { messages } = get();
    set({
      messages: {
        ...messages,
        [conversationId]: [...(messages[conversationId] || []), message],
      },
    });
  },

  // Set OA accounts
  setOAAccounts: (oaAccounts) => set({ oaAccounts }),

  // Set selected OA filter
  setSelectedOAId: (oaId) => set({ selectedOAId: oaId }),

  // Set selected status filter
  setSelectedStatus: (status) => set({ selectedStatus: status }),

  // Set loading states
  setIsLoadingConversations: (isLoading) => set({ isLoadingConversations: isLoading }),
  setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),
}));

export default useStore;
