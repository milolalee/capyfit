const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');

// Send message
router.post('/send', MessageController.sendMessage);

// Get messages for a conversation
router.get('/conversation/:conversation_id', MessageController.getMessages);

// Get conversation with messages
router.get('/conversation/:conversation_id/details', MessageController.getConversation);

// Get all conversations
router.get('/conversations', MessageController.getConversations);

module.exports = router;
