const pool = require('../database/config');

class OAAccount {
  static async create({ name, channel_id, channel_secret, access_token }) {
    const query = `
      INSERT INTO oa_accounts (name, channel_id, channel_secret, access_token)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, channel_id, channel_secret, access_token];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM oa_accounts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByChannelId(channel_id) {
    const query = 'SELECT * FROM oa_accounts WHERE channel_id = $1';
    const result = await pool.query(query, [channel_id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT id, name, channel_id, created_at FROM oa_accounts ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, { name, channel_secret, access_token }) {
    const query = `
      UPDATE oa_accounts
      SET name = $1, channel_secret = $2, access_token = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, channel_secret, access_token, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM oa_accounts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = OAAccount;
