import { query } from '../config/database';
import { Migration } from './runner';

export const createInitialTables: Migration = {
  id: '001',
  name: '001_create_initial_tables',
  
  async up() {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        perspective VARCHAR(50) NOT NULL DEFAULT 'neutral' 
          CHECK (perspective IN ('conservative', 'liberal', 'democratic', 'progressive', 'neutral')),
        tone VARCHAR(50) NOT NULL DEFAULT 'professional'
          CHECK (tone IN ('formal', 'casual', 'analytical', 'conversational', 'professional')),
        language VARCHAR(10) NOT NULL DEFAULT 'en'
          CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt')),
        ai_model VARCHAR(50) NOT NULL DEFAULT 'openai'
          CHECK (ai_model IN ('openai', 'anthropic', 'google', 'grok', 'local')),
        fact_checking_enabled BOOLEAN NOT NULL DEFAULT true,
        propaganda_detection_enabled BOOLEAN NOT NULL DEFAULT true,
        propaganda_sensitivity VARCHAR(20) NOT NULL DEFAULT 'medium'
          CHECK (propaganda_sensitivity IN ('low', 'medium', 'high')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    // Create content_filters table
    await query(`
      CREATE TABLE IF NOT EXISTS content_filters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        included_topics TEXT[] DEFAULT '{}',
        excluded_topics TEXT[] DEFAULT '{}',
        included_people TEXT[] DEFAULT '{}',
        excluded_people TEXT[] DEFAULT '{}',
        included_organizations TEXT[] DEFAULT '{}',
        excluded_organizations TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    // Create sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      CREATE INDEX IF NOT EXISTS idx_content_filters_user_id ON content_filters(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `);

    // Create function to update updated_at timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await query(`
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_user_preferences_updated_at 
        BEFORE UPDATE ON user_preferences 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_content_filters_updated_at 
        BEFORE UPDATE ON content_filters 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_sessions_updated_at 
        BEFORE UPDATE ON sessions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down() {
    // Drop triggers first
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
      DROP TRIGGER IF EXISTS update_content_filters_updated_at ON content_filters;
      DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
    `);

    // Drop function
    await query('DROP FUNCTION IF EXISTS update_updated_at_column();');

    // Drop tables in reverse order (due to foreign key constraints)
    await query('DROP TABLE IF EXISTS sessions;');
    await query('DROP TABLE IF EXISTS content_filters;');
    await query('DROP TABLE IF EXISTS user_preferences;');
    await query('DROP TABLE IF EXISTS users;');
  }
};