import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchChannelStats, fetchRecentUploads } from '@/lib/youtube';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch the token from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('youtube_tokens')
      .select('*')
      .eq('id', 1)
      .single();

    if (tokenError || !tokenData || !tokenData.access_token) {
      return NextResponse.json({ 
        connected: false, 
        error: 'YouTube not connected or tokens missing.' 
      }, { status: 200 });
    }

    const { access_token, refresh_token, channel_id } = tokenData;

    // Fetch live stats from YouTube using accessToken
    let stats;
    let recentVideos = [];
    try {
      stats = await fetchChannelStats(access_token);
      recentVideos = await fetchRecentUploads(access_token, stats.channelId, 5);
      
      // Update cache in DB
      await supabase.from('youtube_channel_stats').upsert([{
        id: 1,
        subscriber_count: stats.subscriberCount,
        view_count: stats.viewCount,
        video_count: stats.videoCount,
        last_fetched_at: new Date().toISOString(),
      }]);
    } catch (apiErr) {
      console.error('YouTube API Fetch error (Token might be expired?):', apiErr);
      // Fallback to cached stats if API call fails
      const { data: cachedStats } = await supabase
        .from('youtube_channel_stats')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (cachedStats) {
        return NextResponse.json({
          connected: true,
          channel: {
            id: tokenData.channel_id,
            title: tokenData.channel_title,
          },
          stats: {
            subscriberCount: cachedStats.subscriber_count,
            viewCount: cachedStats.view_count,
            videoCount: cachedStats.video_count,
          },
          recentVideos: [],
          cached: true
        });
      }
      throw apiErr;
    }

    return NextResponse.json({
      connected: true,
      channel: {
        id: stats.channelId,
        title: stats.channelTitle,
      },
      stats: {
        subscriberCount: stats.subscriberCount,
        viewCount: stats.viewCount,
        videoCount: stats.videoCount,
      },
      recentVideos,
    });
  } catch (err) {
    console.error('YouTube stats error:', err);
    return NextResponse.json(
      { connected: false, error: err.message },
      { status: 500 }
    );
  }
}
