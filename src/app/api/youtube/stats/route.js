import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchChannelStats, fetchRecentUploads } from '@/lib/youtube';

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return NextResponse.json({ 
        connected: false, 
        error: 'YouTube API Key or Channel ID missing in environment variables' 
      }, { status: 200 });
    }

    // Fetch live stats from YouTube using API Key
    const stats = await fetchChannelStats(apiKey, channelId);
    const recentVideos = await fetchRecentUploads(apiKey, channelId, 5);

    // Cache updated stats in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    await supabase.from('youtube_channel_stats').upsert([{
      id: 1,
      subscriber_count: stats.subscriberCount,
      view_count: stats.viewCount,
      video_count: stats.videoCount,
      last_fetched_at: new Date().toISOString(),
    }]);

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
