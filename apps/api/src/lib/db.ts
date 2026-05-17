import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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

      CREATE TABLE IF NOT EXISTS conversation (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
          agent_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
          status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS message (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
          sender_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS internal_message (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sender_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE produit ADD COLUMN IF NOT EXISTS longueur_m NUMERIC DEFAULT 0;
      ALTER TABLE produit ADD COLUMN IF NOT EXISTS largeur_m NUMERIC DEFAULT 0;
      ALTER TABLE produit ADD COLUMN IF NOT EXISTS hauteur_m NUMERIC DEFAULT 0;
    `);
    console.log('Database tracking, chat tables and product dimensions initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
};
