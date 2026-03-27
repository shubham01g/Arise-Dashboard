// YouTube OAuth2 + Data API v3 helper
// All server-side only — credentials never touch the browser

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
];

/**
 * Build the Google OAuth2 consent URL
 */
export function getAuthUrl() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const redirectUri = `${baseUrl}/api/youtube/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access + refresh tokens
 */
export async function exchangeCodeForTokens(code) {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri: `${baseUrl}/api/youtube/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Token exchange failed: ${res.status} — ${errBody}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
  };
}

/**
 * Refresh an expired access token using the stored refresh token
 */
export async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Token refresh failed: ${res.status} — ${errBody}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
  };
}

/**
 * Get a valid access token — refreshes automatically if expired
 */
export async function getValidAccessToken(supabase) {
  const { data: tokens } = await supabase
    .from('youtube_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (!tokens) return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at > now + 60) {
    return tokens.access_token;
  }

  // Token expired or expiring soon — refresh it
  const refreshed = await refreshAccessToken(tokens.refresh_token);

  await supabase.from('youtube_tokens').update({
    access_token: refreshed.access_token,
    expires_at: refreshed.expires_at,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);

  return refreshed.access_token;
}

/**
 * Fetch channel statistics from YouTube Data API v3
 */
export async function fetchChannelStats(accessToken) {
  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YouTube channels API failed: ${res.status} — ${errBody}`);
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channels found for this account');
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
export async function fetchRecentUploads(accessToken, maxResults = 5) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=${maxResults}&order=date`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

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