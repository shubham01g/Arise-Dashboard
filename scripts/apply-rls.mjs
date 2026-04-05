import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = pg;

async function applyRLS() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected. Applying RLS policies...');

    const tables = ['daily_stats', 'outreach_logs', 'youtube_videos', 'video_timer', 'clients', 'meetings', 'counters'];
    
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      
      // Drop existing policy if any, then create
      await client.query(`DROP POLICY IF EXISTS "Allow all ${table}" ON ${table};`);
      await client.query(`CREATE POLICY "Allow all ${table}" ON ${table} FOR ALL USING (true) WITH CHECK (true);`);
      console.log(`  ✅ ${table}: RLS enabled + policy created`);
    }

    // Verify
    const { rows } = await client.query(`SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';`);
    console.log('\n📋 Active policies:');
    rows.forEach(r => console.log(`  ${r.tablename} -> ${r.policyname}`));
    console.log(`\nTotal: ${rows.length} policies`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

applyRLS();
