import { Migration } from './runner';
import { createInitialTables } from './001_create_initial_tables';

// Export all migrations in order
export const migrations: Migration[] = [
  createInitialTables,
];

export * from './runner';
export { createInitialTables };