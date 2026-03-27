'use client';

import { useState, useEffect } from 'react';
import { getYoutubeVideos, saveYoutubeVideo, resetVideoTimer, getVideoDeadline } from '@/lib/store';

export default function YouTubePage() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'Strategy' });
  const [deadline, setDeadline] = useState({ hoursLeft: 47, minutesLeft: 12, isOverdue: false });
  const [mounted, setMounted] = useState(false);

  // YouTube API state
  const [ytConnected, setYtConnected] = useState(false);
  const [ytStats, setYtStats] = useState(null);
  const [ytChannel, setYtChannel] = useState(null);
  const [ytRecent, setYtRecent] = useState([]);
  const [ytLoading, setYtLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    refresh();
    fetchYouTubeStats();
    
    const interval = setInterval(async () => {
      setDeadline(await getVideoDeadline());
    }, 60000);
    return () => clearInterval(interval);
  }, []);



  async function refresh() {
    setVideos(await getYoutubeVideos());
    setDeadline(await getVideoDeadline());
  }

  async function fetchYouTubeStats() {
    try {
      setYtLoading(true);
      const res = await fetch('/api/youtube/stats');
      const data = await res.json();
      if (data.connected) {
        setYtConnected(true);
        setYtStats(data.stats);
        setYtChannel(data.channel);
        setYtRecent(data.recentVideos || []);
      } else {
        setYtConnected(false);
      }
    } catch (err) {
      console.error('Failed to fetch YT stats:', err);
      setYtConnected(false);
    } finally {
      setYtLoading(false);
    }
  }

  async function handleAddIdea(e) {
    e.preventDefault();
    if (!form.title) return;
    await saveYoutubeVideo({
      title: form.title,
      category: form.category,
      status: 'draft'
    });
    setForm({ ...form, title: '' });
    await refresh();
  }

  async function handlePostVideo() {
    await resetVideoTimer();
    await refresh();
  }

  if (!mounted) return <div className="min-h-screen" />;

  const scriptingVideos = videos.filter(v => ['draft', 'scripting'].includes(v.status));
  const filmingVideos = videos.filter(v => v.status === 'filming');
  const editingVideos = videos.filter(v => v.status === 'editing');

  // Format large numbers for display
  const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  return (
    <div className="space-y-8">
      {/* Missing Configuration Banner */}
      {!ytLoading && !ytConnected && (
        <div className="rounded-[2rem] p-6 flex items-center justify-between border-2 border-dashed" style={{ borderColor: '#af2700', backgroundColor: 'rgba(175,39,0,0.03)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: '#af2700' }}>
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold" style={{ color: '#af2700' }}>YouTube API Configuration Missing</h3>
              <p className="text-sm" style={{ color: '#575c60' }}>Please add YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID to your Vercel Environment Variables.</p>
            </div>
          </div>
        </div>
      )}

      {/* Connected Channel Badge */}
      {ytConnected && ytChannel && (
        <div className="rounded-2xl px-5 py-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(0,101,117,0.08)' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#006575' }}>
            Connected: {ytChannel.title}
          </span>
          <button onClick={fetchYouTubeStats} className="ml-auto text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:opacity-80" style={{ color: '#2a4bd9' }}>
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Stats
          </button>
        </div>
      )}

      {/* Section 1: Deadline Countdown (Hero) */}
      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 kinetic-gradient rounded-[2rem] p-10 text-white flex flex-col justify-between min-h-[320px] shadow-[0px_20px_40px_rgba(42,75,217,0.15)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2a4bd9 0%, #879aff 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="font-headline text-lg font-semibold tracking-tight mb-2 opacity-90">NEXT PUBLISH DEADLINE</h2>
            <div className="flex items-baseline gap-4">
              <span className="font-headline text-8xl font-extrabold tracking-tighter">{String(Math.max(0, deadline.hoursLeft)).padStart(2, '0')}:{String(Math.max(0, deadline.minutesLeft)).padStart(2, '0')}</span>
              <span className="font-headline text-3xl font-bold opacity-80 italic">HRS</span>
            </div>
            {deadline.isOverdue && <p className="text-red-300 font-bold mt-2 animation-pulse">Deadline Breached!</p>}
          </div>
          <div className="relative z-10 flex items-center justify-between mt-8">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-label uppercase tracking-widest opacity-70 mb-1">CURRENT PROJECT</p>
                <p className="text-xl font-bold font-headline">Mastering the Creator Economy v2</p>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div>
                <p className="text-xs font-label uppercase tracking-widest opacity-70 mb-1">TARGET DATE</p>
                <p className="text-xl font-bold font-headline">Friday, 6:00 PM</p>
              </div>
            </div>
            <button onClick={handlePostVideo} className="bg-white text-[#2a4bd9] px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
              <span className="material-symbols-outlined filled">play_arrow</span>
              Post Video &amp; Reset Timer
            </button>
          </div>
        </div>
        
        {/* Focus Summary Widget */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-[0px_10px_30px_rgba(42,47,50,0.06)] flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold mb-4" style={{ color: '#2a2f32' }}>Production Focus</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#ecf1f6' }}>
                <span className="material-symbols-outlined filled" style={{ color: '#af2700' }}>bolt</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#2a2f32' }}>Edit Rough Cut</p>
                  <p className="text-xs" style={{ color: '#575c60' }}>Editing phase is lagging</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#ecf1f6' }}>
                <span className="material-symbols-outlined filled" style={{ color: '#006575' }}>check_circle</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#2a2f32' }}>Script Approved</p>
                  <p className="text-xs" style={{ color: '#575c60' }}>Completed 4h ago</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#dde3e8' }}>
              <div className="h-full w-[65%] rounded-full" style={{ backgroundColor: '#2a4bd9' }}></div>
            </div>
            <p className="text-[10px] font-label mt-2 text-right font-bold tracking-wider" style={{ color: '#2a4bd9' }}>65% OVERALL PROGRESS</p>
          </div>
        </div>
      </section>

      {/* Section 2: 3-Column Content Pipeline */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight" style={{ color: '#2a2f32' }}>Active Pipeline</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#ecf1f6', color: '#575c60' }}><span className="material-symbols-outlined">filter_list</span></button>
            <button className="p-2 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#ecf1f6', color: '#575c60' }}><span className="material-symbols-outlined">more_horiz</span></button>
          </div>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddIdea} className="flex gap-4 mb-4 bg-white p-2 rounded-2xl shadow-sm border" style={{ borderColor: '#dde3e8' }}>
          <input 
            type="text" required placeholder="New video idea..."
            value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold" style={{ color: '#2a2f32' }}
          />
          <select
            value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            className="rounded-xl px-4 py-2 text-xs font-bold border-none outline-none cursor-pointer" style={{ backgroundColor: '#ecf1f6', color: '#575c60' }}
          >
            <option>Strategy</option>
            <option>Tutorial</option>
            <option>Vlog</option>
            <option>Educational</option>
            <option>Shorts</option>
          </select>
          <button type="submit" className="w-10 h-10 rounded-xl text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border-none" style={{ backgroundColor: '#2a4bd9' }}>
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column: Scripting */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="font-headline font-bold flex items-center gap-2" style={{ color: '#575c60' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#006575' }}></span>
                Scripting
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#dde3e8', color: '#2a2f32' }}>{scriptingVideos.length > 0 ? scriptingVideos.length : '1'}</span>
            </div>
            <div className="space-y-4">
              {scriptingVideos.length > 0 ? scriptingVideos.map(v => (
                <div key={v.id} className="bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: '#006575' }}>
                  <p className="text-[10px] font-label mb-2 font-bold uppercase tracking-widest" style={{ color: '#006575' }}>{v.category}</p>
                  <h4 className="font-bold mb-3 text-sm" style={{ color: '#2a2f32' }}>{v.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: '#a9aeb1' }}>description</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#575c60' }}>Drafting stage</span>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: '#006575' }}>
                  <p className="text-[10px] font-label mb-2 font-bold uppercase tracking-widest" style={{ color: '#006575' }}>Educational</p>
                  <h4 className="font-bold mb-3 text-sm" style={{ color: '#2a2f32' }}>5 Tools Every Creator Needs in 2024</h4>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: '#a9aeb1' }}>description</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#575c60' }}>Drafting stage</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column: Filming */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="font-headline font-bold flex items-center gap-2" style={{ color: '#575c60' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2a4bd9' }}></span>
                Filming
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#dde3e8', color: '#2a2f32' }}>{filmingVideos.length > 0 ? filmingVideos.length : '1'}</span>
            </div>
            <div className="space-y-4">
              {filmingVideos.length > 0 ? filmingVideos.map(v => (
                <div key={v.id} className="bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: '#2a4bd9' }}>
                  <p className="text-[10px] font-label mb-2 font-bold uppercase tracking-widest" style={{ color: '#2a4bd9' }}>{v.category}</p>
                  <h4 className="font-bold mb-3 text-sm" style={{ color: '#2a2f32' }}>{v.title}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: 'rgba(42,75,217,0.1)', color: '#2a4bd9' }}>A-ROLL DONE</span>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: '#2a4bd9' }}>
                  <p className="text-[10px] font-label mb-2 font-bold uppercase tracking-widest" style={{ color: '#2a4bd9' }}>Review</p>
                  <h4 className="font-bold mb-3 text-sm" style={{ color: '#2a2f32' }}>Sony A7SIII: 2 Years Later</h4>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: 'rgba(42,75,217,0.1)', color: '#2a4bd9' }}>A-ROLL DONE</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column: Editing */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="font-headline font-bold flex items-center gap-2" style={{ color: '#575c60' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#af2700' }}></span>
                Editing
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#dde3e8', color: '#2a2f32' }}>{editingVideos.length > 0 ? editingVideos.length : '1'}</span>
            </div>
            <div className="space-y-4">
              {editingVideos.length > 0 ? editingVideos.map(v => (
                <div key={v.id} className="bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: '#af2700', boxShadow: '0 0 0 2px rgba(175,39,0,0.1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-label font-bold uppercase tracking-widest" style={{ color: '#af2700' }}>{v.category}</p>
                    <span className="material-symbols-outlined text-lg filled" style={{ color: '#af2700' }}>priority_high</span>
                  </div>
                  <h4 className="font-bold mb-3 text-sm" style={{ color: '#2a2f32' }}>{v.title}</h4>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold" style={{ color: '#575c60' }}>
                      <span>VFX &amp; COLOR</span>
                      <span>80%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#ecf1f6' }}>
                      <div className="h-full w-[80%] rounded-full" style={{ backgroundColor: '#af2700' }}></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: '#af2700', boxShadow: '0 0 0 2px rgba(175,39,0,0.1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-label font-bold uppercase tracking-widest" style={{ color: '#af2700' }}>Main Feature</p>
                    <span className="material-symbols-outlined text-lg filled" style={{ color: '#af2700' }}>priority_high</span>
                  </div>
                  <h4 className="font-bold mb-3 text-sm" style={{ color: '#2a2f32' }}>Mastering the Creator Economy v2</h4>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold" style={{ color: '#575c60' }}>
                      <span>VFX &amp; COLOR</span>
                      <span>80%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#ecf1f6' }}>
                      <div className="h-full w-[80%] rounded-full" style={{ backgroundColor: '#af2700' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Production Stats — LIVE from YouTube API when connected */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
        <div className="p-6 rounded-[1.5rem] flex items-center gap-4" style={{ backgroundColor: '#ecf1f6' }}>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm" style={{ color: '#2a4bd9' }}>
            <span className="material-symbols-outlined text-3xl">movie_edit</span>
          </div>
          <div>
            <p className="text-2xl font-headline font-extrabold tracking-tight" style={{ color: '#2a2f32' }}>
              {ytConnected && ytStats ? formatCount(ytStats.videoCount) : '12'}
            </p>
            <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: '#575c60' }}>
              {ytConnected ? 'Total Videos' : 'Videos This Month'}
            </p>
          </div>
        </div>
        
        <div className="p-6 rounded-[1.5rem] flex items-center gap-4" style={{ backgroundColor: '#ecf1f6' }}>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm" style={{ color: '#006575' }}>
            <span className="material-symbols-outlined text-3xl">trending_up</span>
          </div>
          <div>
            <p className="text-2xl font-headline font-extrabold tracking-tight" style={{ color: '#2a2f32' }}>
              {ytConnected && ytStats ? formatCount(ytStats.viewCount) : '8.4k'}
            </p>
            <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: '#575c60' }}>
              {ytConnected ? 'Total Views' : 'Avg. Views per Post'}
            </p>
          </div>
        </div>
        
        <div className="p-6 rounded-[1.5rem] flex items-center gap-4" style={{ backgroundColor: '#ecf1f6' }}>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm" style={{ color: '#af2700' }}>
            <span className="material-symbols-outlined text-3xl">{ytConnected ? 'group' : 'timer'}</span>
          </div>
          <div>
            <p className="text-2xl font-headline font-extrabold tracking-tight" style={{ color: '#2a2f32' }}>
              {ytConnected && ytStats ? formatCount(ytStats.subscriberCount) : '3.2d'}
            </p>
            <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: '#575c60' }}>
              {ytConnected ? 'Subscribers' : 'Avg. Production Time'}
            </p>
          </div>
        </div>
        
        <div className="p-6 rounded-[1.5rem] flex items-center gap-4 border-2" style={{ backgroundColor: '#ecf1f6', borderColor: 'rgba(42,75,217,0.1)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: '#2a4bd9' }}>
            <span className="material-symbols-outlined text-3xl filled">{ytConnected ? 'verified' : 'workspace_premium'}</span>
          </div>
          <div>
            <p className="text-2xl font-headline font-extrabold tracking-tight" style={{ color: '#2a4bd9' }}>
              {ytConnected ? 'Live' : 'Gold'}
            </p>
            <p className="text-[10px] font-label uppercase tracking-wider" style={{ color: 'rgba(42,75,217,0.7)' }}>
              {ytConnected ? 'YouTube Connected' : 'Tier Efficiency'}
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Recent Uploads from YouTube API */}
      {ytConnected && ytRecent.length > 0 && (
        <section className="bg-white rounded-[2rem] p-8 shadow-[0px_10px_30px_rgba(42,47,50,0.06)]">
          <h3 className="font-headline text-xl font-bold mb-6" style={{ color: '#2a2f32' }}>Recent Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ytRecent.map(video => (
              <a
                key={video.videoId}
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                style={{ backgroundColor: '#ecf1f6' }}
              >
                {video.thumbnail && (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h4 className="font-bold text-sm mb-2 group-hover:text-[#2a4bd9] transition-colors line-clamp-2" style={{ color: '#2a2f32' }}>{video.title}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#575c60' }}>
                    {new Date(video.publishedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
