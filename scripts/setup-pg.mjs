import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = pg;

async function setupDatabase() {
  console.log('Connecting to Supabase PostgreSQL database...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    console.log('Creating daily_stats...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id BIGSERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
        dms_sent INTEGER NOT NULL DEFAULT 0,
        emails_out INTEGER NOT NULL DEFAULT 0,
        video_posts INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating outreach_logs...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS outreach_logs (
        id BIGSERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
        day_name TEXT,
        dms INTEGER NOT NULL DEFAULT 0,
        emails INTEGER NOT NULL DEFAULT 0,
        replies INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 0,
        goal_pct INTEGER NOT NULL DEFAULT 0,
        goal_status TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating youtube_videos...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS youtube_videos (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        category TEXT,
        posted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating video_timer...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS video_timer (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        last_posted_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO video_timer (id, last_posted_at) VALUES (1, NULL) ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Creating youtube_tokens...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS youtube_tokens (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        access_token TEXT,
        refresh_token TEXT,
        expires_at BIGINT,
        channel_id TEXT,
        channel_title TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating youtube_channel_stats...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS youtube_channel_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        subscriber_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        video_count INTEGER DEFAULT 0,
        last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating clients...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        revenue NUMERIC(12,2) DEFAULT 0,
        deadline DATE,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating meetings...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date DATE NOT NULL,
        start_time TEXT,
        end_time TEXT,
        meeting_type TEXT,
        color TEXT DEFAULT 'primary',
        is_location BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      INSERT INTO meetings (title, date, start_time, end_time, meeting_type, color, is_location)
      SELECT 'Brand Strategy Review', CURRENT_DATE + 1, '10:00 AM', '11:30 AM', 'Google Meet', 'primary', FALSE
      WHERE NOT EXISTS (SELECT 1 FROM meetings WHERE title = 'Brand Strategy Review');
      
      INSERT INTO meetings (title, date, start_time, end_time, meeting_type, color, is_location)
      SELECT 'YouTube Script Workshop', CURRENT_DATE + 2, '02:00 PM', '03:00 PM', 'Studio B', 'secondary', TRUE
      WHERE NOT EXISTS (SELECT 1 FROM meetings WHERE title = 'YouTube Script Workshop');
      
      INSERT INTO meetings (title, date, start_time, end_time, meeting_type, color, is_location)
      SELECT 'Client Onboarding: Apex Ltd', CURRENT_DATE + 2, '04:30 PM', '05:15 PM', 'Zoom Video', 'tertiary', FALSE
      WHERE NOT EXISTS (SELECT 1 FROM meetings WHERE title = 'Client Onboarding: Apex Ltd');
    `);

    console.log('Creating counters...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS counters (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        closed_deals INTEGER NOT NULL DEFAULT 0,
        proposals_sent INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO counters (id, closed_deals, proposals_sent) VALUES (1, 0, 0) ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
