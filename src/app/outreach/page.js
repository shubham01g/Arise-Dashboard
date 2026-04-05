'use client';

import { useState, useEffect } from 'react';
import { getOutreachLogs, saveOutreachLog, getOutreachKPIs, getTodayStats, saveDailyStats } from '@/lib/store';

export default function OutreachPage() {
  const [kpis, setKpis] = useState({ totalToday: 0, target: 50, pct: 0, remaining: 50 });
  const [form, setForm] = useState({ dmsSent: 0, emailsSent: 0, repliesReceived: 0 });
  const [logs, setLogs] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  async function refresh() {
    setKpis(await getOutreachKPIs());
    setLogs(await getOutreachLogs());
    const today = await getTodayStats();
    setForm({ dmsSent: today.dms_sent || 0, emailsSent: today.emails_out || 0, repliesReceived: 0 });
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const dayName = new Date().toLocaleDateString('en', { weekday: 'long' });
    const total = (form.dmsSent || 0) + (form.emailsSent || 0);
    const goalPct = Math.round((total / 50) * 100);

    await saveOutreachLog({
      date: today,
      dayName,
      dms: form.dmsSent || 0,
      emails: form.emailsSent || 0,
      replies: form.repliesReceived || 0,
      total,
      goalPct,
      goalStatus: goalPct >= 100 ? 'Met Goal' : `${goalPct}% Goal`,
    });

    const todayStats = await getTodayStats();
    await saveDailyStats({
      dmsSent: form.dmsSent || 0,
      emailsOut: form.emailsSent || 0,
      videoPosts: todayStats.video_posts || 0,
    });

    await refresh();
  }

  if (!mounted) return <div className="min-h-screen" />;

  const todayStr = new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold tracking-tight mb-2" style={{ color: '#2a2f32' }}>Outreach &amp; Sales Command</h2>
          <p className="font-medium" style={{ color: '#575c60' }}>Manual Performance Tracking. Stay Kinetic.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl flex items-center gap-2" style={{ backgroundColor: '#ecf1f6' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#575c60' }}>Manual Tracking Active</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Radial Progress */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 editorial-shadow flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: 'rgba(42,75,217,0.05)' }} />
          <p className="text-sm font-label font-bold uppercase tracking-[0.2em] mb-8" style={{ color: '#575c60' }}>Daily Message Goal</p>
          <div
            className="relative w-48 h-48 rounded-full flex items-center justify-center mb-8"
            style={{
              background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2a4bd9 ${kpis.pct || 0}%, #dde3e8 0)`,
            }}
          >
            <div className="text-center">
              <span className="block text-5xl font-headline font-extrabold" style={{ color: '#2a4bd9' }}>{kpis.totalToday || 0}</span>
              <span className="text-sm font-bold uppercase tracking-tighter" style={{ color: '#a9aeb1' }}>of 50 messages</span>
            </div>
          </div>
          <div className="w-full flex justify-between items-center pt-6" style={{ borderTop: '1px solid #ecf1f6' }}>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#2a2f32' }}>{kpis.pct || 0}%</p>
              <p className="text-[10px] uppercase" style={{ color: '#a9aeb1' }}>Today&apos;s Progress</p>
            </div>
            <div className="h-8 w-px" style={{ backgroundColor: '#dde3e8' }} />
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#2a2f32' }}>{kpis.remaining || 0}</p>
              <p className="text-[10px] uppercase" style={{ color: '#a9aeb1' }}>Remaining</p>
            </div>
          </div>
        </div>

        {/* Daily Entry Form */}
        <div className="col-span-12 lg:col-span-8 rounded-3xl p-8 editorial-shadow text-white relative overflow-hidden" style={{ backgroundColor: '#2a4bd9' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFQYB-jZHvjsBa7cFb2aRJsPdIjF93dBa4RUb3NjhLlsHQbVu5q3ncyMep2T6fO7Y5NYbFP8l56PvNr8kkRWtpRJuYIsgMGlAHBtQq5xn2rsJpKCWYgWGtCn6cYXYXPjGzi-PIn5Pf0kjtpTNNorYdx2cfHGz7dT0_13uhGSzY9dfL7Ds5FQHO8puPBuk5JWOhSX9ZW6YXPscRKjWkrn3XMm00DTjH8EQs4YeXlbSVq2YzPn8xnPol8jH-EGkVU-847eobUyetg1c')" }} />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-3xl">edit_square</span>
              <h3 className="text-2xl font-headline font-bold">Today&apos;s Performance Log</h3>
              <span className="ml-auto text-xs bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{todayStr}</span>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: '#879aff' }}>DMs Sent</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={form.dmsSent === 0 ? '' : form.dmsSent}
                  onChange={e => setForm(f => ({ ...f, dmsSent: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 px-6 text-2xl font-bold placeholder:text-white/30 focus:ring-0 focus:border-white transition-all outline-none text-white"
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: '#879aff' }}>Emails Sent</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={form.emailsSent === 0 ? '' : form.emailsSent}
                  onChange={e => setForm(f => ({ ...f, emailsSent: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 px-6 text-2xl font-bold placeholder:text-white/30 focus:ring-0 focus:border-white transition-all outline-none text-white"
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: '#879aff' }}>Replies Received</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={form.repliesReceived === 0 ? '' : form.repliesReceived}
                  onChange={e => setForm(f => ({ ...f, repliesReceived: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 px-6 text-2xl font-bold placeholder:text-white/30 focus:ring-0 focus:border-white transition-all outline-none text-white"
                />
              </div>
            </form>
            <div className="mt-auto">
              <button
                onClick={handleSave}
                type="button"
                className="w-full bg-white rounded-2xl py-5 font-bold text-lg hover:shadow-2xl transition-all scale-100 active:scale-95 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#ffffff]"
                style={{ color: '#2a4bd9' }}
              >
                <span className="material-symbols-outlined">save</span>
                Save Daily Progress
              </button>
            </div>
          </div>
        </div>

        {/* Historical Table */}
        <div className="col-span-12 bg-white rounded-3xl p-8 editorial-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-headline font-bold" style={{ color: '#2a2f32' }}>Historical Performance</h3>
              <p className="text-sm" style={{ color: '#575c60' }}>Review and edit previous daily logs</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:text-[#2a4bd9] cursor-pointer" style={{ backgroundColor: '#dde3e8', color: '#575c60' }}>
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter Dates
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a9aeb1', borderBottom: '1px solid #ecf1f6' }}>
                  <th className="pb-4 px-4 font-bold">Date</th>
                  <th className="pb-4 px-4 font-bold text-center">DMs</th>
                  <th className="pb-4 px-4 font-bold text-center">Emails</th>
                  <th className="pb-4 px-4 font-bold text-center">Replies</th>
                  <th className="pb-4 px-4 font-bold text-center">Total Outreach</th>
                  <th className="pb-4 px-4 font-bold text-center">Goal Status</th>
                  <th className="pb-4 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: '#ecf1f6' }}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm" style={{ color: '#a9aeb1' }}>
                      No outreach logs yet. Log your first day above!
                    </td>
                  </tr>
                ) : logs.slice(0, 10).map((log, i) => {
                  const d = new Date(log.date);
                  // Ensure UTC dates are used to prevent timezone shifting
                  const formatted = new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
                  const isGoal = log.goal_pct >= 100;
                  return (
                    <tr key={log.id || i} className={`group transition-colors ${i === 1 ? 'font-medium' : ''} hover:bg-[#ecf1f6]/50`} style={{ backgroundColor: i === 1 ? 'rgba(42,75,217,0.05)' : 'transparent', color: i === 1 ? '#2a4bd9' : 'inherit' }}>
                      <td className="py-5 px-4">
                        <div className="font-bold text-sm" style={{ color: i === 1 ? 'inherit' : '#2a2f32' }}>{formatted}</div>
                        <div className="text-[10px] uppercase" style={{ color: '#a9aeb1' }}>{log.day_name}</div>
                      </td>
                      <td className={`py-5 px-4 text-center font-bold ${i !== 1 ? 'text-[#2a2f32]' : ''}`}>{log.dms}</td>
                      <td className={`py-5 px-4 text-center font-bold ${i !== 1 ? 'text-[#2a2f32]' : ''}`}>{log.emails}</td>
                      <td className="py-5 px-4 text-center font-bold" style={{ color: '#2a4bd9' }}>{log.replies}</td>
                      <td className={`py-5 px-4 text-center font-bold ${i !== 1 ? 'text-[#2a2f32]' : ''}`}>{log.total}</td>
                      <td className="py-5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${isGoal ? 'bg-green-100 text-green-700' : log.goal_pct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {log.goal_status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <button className="transition-colors p-2 rounded-lg cursor-pointer hover:text-[#2a4bd9]" style={{ color: '#a9aeb1' }}>
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-6 text-center">
              <button className="text-xs font-bold uppercase tracking-[0.2em] hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent" style={{ color: '#2a4bd9' }}>Load More History</button>
            </div>
          </div>
        </div>

        {/* Performance Snapshots */}
        <div className="col-span-12 lg:col-span-6 rounded-3xl p-6 flex items-center gap-6 editorial-shadow" style={{ backgroundColor: '#e3e9ee', borderLeft: '4px solid #2a4bd9' }}>
          <div className="p-4 bg-white rounded-2xl">
            <span className="material-symbols-outlined text-3xl" style={{ color: '#2a4bd9' }}>analytics</span>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-headline font-extrabold" style={{ color: '#2a2f32' }}>
              {logs.length > 0 ? `${(logs.reduce((a, l) => a + (l.replies || 0), 0) / Math.max(1, logs.reduce((a, l) => a + (l.total || 0), 0)) * 100).toFixed(1)}%` : '0%'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a9aeb1' }}>Avg Response Rate (30D)</p>
          </div>
          <div className="text-right">
            <span className="text-green-500 font-bold text-xs flex items-center justify-end gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +2.4%
            </span>
            <p className="text-[10px] uppercase" style={{ color: '#a9aeb1' }}>vs Prev Period</p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 rounded-3xl p-6 flex items-center gap-6 editorial-shadow" style={{ backgroundColor: '#e3e9ee', borderLeft: '4px solid #af2700' }}>
          <div className="p-4 bg-white rounded-2xl">
            <span className="material-symbols-outlined text-3xl" style={{ color: '#af2700' }}>bolt</span>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-headline font-extrabold" style={{ color: '#2a2f32' }}>{logs.reduce((a, l) => a + (l.total || 0), 0)}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a9aeb1' }}>Total Manual Outreaches</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: '#2a2f32' }}>All Time</p>
            <p className="text-[10px] uppercase" style={{ color: '#a9aeb1' }}>Cumulative</p>
          </div>
        </div>
      </div>

      {/* FAB - using original styling */}
      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full editorial-shadow flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group cursor-pointer" style={{ backgroundColor: '#af2700', color: '#ffefec' }}>
        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">add</span>
        <div className="absolute right-20 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ backgroundColor: '#2a2f32' }}>
          New Historical Entry
        </div>
      </button>
    </div>
  );
}
