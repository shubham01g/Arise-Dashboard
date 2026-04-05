import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = pg;

async function checkConnection() {
  console.log('Testing Supabase DB Connection...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Supabase Connection: SUCCESSFUL');
    
    // Check if YouTube tokens exist
    const res = await client.query('SELECT * FROM youtube_tokens LIMIT 1;');
    if (res.rows && res.rows.length > 0) {
      console.log('✅ YouTube Auth Status: CONNECTED (Tokens found for channel:', res.rows[0].channel_title, ')');
    } else {
      console.log('⚠️ YouTube Auth Status: NOT CONNECTED (No OAuth tokens found yet)');
      console.log('   -> The user needs to click "Connect YouTube" in the browser to authorize.');
    }
  } catch (err) {
    console.error('❌ Supabase Connection: FAILED', err.message);
  } finally {
    await client.end();
  }
}

checkConnection();
