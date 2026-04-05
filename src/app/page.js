'use client';

import { useState, useEffect } from 'react';
import {
  getTodayStats, saveDailyStats, getOutreachKPIs, getYoutubeStreak,
  getVideoDeadline, getClients, getMeetings
} from '@/lib/store';

export default function DashboardPage() {
  const [stats, setStats] = useState({ dmsSent: 0, emailsOut: 0, videoPosts: 0 });
  const [kpis, setKpis] = useState({ totalToday: 0, target: 50, pct: 0, remaining: 50 });
  const [streak, setStreak] = useState(0);
  const [deadline, setDeadline] = useState({ hoursLeft: 48, minutesLeft: 0 });
  const [clients, setClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  async function refreshData() {
    const today = await getTodayStats();
    setStats({ dmsSent: today.dms_sent || 0, emailsOut: today.emails_out || 0, videoPosts: today.video_posts || 0 });
    setKpis(await getOutreachKPIs());
    setStreak(await getYoutubeStreak());
    setDeadline(await getVideoDeadline());
    setClients(await getClients());
    setMeetings(await getMeetings());
  }

  async function handleLogStats(e) {
    e.preventDefault();
    await saveDailyStats(stats);
    await refreshData();
  }

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div>
      {/* Welcome & Urgent Attention */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight" style={{ color: '#2a2f32' }}>Welcome, Kristin</h2>
          <p className="font-body mt-1" style={{ color: '#575c60' }}>Here is your performance snapshot for today.</p>
        </div>
        {/* Urgent Attention */}
        <div className="flex-1 max-w-2xl glass-card p-4 rounded-2xl" style={{ background: 'rgba(247,75,109,0.06)', border: '1px solid rgba(180,19,64,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined filled" style={{ color: '#b41340' }}>warning</span>
            <h3 className="font-headline text-sm font-extrabold uppercase tracking-wider" style={{ color: '#b41340' }}>Urgent Attention (24-48h)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl flex items-center justify-between group hover:bg-white/60 transition-colors" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase" style={{ color: '#575c60' }}>Client Delivery</span>
                <span className="text-sm font-bold" style={{ color: '#2a2f32' }}>Vortex Rebrand</span>
              </div>
              <span className="text-xs font-extrabold px-2 py-1 rounded" style={{ color: '#b41340', background: 'rgba(180,19,64,0.1)' }}>
                14h left
              </span>
            </div>
            <div className="p-3 rounded-xl flex items-center justify-between group hover:bg-white/60 transition-colors" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase" style={{ color: '#575c60' }}>Video Production</span>
                <span className="text-sm font-bold" style={{ color: '#2a2f32' }}>Q4 Expansion Strategy</span>
              </div>
              <span className="text-xs font-extrabold px-2 py-1 rounded" style={{ color: '#b41340', background: 'rgba(180,19,64,0.1)' }}>
                {deadline.hoursLeft || 0}h left
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Log Today's Stats */}
          <div className="bg-white p-6 rounded-2xl editorial-shadow" style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(135,154,255,0.3)', color: '#2a4bd9' }}>
                  <span className="material-symbols-outlined filled text-lg">edit_square</span>
                </div>
                <h3 className="font-headline text-lg font-bold">Log Today&apos;s Stats</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#575c60' }}>Manual Data Entry</span>
            </div>
            <form onSubmit={handleLogStats} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: '#575c60' }}>DMs Sent</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={stats.dmsSent || ''}
                  onChange={e => setStats(s => ({ ...s, dmsSent: parseInt(e.target.value) || 0 }))}
                  className="border-none rounded-xl py-3 px-4 text-sm font-bold outline-none"
                  style={{ backgroundColor: '#e3e9ee' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: '#575c60' }}>Emails Out</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={stats.emailsOut || ''}
                  onChange={e => setStats(s => ({ ...s, emailsOut: parseInt(e.target.value) || 0 }))}
                  className="border-none rounded-xl py-3 px-4 text-sm font-bold outline-none"
                  style={{ backgroundColor: '#e3e9ee' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest pl-1" style={{ color: '#575c60' }}>Video Posts</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={stats.videoPosts || ''}
                  onChange={e => setStats(s => ({ ...s, videoPosts: parseInt(e.target.value) || 0 }))}
                  className="border-none rounded-xl py-3 px-4 text-sm font-bold outline-none"
                  style={{ backgroundColor: '#e3e9ee' }}
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full h-[44px] kinetic-gradient text-white rounded-xl font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">save</span>
                  Update Metrics
                </button>
              </div>
            </form>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Outreach */}
            <div className="bg-white p-6 rounded-xl editorial-shadow card-hover">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 kinetic-gradient rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">send</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ color: '#2a4bd9', background: 'rgba(135,154,255,0.2)' }}>DAILY</span>
              </div>
              <h3 className="font-headline text-sm font-bold mb-1" style={{ color: '#575c60' }}>Daily Outreach</h3>
              <p className="font-headline text-3xl font-extrabold mb-4">{kpis.totalToday || 0}<span className="text-lg font-medium" style={{ color: '#a9aeb1' }}>/50</span></p>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#dde3e8' }}>
                <div className="kinetic-gradient h-full rounded-full transition-all duration-500" style={{ width: `${kpis.pct || 0}%` }} />
              </div>
              <p className="text-[10px] mt-2 font-bold uppercase tracking-wider" style={{ color: '#575c60' }}>{kpis.pct || 0}% OF TARGET</p>
            </div>

            {/* YouTube Streak */}
            <div className="bg-white p-6 rounded-xl editorial-shadow card-hover">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 energy-gradient rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">video_library</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ color: '#af2700', background: 'rgba(255,196,182,0.2)' }}>STREAK</span>
              </div>
              <h3 className="font-headline text-sm font-bold mb-1" style={{ color: '#575c60' }}>YouTube Streak</h3>
              <p className="font-headline text-3xl font-extrabold mb-4">{streak}<span className="text-lg font-medium" style={{ color: '#a9aeb1' }}> DAYS</span></p>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#dde3e8' }}>
                <div className="energy-gradient h-full rounded-full" style={{ width: `${Math.min(100, streak * 10)}%` }} />
              </div>
              <p className="text-[10px] mt-2 font-bold uppercase tracking-wider" style={{ color: '#575c60' }}>
                {deadline.hoursLeft < 24 ? 'UPLOAD TODAY' : 'NEXT UPLOAD TOMORROW'}
              </p>
            </div>

            {/* Active Projects */}
            <div className="bg-white p-6 rounded-xl editorial-shadow card-hover">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 teal-gradient rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">folder_shared</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ color: '#006575', background: 'rgba(84,224,253,0.2)' }}>LIVE</span>
              </div>
              <h3 className="font-headline text-sm font-bold mb-1" style={{ color: '#575c60' }}>Active Projects</h3>
              <p className="font-headline text-3xl font-extrabold mb-4">{String(clients.length).padStart(2, '0')}</p>
              <div className="flex -space-x-2">
                {['#2a4bd9', '#af2700', '#006575'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c }}>{String.fromCharCode(65 + i)}</div>
                ))}
                {clients.length > 3 && <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: '#dde3e8' }}>+{clients.length - 3}</div>}
              </div>
            </div>
          </div>

          {/* Productivity Analytics Chart */}
          <div className="bg-white p-8 rounded-2xl editorial-shadow relative overflow-hidden">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-headline text-xl font-bold">Focusing Productivity Analytics</h3>
                <p className="font-body text-sm" style={{ color: '#575c60' }}>Intraday focus variance mapping</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2a4bd9' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: '#575c60' }}>Max Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#006575' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: '#575c60' }}>Min Focus</span>
                </div>
              </div>
            </div>
            <div className="h-64 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-primary" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(42, 75, 217, 0.2)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(42, 75, 217, 0)', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path d="M0,120 Q100,20 200,100 T400,60 T600,140 T800,40" fill="none" stroke="#2a4bd9" strokeWidth="4" strokeLinecap="round" />
                <path d="M0,120 Q100,20 200,100 T400,60 T600,140 T800,40 L800,200 L0,200 Z" fill="url(#grad-primary)" />
                <path d="M0,150 Q150,180 300,130 T500,160 T800,120" fill="none" stroke="#006575" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                {[0,1,2,3].map(i => <div key={i} className="w-full" style={{ borderTop: '1px solid #73777b' }} />)}
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: '#575c60' }}>
              <span>08:00 AM</span><span>11:00 AM</span><span>02:00 PM</span><span>05:00 PM</span><span>08:00 PM</span>
            </div>
          </div>

          {/* Developed Areas & Accelerator Portal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: '#ecf1f6' }}>
              <h3 className="font-headline text-lg font-bold mb-6">Developed Areas</h3>
              <div className="space-y-6">
                {[
                  { label: 'YouTube Growth', pct: 78, color: '#2a4bd9' },
                  { label: 'Outreach Consistency', pct: kpis.pct || 0, color: '#af2700' },
                  { label: 'Client Satisfaction', pct: 85, color: '#006575' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold" style={{ color: '#575c60' }}>{item.label}</span>
                      <span className="text-sm font-extrabold" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#dde3e8' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col justify-center" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
              <h4 className="font-headline text-lg font-extrabold mb-2" style={{ color: '#2a4bd9' }}>Accelerator Portal</h4>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#575c60' }}>Boost your productivity by accessing specialized kinetic tools and curation presets.</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="text-white p-3 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer" style={{ backgroundColor: '#2a4bd9' }}>Launch Curator</button>
                <button className="p-3 rounded-xl font-bold text-xs hover:opacity-80 transition-colors cursor-pointer" style={{ backgroundColor: '#d7dee3', color: '#2a2f32' }}>Video Audit</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Meetings */}
          <div className="bg-white p-6 rounded-2xl editorial-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-lg font-bold">My Meetings</h3>
              <button className="p-2 rounded-full transition-colors hover:bg-[#2a4bd9]/5 cursor-pointer" style={{ color: '#2a4bd9' }}>
                <span className="material-symbols-outlined">add_circle</span>
              </button>
            </div>
            <div className="space-y-4">
              {meetings.length === 0 && <p className="text-sm text-gray-500">No meetings scheduled.</p>}
              {meetings.slice(0, 3).map((m, i) => {
                const colors = { primary: '#2a4bd9', secondary: '#af2700', tertiary: '#006575' };
                const c = colors[m.color] || '#2a4bd9';
                const d = new Date(m.date);
                const month = d.toLocaleString('en', { month: 'short' });
                const day = d.getDate();
                return (
                  <div key={m.id || i} className="group flex gap-4 p-4 rounded-xl hover:bg-[#ecf1f6] transition-all">
                    <div className="flex flex-col items-center justify-center min-w-[50px] h-[60px] rounded-xl" style={{ background: `${c}15`, color: c }}>
                      <span className="text-xs font-bold uppercase">{month}</span>
                      <span className="text-xl font-extrabold">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate" style={{ color: '#2a2f32' }}>{m.title}</h4>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: '#575c60' }}>{m.startTime} — {m.endTime}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`material-symbols-outlined text-[14px] ${m.isLocation ? '' : 'filled'}`} style={{ color: m.isLocation ? '#575c60' : c }}>
                          {m.isLocation ? 'location_on' : 'videocam'}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: m.isLocation ? '#575c60' : c }}>{m.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-[#e3e9ee] cursor-pointer" style={{ border: '1px solid rgba(169,174,177,0.2)', color: '#575c60' }}>View Full Calendar</button>
          </div>

          {/* Activity Feed */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#ecf1f6' }}>
            <h3 className="font-headline text-lg font-bold mb-6">Recent Kinetic Pulse</h3>
            <div className="space-y-6">
              {[
                { text: 'Daily outreach stats updated', time: 'Just now', color: '#2a4bd9' },
                { text: 'Dashboard performance refreshed', time: '2 hours ago', color: '#a9aeb1' },
                { text: 'New client project added to CRM', time: 'Yesterday', color: '#006575' },
              ].map((item, i) => (
                <div key={i} className="relative pl-6 pb-2" style={{ borderLeft: '2px solid rgba(135,154,255,0.5)' }}>
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4" style={{ backgroundColor: item.color, borderColor: '#ecf1f6' }} />
                  <p className="text-xs font-bold" style={{ color: item.color === '#a9aeb1' ? '#575c60' : '#2a2f32' }}>{item.text}</p>
                  <p className="text-[10px] mt-1" style={{ color: '#575c60' }}>{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 kinetic-gradient text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer">
        <span className="material-symbols-outlined filled text-2xl">add</span>
      </button>
    </div>
  );
}
