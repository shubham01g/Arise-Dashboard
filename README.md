# Arise Transform — Internal Dashboard

> Complete internal business management dashboard for **Arise Transform** — YouTube content tracking, outreach & sales command, client CRM, and productivity analytics.

## ⚡ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router) |
| Styling | **Tailwind CSS v4** + Custom Design Tokens |
| Database | **Supabase** (PostgreSQL) |
| YouTube | **YouTube Data API v3** (OAuth2) |
| Fonts | Plus Jakarta Sans · Manrope · Material Symbols |

## 🖼️ Design System — “Kinetic Curator”

- Glassmorphism cards with backdrop blur
- Kinetic (blue), Energy (red), Teal, Urgent gradient classes
- Editorial shadows and micro-animations
- Fully responsive 4-page layout

## 📂 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPI cards, meetings, productivity chart, activity feed |
| `/youtube` | YouTube Hub | 48h publish deadline, content pipeline, live YouTube stats |
| `/outreach` | Outreach | Daily goal tracker, performance log, historical table |
| `/clients` | CRM | Manual project entry, deal counters, priority timeline |

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/shubham01g/Arise-Dashboard.git
cd Arise-Dashboard
npm install
```

### 2. Environment Variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://...
YOUTUBE_CLIENT_ID=your-google-client-id
YOUTUBE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

Run the setup scripts to create tables and apply RLS:

```bash
node scripts/setup-pg.mjs
node scripts/apply-rls.mjs
```

### 4. YouTube OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add `http://localhost:3000/api/youtube/callback` as an **Authorized redirect URI**
3. Enable the **YouTube Data API v3**

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🗂️ Project Structure

```
src/
├── app/
│   ├── layout.js            # Root layout with Sidebar + TopNav
│   ├── page.js              # Dashboard home
│   ├── globals.css          # Design tokens & utility classes
│   ├── youtube/page.js      # YouTube tracking hub
│   ├── outreach/page.js     # Outreach & sales command
│   ├── clients/page.js      # CRM page
│   └── api/youtube/
│       ├── auth/route.js    # OAuth2 consent redirect
│       ├── callback/route.js# Token exchange + storage
│       └── stats/route.js   # Live channel data endpoint
├── components/
│   ├── Sidebar.js
│   └── TopNav.js
└── lib/
    ├── supabase.js          # Supabase client singleton
    ├── store.js             # All CRUD operations
    └── youtube.js           # YouTube OAuth2 + API helpers

scripts/
├── setup-pg.mjs           # Create all 9 database tables
└── apply-rls.mjs          # Enable Row Level Security
```

## 🛡️ Database Tables

- `daily_stats` — Daily DMs, emails, video posts
- `outreach_logs` — Historical outreach performance
- `youtube_videos` — Content pipeline items
- `video_timer` — 48h publish countdown
- `clients` — Client projects with deadlines
- `meetings` — Upcoming meetings
- `counters` — Closed deals & proposals
- `youtube_tokens` — OAuth2 tokens (created via Supabase SQL)
- `youtube_channel_stats` — Cached channel metrics

## 📝 License

Private — Internal use only.
