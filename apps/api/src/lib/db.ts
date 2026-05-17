import { Pool } from 'pg';
import dotenv from 'dotenv';

import { URL } from 'url';

import path from 'path';

const connectionString = process.env.DATABASE_URL;
const poolConfig: any = {
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: {
    rejectUnauthorized: false
  }
};

if (connectionString) {
  try {
    const parsedUrl = new URL(connectionString);
    poolConfig.user = decodeURIComponent(parsedUrl.username);
    poolConfig.password = decodeURIComponent(parsedUrl.password);
    poolConfig.host = parsedUrl.hostname;
    poolConfig.port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 5432;
    poolConfig.database = parsedUrl.pathname.substring(1);
  } catch (err) {
    poolConfig.connectionString = connectionString;
  }
}

const pool = new Pool(poolConfig);

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
