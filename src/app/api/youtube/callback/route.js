import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCodeForTokens, fetchChannelStats } from '@/lib/youtube';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/youtube?error=auth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/youtube?error=no_code', request.url));
  }

  try {
    // Exchange auth code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Create a server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch channel info to store alongside tokens
    const channelInfo = await fetchChannelStats(tokens.access_token);

    // Store tokens in Supabase
    await supabase.from('youtube_tokens').upsert([{
      id: 1,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      channel_id: channelInfo.channelId,
      channel_title: channelInfo.channelTitle,
      updated_at: new Date().toISOString(),
    }]);

    // Cache channel stats
    await supabase.from('youtube_channel_stats').upsert([{
      id: 1,
      subscriber_count: channelInfo.subscriberCount,
      view_count: channelInfo.viewCount,
      video_count: channelInfo.videoCount,
      last_fetched_at: new Date().toISOString(),
    }]);

    return NextResponse.redirect(new URL('/youtube?connected=true', request.url));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL(`/youtube?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
