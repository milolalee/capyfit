const pool = require('../database/config');

class Message {
  static async create({ conversation_id, oa_id, sender_type, message_type, content, line_message_id }) {
    const query = `
      INSERT INTO messages (conversation_id, oa_id, sender_type, message_type, content, line_message_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [conversation_id, oa_id, sender_type, message_type, content, line_message_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByConversationId(conversation_id, { limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC 
      LIMIT $2 OFFSET $3
    `;
    const values = [conversation_id, limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findByOAId(oa_id, { limit = 100, offset = 0 } = {}) {
    const query = `
      SELECT * FROM messages 
      WHERE oa_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const values = [oa_id, limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getLatestByConversation(conversation_id, limit = 1) {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const values = [conversation_id, limit];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Message;
