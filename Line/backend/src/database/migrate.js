const pool = require('./config');

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create oa_accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS oa_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) UNIQUE NOT NULL,
        channel_secret VARCHAR(255) NOT NULL,
        access_token VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        oa_id UUID REFERENCES oa_accounts(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        assigned_agent VARCHAR(255),
        status VARCHAR(50) DEFAULT 'open',
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(oa_id, user_id)
      )
    `);
    
    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        oa_id UUID REFERENCES oa_accounts(id) ON DELETE CASCADE,
        sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('user', 'agent')),
        message_type VARCHAR(50) DEFAULT 'text',
        content TEXT,
        line_message_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_oa_id ON conversations(oa_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_oa_id ON messages(oa_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)
    `);
    
    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrate;
