#!/usr/bin/env node

import { connectDB, disconnectDB } from '../config/database';
import { runAllMigrations, migrations } from '../migrations';

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Connect to database
    await connectDB();
    
    // Run all migrations
    await runAllMigrations(migrations);
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runMigrations();