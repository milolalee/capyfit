const { Client } = require('@line/bot-sdk');
const OAAccount = require('../models/OAAccount');

class LineService {
  static async getClient(oa_id) {
    const oaAccount = await OAAccount.findById(oa_id);
    if (!oaAccount) {
      throw new Error('OA Account not found');
    }

    return new Client({
      channelAccessToken: oaAccount.access_token,
      channelSecret: oaAccount.channel_secret,
    });
  }

  static async validateSignature(channel_id, body, signature) {
    const oaAccount = await OAAccount.findByChannelId(channel_id);
    if (!oaAccount) {
      throw new Error('OA Account not found');
    }

    const client = new Client({
      channelAccessToken: oaAccount.access_token,
      channelSecret: oaAccount.channel_secret,
    });

    return client.validateSignature(body, signature);
  }

  static async replyMessage(oa_id, replyToken, messages) {
    const client = await this.getClient(oa_id);
    return await client.replyMessage(replyToken, messages);
  }

  static async pushMessage(oa_id, userId, messages) {
    const client = await this.getClient(oa_id);
    return await client.pushMessage(userId, messages);
  }

  static parseEvent(event) {
    if (!event) return null;

    const eventType = event.type;
    const userId = event.source?.userId;
    const replyToken = event.replyToken;
    const timestamp = event.timestamp;

    let messageData = null;

    if (eventType === 'message') {
      const message = event.message;
      messageData = {
        message_type: message.type,
        content: message.text || message.id, // For non-text messages, use message ID
        line_message_id: message.id,
      };
    }

    return {
      event_type: eventType,
      user_id: userId,
      reply_token: replyToken,
      timestamp,
      message_data: messageData,
      raw_event: event,
    };
  }
}

module.exports = LineService;
