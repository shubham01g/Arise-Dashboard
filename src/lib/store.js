import { supabase } from './supabase';

// ==========================================
// DAILY STATS (Dashboard)
// ==========================================
export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching today stats:', error);
  }
  return data || { dms_sent: 0, emails_out: 0, video_posts: 0 };
}

export async function saveDailyStats(stats) {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('daily_stats')
    .select('id')
    .eq('date', today)
    .single();

  if (existing) {
    return await supabase
      .from('daily_stats')
      .update({
        dms_sent: stats.dmsSent ?? 0,
        emails_out: stats.emailsOut ?? 0,
        video_posts: stats.videoPosts ?? 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    return await supabase
      .from('daily_stats')
      .insert([{
        date: today,
        dms_sent: stats.dmsSent ?? 0,
        emails_out: stats.emailsOut ?? 0,
        video_posts: stats.videoPosts ?? 0
      }]);
  }
}

// ==========================================
// OUTREACH (Outreach Page)
// ==========================================
export async function getOutreachLogs() {
  const { data, error } = await supabase
    .from('outreach_logs')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) console.error('Error fetching outreach logs:', error);
  return data || [];
}

export async function saveOutreachLog(log) {
  const { data: existing } = await supabase
    .from('outreach_logs')
    .select('id')
    .eq('date', log.date)
    .single();

  const payload = {
    date: log.date,
    day_name: log.dayName,
    dms: log.dms,
    emails: log.emails,
    replies: log.replies,
    total: log.total,
    goal_pct: log.goalPct,
    goal_status: log.goalStatus,
    updated_at: new Date().toISOString()
  };

  if (existing) {
    return await supabase.from('outreach_logs').update(payload).eq('id', existing.id);
  } else {
    return await supabase.from('outreach_logs').insert([payload]);
  }
}

export async function getOutreachKPIs() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('outreach_logs')
    .select('total, goal_pct')
    .eq('date', today)
    .single();
  
  const totalToday = data ? data.total : 0;
  const target = 50;
  const pct = Math.min(100, Math.round((totalToday / target) * 100));
  const remaining = Math.max(0, target - totalToday);

  return { totalToday, target, pct, remaining };
}

// ==========================================
// YOUTUBE (YouTube page)
// ==========================================
export async function getYoutubeVideos() {
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error('Error fetching youtube videos:', error);
  return data || [];
}

export async function saveYoutubeVideo(video) {
  return await supabase.from('youtube_videos').insert([video]);
}

export async function getYoutubeStreak() {
  const { data } = await supabase
    .from('youtube_videos')
    .select('posted_at')
    .not('posted_at', 'is', null)
    .order('posted_at', { ascending: false });

  if (!data || data.length === 0) return 0;
  
  // Calculate consecutive days... (simplified for now to just count total posts within recent timeframe)
  // For standard usage, a real streak algo considers gaps.
  return data.length; // placeholder for real streak logic
}

export async function getVideoDeadline() {
  const { data } = await supabase
    .from('video_timer')
    .select('last_posted_at')
    .eq('id', 1)
    .single();

  const lastPosted = data?.last_posted_at ? new Date(data.last_posted_at) : new Date();
  const deadline = new Date(lastPosted.getTime() + 48 * 60 * 60 * 1000);
  const now = new Date();
  
  const diff = deadline - now;
  if (diff <= 0) {
    return { hoursLeft: 0, minutesLeft: 0, isOverdue: true };
  }

  const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hoursLeft, minutesLeft, isOverdue: false };
}

export async function resetVideoTimer() {
  return await supabase
    .from('video_timer')
    .upsert([{ id: 1, last_posted_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
}

// ==========================================
// CLIENTS & PROJECTS (CRM)
// ==========================================
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) console.error('Error fetching clients:', error);
  return data || [];
}

export async function saveClient(client) {
  return await supabase.from('clients').insert([client]);
}

export async function getCounters() {
  const { data, error } = await supabase
    .from('counters')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (error && error.code !== 'PGRST116') console.error('Error fetching counters:', error);
  return data || { closed_deals: 0, proposals_sent: 0 };
}

export async function updateCounter(key, delta) {
  const { data: current } = await supabase
    .from('counters')
    .select(key === 'closedDeals' ? 'closed_deals' : 'proposals_sent')
    .eq('id', 1)
    .single();

  const currentVal = current ? (key === 'closedDeals' ? current.closed_deals : current.proposals_sent) : 0;
  const newVal = Math.max(0, currentVal + delta);

  const payload = key === 'closedDeals' ? { closed_deals: newVal } : { proposals_sent: newVal };
  payload.updated_at = new Date().toISOString();

  return await supabase.from('counters').upsert([{ id: 1, ...payload }]);
}

// ==========================================
// MEETINGS (Dashboard)
// ==========================================
export async function getMeetings() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(3);

  if (error) console.error('Error fetching meetings:', error);
  
  // Format local storage schema compatibility
  return (data || []).map(m => ({
    ...m,
    startTime: m.start_time,
    endTime: m.end_time,
    type: m.meeting_type,
    isLocation: m.is_location
  }));
}
