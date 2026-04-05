// YouTube Data API v3 helper (OAuth 2.0 version)
// All server-side only — credentials never touch the browser

export function getAuthUrl() {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube/callback`,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/youtube.readonly'
  });
  return `${rootUrl}?${options.toString()}`;
}

export async function exchangeCodeForTokens(code) {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube/callback`,
    grant_type: 'authorization_code',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch tokens: ${error}`);
  }

  return await res.json();
}

/**
 * Fetch channel statistics from YouTube Data API v3
 */
export async function fetchChannelStats(accessToken) {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YouTube channels API failed: ${res.status} — ${errBody}`);
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channel found for this user');
  }

  const channel = data.items[0];
  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    viewCount: parseInt(channel.statistics.viewCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0,
  };
}

/**
 * Fetch recent uploads from YouTube Data API v3
 */
export async function fetchRecentUploads(accessToken, channelId, maxResults = 5) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=${maxResults}&order=date`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YouTube search API failed: ${res.status} — ${errBody}`);
  }

  const data = await res.json();
  return (data.items || []).map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    description: item.snippet.description,
  }));
}
