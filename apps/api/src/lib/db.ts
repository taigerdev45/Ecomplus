import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  try {
    console.log('Initializing tracking database tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visite (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ip TEXT,
          user_agent TEXT,
          page TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS connexion_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
          ip TEXT,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tracking tables initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize tracking database tables:', error);
  }
};
