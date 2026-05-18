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
  poolConfig.connectionString = connectionString;
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
      ALTER TABLE produit ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1;
      ALTER TABLE produit ADD COLUMN IF NOT EXISTS couleurs TEXT[] DEFAULT '{}';

      ALTER TABLE client ADD COLUMN IF NOT EXISTS solde NUMERIC DEFAULT 0;
      ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS solde NUMERIC DEFAULT 0;

      ALTER TABLE configuration_site ADD COLUMN IF NOT EXISTS airtel_money_number TEXT DEFAULT '+241 77 00 00 00';
      ALTER TABLE configuration_site ADD COLUMN IF NOT EXISTS airtel_money_name TEXT DEFAULT 'ECOM PLUS GABON';
      ALTER TABLE configuration_site ADD COLUMN IF NOT EXISTS moov_money_number TEXT DEFAULT '+241 66 00 00 00';
      ALTER TABLE configuration_site ADD COLUMN IF NOT EXISTS moov_money_name TEXT DEFAULT 'ECOM PLUS GABON';

      CREATE TABLE IF NOT EXISTS favoris (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
          produit_id UUID NOT NULL REFERENCES produit(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(client_id, produit_id)
      );

      CREATE TABLE IF NOT EXISTS notification (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES utilisateur(id) ON DELETE CASCADE,
          client_id UUID REFERENCES utilisateur(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('devis', 'commande', 'paiement', 'chat', 'systeme')),
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query("NOTIFY pgrst, 'reload schema';");
    console.log('Database tracking, chat tables, products, notifications initialized and schema cache reloaded.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
};
