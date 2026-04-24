const LineService = require('../services/lineService');
const OAAccount = require('../models/OAAccount');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

class WebhookController {
  static async handleWebhook(req, res) {
    const { oa_id } = req.params;
    const signature = req.headers['x-line-signature'];
    const body = JSON.stringify(req.body);

    try {
      // Get OA account to validate signature
      const oaAccount = await OAAccount.findById(oa_id);
      if (!oaAccount) {
        return res.status(404).json({ error: 'OA Account not found' });
      }

      // Validate LINE signature
      const isValid = await LineService.validateSignature(
        oaAccount.channel_id,
        body,
        signature
      );

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const events = req.body.events || [];

      for (const event of events) {
        const parsedEvent = LineService.parseEvent(event);

        if (!parsedEvent || parsedEvent.event_type !== 'message') {
          continue;
        }

        const { user_id, message_data, reply_token } = parsedEvent;

        if (!user_id || !message_data) {
          continue;
        }

        // Find or create conversation
        let conversation = await Conversation.findByOAAndUser(oa_id, user_id);
        
        if (!conversation) {
          conversation = await Conversation.create({
            oa_id,
            user_id,
          });
        } else {
          // Update last message time
          await Conversation.updateLastMessageTime(conversation.id);
        }

        // Save message to database
        const message = await Message.create({
          conversation_id: conversation.id,
          oa_id,
          sender_type: 'user',
          message_type: message_data.message_type,
          content: message_data.content,
          line_message_id: message_data.line_message_id,
        });

        // Get full conversation data with OA name
        const fullConversation = await Conversation.findById(conversation.id);

        // Broadcast to WebSocket
        if (req.socketHandler) {
          req.socketHandler.broadcastNewMessage(conversation.id, message);
          req.socketHandler.broadcastConversationUpdate(oa_id, fullConversation);
        }

        // Store reply token for potential use (optional, can be stored in Redis or DB)
        // replyToken can only be used once, so we'll use it immediately if needed
        // For now, we'll just acknowledge receipt
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = WebhookController;
