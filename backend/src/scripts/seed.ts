#!/usr/bin/env node

import { connectDB, disconnectDB } from '../config/database';
import { runAllSeeds, seedDefaultPreferences, seedTestUsers } from '../seeds';

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Define seeds to run
    const seeds = [
      seedDefaultPreferences,
      seedTestUsers,
    ];
    
    // Run all seeds
    await runAllSeeds(seeds);
    
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runSeeds();