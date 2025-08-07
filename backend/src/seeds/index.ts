import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface Seed {
  name: string;
  run: () => Promise<void>;
}

// Default user preferences seed
export const seedDefaultPreferences: Seed = {
  name: 'default_user_preferences',
  
  async run() {
    console.log('Seeding default user preferences...');
    
    // Create a default/guest user for demo purposes
    const defaultUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('demo_password', 10);
    
    // Insert default user (if not exists)
    await query(`
      INSERT INTO users (id, email, username, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [defaultUserId, 'demo@example.com', 'demo_user', hashedPassword]);
    
    // Insert default preferences (if not exists)
    await query(`
      INSERT INTO user_preferences (user_id, perspective, tone, language, ai_model, fact_checking_enabled, propaganda_detection_enabled, propaganda_sensitivity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO NOTHING
    `, [defaultUserId, 'neutral', 'professional', 'en', 'openai', true, true, 'medium']);
    
    // Insert default content filters (if not exists)
    await query(`
      INSERT INTO content_filters (user_id, included_topics, excluded_topics, included_people, excluded_people, included_organizations, excluded_organizations)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO NOTHING
    `, [defaultUserId, '{}', '{}', '{}', '{}', '{}', '{}']);
    
    console.log('✅ Default user preferences seeded');
  }
};

// Test users seed for development
export const seedTestUsers: Seed = {
  name: 'test_users',
  
  async run() {
    if (process.env.NODE_ENV === 'production') {
      console.log('Skipping test users seed in production environment');
      return;
    }
    
    console.log('Seeding test users...');
    
    const testUsers = [
      { email: 'conservative@test.com', username: 'conservative_user', perspective: 'conservative', tone: 'formal' },
      { email: 'liberal@test.com', username: 'liberal_user', perspective: 'liberal', tone: 'casual' },
      { email: 'progressive@test.com', username: 'progressive_user', perspective: 'progressive', tone: 'analytical' },
    ];
    
    for (const testUser of testUsers) {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash('test_password', 10);
      
      // Insert test user (if not exists)
      await query(`
        INSERT INTO users (id, email, username, password_hash)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, [userId, testUser.email, testUser.username, hashedPassword]);
      
      // Insert user preferences (if not exists)
      await query(`
        INSERT INTO user_preferences (user_id, perspective, tone, language, ai_model, fact_checking_enabled, propaganda_detection_enabled, propaganda_sensitivity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId, testUser.perspective, testUser.tone, 'en', 'openai', true, true, 'medium']);
      
      // Insert content filters (if not exists)
      await query(`
        INSERT INTO content_filters (user_id, included_topics, excluded_topics, included_people, excluded_people, included_organizations, excluded_organizations)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId, '{}', '{}', '{}', '{}', '{}', '{}']);
    }
    
    console.log('✅ Test users seeded');
  }
};

// Run all seeds
export const runAllSeeds = async (seeds: Seed[]): Promise<void> => {
  console.log('Starting database seeding...');
  
  for (const seed of seeds) {
    try {
      console.log(`Running seed: ${seed.name}`);
      await seed.run();
    } catch (error) {
      console.error(`❌ Seed ${seed.name} failed:`, error);
      throw error;
    }
  }
  
  console.log('✅ All seeds completed');
};