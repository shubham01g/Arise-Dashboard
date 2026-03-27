import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getValidAccessToken, fetchChannelStats, fetchRecentUploads } from '@/lib/youtube';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Check if we have stored tokens
    const { data: tokens } = await supabase
      .from('youtube_tokens')
      .select('*')
      .eq('id', 1)
      .single();

    if (!tokens) {
      return NextResponse.json({ connected: false, error: 'Not connected to YouTube' }, { status: 200 });
    }

    // Get a valid (possibly refreshed) access token
    const accessToken = await getValidAccessToken(supabase);

    if (!accessToken) {
      return NextResponse.json({ connected: false, error: 'Token expired' }, { status: 200 });
    }

    // Fetch live stats from YouTube
    const stats = await fetchChannelStats(accessToken);
    const recentVideos = await fetchRecentUploads(accessToken, 5);

    // Cache updated stats in Supabase
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
