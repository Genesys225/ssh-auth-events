import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';

async function runMigrations() {
  try {
    const sqlite = new Database('sqlite.db');
    const db = drizzle(sqlite, { schema });
    
    // This will run migrations from the 'drizzle' folder
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Migrations completed successfully');
    
    // Close the database connection
    sqlite.close();
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();