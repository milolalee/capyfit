const pool = require('../database/config');

class Conversation {
  static async create({ oa_id, user_id }) {
    const query = `
      INSERT INTO conversations (oa_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (oa_id, user_id) 
      DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [oa_id, user_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByOAAndUser(oa_id, user_id) {
    const query = 'SELECT * FROM conversations WHERE oa_id = $1 AND user_id = $2';
    const values = [oa_id, user_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll({ oa_id, status, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT c.*, oa.name as oa_name, 
             (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
             (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_type = 'user') as user_message_count
      FROM conversations c
      JOIN oa_accounts oa ON c.oa_id = oa.id
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (oa_id) {
      conditions.push(`c.oa_id = $${paramIndex}`);
      values.push(oa_id);
      paramIndex++;
    }

    if (status) {
      conditions.push(`c.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY c.last_message_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateLastMessageTime(id) {
    const query = `
      UPDATE conversations
      SET last_message_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async assignAgent(id, agent_id) {
    const query = `
      UPDATE conversations
      SET assigned_agent = $1
      WHERE id = $2
      RETURNING *
    `;
    const values = [agent_id, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE conversations
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const values = [status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM conversations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Conversation;
