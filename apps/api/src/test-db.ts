import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing DB tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

    // Test inserting a dummy conversation/message if possible or checking columns
    const convCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'conversation'
    `);
    console.log('Conversation columns:', convCols.rows);

    const msgCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'message'
    `);
    console.log('Message columns:', msgCols.rows);

  } catch (err) {
    console.error('Database Test Error:', err);
  } finally {
    await pool.end();
  }
}

test();
