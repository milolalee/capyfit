const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const LineService = require('../services/lineService');

class MessageController {
  static async sendMessage(req, res) {
    const { conversation_id, message } = req.body;
    const agent_id = req.agent_id || 'system'; // Can be from JWT auth

    if (!conversation_id || !message) {
      return res.status(400).json({ error: 'conversation_id and message are required' });
    }

    try {
      // Get conversation
      const conversation = await Conversation.findById(conversation_id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Send message via LINE API
      const messageData = {
        type: 'text',
        text: message,
      };

      // Try to use replyToken if available (for immediate reply)
      // For now, we'll use pushMessage as it's more reliable for agent-initiated messages
      await LineService.pushMessage(conversation.oa_id, conversation.user_id, messageData);

      // Save message to database
      const savedMessage = await Message.create({
        conversation_id,
        oa_id: conversation.oa_id,
        sender_type: 'agent',
        message_type: 'text',
        content: message,
        line_message_id: null, // Agent messages don't have LINE message ID
      });

      // Update conversation last message time
      await Conversation.updateLastMessageTime(conversation_id);

      // Get updated conversation
      const updatedConversation = await Conversation.findById(conversation_id);

      // Broadcast to WebSocket
      if (req.socketHandler) {
        req.socketHandler.broadcastNewMessage(conversation_id, savedMessage);
        req.socketHandler.broadcastConversationUpdate(conversation.oa_id, updatedConversation);
      }

      res.status(200).json({
        success: true,
        message: savedMessage,
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async getMessages(req, res) {
    const { conversation_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!conversation_id) {
      return res.status(400).json({ error: 'conversation_id is required' });
    }

    try {
      const messages = await Message.findByConversationId(conversation_id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.status(200).json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }

  static async getConversations(req, res) {
    const { oa_id, status, limit = 50, offset = 0 } = req.query;

    try {
      const conversations = await Conversation.getAll({
        oa_id,
        status,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.status(200).json({ conversations });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }

  static async getConversation(req, res) {
    const { conversation_id } = req.params;

    if (!conversation_id) {
      return res.status(400).json({ error: 'conversation_id is required' });
    }

    try {
      const conversation = await Conversation.findById(conversation_id);
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Get messages for this conversation
      const messages = await Message.findByConversationId(conversation_id);

      res.status(200).json({
        conversation,
        messages,
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  }
}

module.exports = MessageController;
