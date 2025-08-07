# Database Setup Guide

This document provides detailed instructions for setting up and managing the PostgreSQL database for the AI News Platform.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ and npm 9+
- Database credentials and connection details

## Quick Start

1. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed Initial Data**
   ```bash
   npm run db:seed
   ```

## Database Schema

### Core Tables

#### `users`
Stores user authentication data.
```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) UNIQUE NOT NULL
- username: VARCHAR(100) UNIQUE NOT NULL  
- password_hash: VARCHAR(255) NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_preferences`
Stores user customization settings for news content.
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users.id)
- perspective: ENUM ('conservative', 'liberal', 'democratic', 'progressive', 'neutral')
- tone: ENUM ('formal', 'casual', 'analytical', 'conversational', 'professional')
- language: ENUM ('en', 'es', 'fr', 'de', 'it', 'pt')
- ai_model: ENUM ('openai', 'anthropic', 'google', 'grok', 'local')
- fact_checking_enabled: BOOLEAN
- propaganda_detection_enabled: BOOLEAN
- propaganda_sensitivity: ENUM ('low', 'medium', 'high')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `content_filters`
Stores user content filtering preferences.
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users.id)
- included_topics: TEXT[]
- excluded_topics: TEXT[]
- included_people: TEXT[]
- excluded_people: TEXT[]
- included_organizations: TEXT[]
- excluded_organizations: TEXT[]
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `sessions`
Manages user session data.
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users.id)
- session_token: VARCHAR(255) UNIQUE
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_news_platform
DB_USER=postgres
DB_PASSWORD=your_password

# Connection Pool Settings
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## Database Management Commands

### Migrations
```bash
# Run all pending migrations
npm run db:migrate

# Run migrations (backend workspace only)
cd backend && npm run db:migrate
```

### Seeding
```bash
# Seed initial data
npm run db:seed

# Seed data (backend workspace only)  
cd backend && npm run db:seed
```

### Development
```bash
# Start development server (automatically connects to database)
npm run dev:backend

# Run all tests including database model tests
npm run test:backend
```

## Migration System

### Creating New Migrations

1. Create a new migration file in `backend/src/migrations/`:
   ```typescript
   // 002_add_new_table.ts
   import { query } from '../config/database';
   import { Migration } from './runner';

   export const addNewTable: Migration = {
     id: '002',
     name: '002_add_new_table',
     
     async up() {
       await query(`
         CREATE TABLE new_table (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           name VARCHAR(255) NOT NULL,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )
       `);
     },

     async down() {
       await query('DROP TABLE IF EXISTS new_table');
     }
   };
   ```

2. Add the migration to `backend/src/migrations/index.ts`:
   ```typescript
   import { addNewTable } from './002_add_new_table';

   export const migrations: Migration[] = [
     createInitialTables,
     addNewTable, // Add here
   ];
   ```

3. Run the migration:
   ```bash
   npm run db:migrate
   ```

### Migration Features

- **Automatic tracking**: Executed migrations are tracked in the `migrations` table
- **Rollback support**: Each migration includes `up()` and `down()` functions
- **Error handling**: Failed migrations stop execution and report errors
- **Idempotent**: Safe to run multiple times

## Database Connection

The application uses PostgreSQL connection pooling for optimal performance:

- **Connection Pool**: Configurable min/max connections
- **Error Handling**: Automatic reconnection and error logging
- **Graceful Shutdown**: Proper cleanup on application exit
- **Health Checks**: Database connectivity validation

### Connection Example
```typescript
import { connectDB, query, transaction } from './config/database';

// Simple query
const users = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
await transaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO user_preferences ...');
});
```

## Default Data

The seeding system creates:

1. **Demo User**: Default user for testing (`demo@example.com`)
2. **Test Users**: Multiple users with different preferences (development only)
3. **Default Preferences**: Neutral perspective, professional tone
4. **Empty Filters**: No content filtering by default

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check host/port in `.env` file
   - Verify database exists

2. **Authentication Failed**
   - Check username/password in `.env`
   - Ensure user has proper permissions
   - Try connecting with `psql` directly

3. **Migration Errors**
   - Check PostgreSQL logs for details
   - Ensure database user has CREATE permissions
   - Verify foreign key constraints

### Database Setup (PostgreSQL)

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE ai_news_platform;
CREATE USER ai_news_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_news_platform TO ai_news_user;
\q
```

### Testing Database Connection

```bash
# Test connection using Node.js
cd backend
node -e "
const { connectDB } = require('./dist/config/database');
connectDB().then(() => console.log('✅ Connection successful')).catch(console.error);
"
```

## Production Considerations

1. **Security**
   - Use strong database passwords
   - Enable SSL connections
   - Restrict database user permissions
   - Use environment-specific credentials

2. **Performance**
   - Configure connection pool based on load
   - Add database indexes for query optimization
   - Monitor connection usage
   - Set up read replicas if needed

3. **Backup**
   - Set up automated database backups
   - Test backup restoration procedures
   - Document backup retention policies

4. **Monitoring**
   - Monitor database performance metrics
   - Set up alerts for connection issues
   - Log slow queries for optimization