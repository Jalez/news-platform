import { query } from '../config/database';

export interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking table
const createMigrationsTable = async (): Promise<void> => {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Check if migration has been executed
const isMigrationExecuted = async (name: string): Promise<boolean> => {
  const result = await query('SELECT 1 FROM migrations WHERE name = $1', [name]);
  return result.rows.length > 0;
};

// Mark migration as executed
const markMigrationExecuted = async (name: string): Promise<void> => {
  await query('INSERT INTO migrations (name) VALUES ($1)', [name]);
};

// Remove migration record
const removeMigrationRecord = async (name: string): Promise<void> => {
  await query('DELETE FROM migrations WHERE name = $1', [name]);
};

// Run a single migration
export const runMigration = async (migration: Migration): Promise<void> => {
  await createMigrationsTable();
  
  if (await isMigrationExecuted(migration.name)) {
    console.log(`Migration ${migration.name} already executed, skipping...`);
    return;
  }

  try {
    console.log(`Running migration: ${migration.name}`);
    await migration.up();
    await markMigrationExecuted(migration.name);
    console.log(`✅ Migration ${migration.name} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migration.name} failed:`, error);
    throw error;
  }
};

// Rollback a single migration
export const rollbackMigration = async (migration: Migration): Promise<void> => {
  await createMigrationsTable();
  
  if (!(await isMigrationExecuted(migration.name))) {
    console.log(`Migration ${migration.name} not executed, skipping rollback...`);
    return;
  }

  try {
    console.log(`Rolling back migration: ${migration.name}`);
    await migration.down();
    await removeMigrationRecord(migration.name);
    console.log(`✅ Migration ${migration.name} rolled back successfully`);
  } catch (error) {
    console.error(`❌ Migration rollback ${migration.name} failed:`, error);
    throw error;
  }
};

// Run all migrations
export const runAllMigrations = async (migrations: Migration[]): Promise<void> => {
  console.log('Starting database migrations...');
  
  for (const migration of migrations) {
    await runMigration(migration);
  }
  
  console.log('✅ All migrations completed');
};

// Get executed migrations
export const getExecutedMigrations = async (): Promise<string[]> => {
  await createMigrationsTable();
  const result = await query('SELECT name FROM migrations ORDER BY executed_at');
  return result.rows.map((row: any) => row.name);
};