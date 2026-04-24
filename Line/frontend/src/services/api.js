import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Message API
export const messageAPI = {
  sendMessage: async (conversationId, message) => {
    const response = await api.post('/messages/send', {
      conversation_id: conversationId,
      message,
    });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/messages/conversation/${conversationId}`);
    return response.data;
  },

  getConversation: async (conversationId) => {
    const response = await api.get(`/messages/conversation/${conversationId}/details`);
    return response.data;
  },

  getConversations: async (params = {}) => {
    const response = await api.get('/messages/conversations', { params });
    return response.data;
  },
};

// OA Account API
export const oaAPI = {
  createOA: async (data) => {
    const response = await api.post('/oa', data);
    return response.data;
  },

  getOAs: async () => {
    const response = await api.get('/oa');
    return response.data;
  },

  getOA: async (oaId) => {
    const response = await api.get(`/oa/${oaId}`);
    return response.data;
  },

  updateOA: async (oaId, data) => {
    const response = await api.put(`/oa/${oaId}`, data);
    return response.data;
  },

  deleteOA: async (oaId) => {
    const response = await api.delete(`/oa/${oaId}`);
    return response.data;
  },
};

export default api;
