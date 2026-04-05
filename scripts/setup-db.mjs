// Run this script once to create all Supabase tables:
//   node scripts/setup-db.mjs

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zmielhwnyvwnjdrievim.supabase.co',
  'sb_publishable_qL3vmgQAT4n1Ibr3Xb1d8Q_HW7gofdn'
);

const tables = [
  {
    name: 'daily_stats',
    sql: `CREATE TABLE IF NOT EXISTS daily_stats (
      id BIGSERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
      dms_sent INTEGER NOT NULL DEFAULT 0,
      emails_out INTEGER NOT NULL DEFAULT 0,
      video_posts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  },
  {
    name: 'outreach_logs',
    sql: `CREATE TABLE IF NOT EXISTS outreach_logs (
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
    );`
  },
  {
    name: 'youtube_videos',
    sql: `CREATE TABLE IF NOT EXISTS youtube_videos (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      category TEXT,
      posted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  },
  {
    name: 'video_timer',
    sql: `CREATE TABLE IF NOT EXISTS video_timer (
      id INTEGER PRIMARY KEY DEFAULT 1,
      last_posted_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  },
  {
    name: 'clients',
    sql: `CREATE TABLE IF NOT EXISTS clients (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      revenue NUMERIC(12,2) DEFAULT 0,
      deadline DATE,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  },
  {
    name: 'meetings',
    sql: `CREATE TABLE IF NOT EXISTS meetings (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      start_time TEXT,
      end_time TEXT,
      meeting_type TEXT,
      color TEXT DEFAULT 'primary',
      is_location BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  },
  {
    name: 'counters',
    sql: `CREATE TABLE IF NOT EXISTS counters (
      id INTEGER PRIMARY KEY DEFAULT 1,
      closed_deals INTEGER NOT NULL DEFAULT 0,
      proposals_sent INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  },
];

console.log('\\n=== AriseTransform Supabase Setup ===\\n');
console.log('The tables need to be created via the Supabase SQL Editor.');
console.log('Go to: https://supabase.com/dashboard/project/zmielhwnyvwnjdrievim/sql/new');
console.log('\\nCopy and paste the following SQL:\\n');
console.log('─'.repeat(60));

const fullSQL = `
-- ══════════════════════════════════════════════════════════
-- AriseTransform Dashboard — Database Schema
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- ── Daily Stats ──
CREATE TABLE IF NOT EXISTS daily_stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  dms_sent INTEGER NOT NULL DEFAULT 0,
  emails_out INTEGER NOT NULL DEFAULT 0,
  video_posts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Outreach Logs ──
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

-- ── YouTube Videos ──
CREATE TABLE IF NOT EXISTS youtube_videos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  category TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Video Timer ──
CREATE TABLE IF NOT EXISTS video_timer (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_posted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Clients ──
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

-- ── Meetings ──
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

-- ── Counters ──
CREATE TABLE IF NOT EXISTS counters (
  id INTEGER PRIMARY KEY DEFAULT 1,
  closed_deals INTEGER NOT NULL DEFAULT 0,
  proposals_sent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Enable RLS ──
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_timer ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies (allow all — internal dashboard) ──
CREATE POLICY "Allow all for daily_stats" ON daily_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for outreach_logs" ON outreach_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for youtube_videos" ON youtube_videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for video_timer" ON video_timer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for counters" ON counters FOR ALL USING (true) WITH CHECK (true);

-- ── Seed Data ──
INSERT INTO video_timer (id, last_posted_at) VALUES (1, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO counters (id, closed_deals, proposals_sent) VALUES (1, 0, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO meetings (title, date, start_time, end_time, meeting_type, color, is_location) VALUES
  ('Brand Strategy Review', CURRENT_DATE + 1, '10:00 AM', '11:30 AM', 'Google Meet', 'primary', FALSE),
  ('YouTube Script Workshop', CURRENT_DATE + 2, '02:00 PM', '03:00 PM', 'Studio B', 'secondary', TRUE),
  ('Client Onboarding: Apex Ltd', CURRENT_DATE + 2, '04:30 PM', '05:15 PM', 'Zoom Video', 'tertiary', FALSE);
`;

console.log(fullSQL);
console.log('─'.repeat(60));
console.log('\\nAfter running the SQL, the dashboard will connect automatically!');
