// YouTube Data API v3 helper (API Key only)
// All server-side only — credentials never touch the browser

/**
 * Fetch channel statistics from YouTube Data API v3
 */
export async function fetchChannelStats(apiKey, channelId) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YouTube channels API failed: ${res.status} — ${errBody}`);
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channel found for this ID');
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
export async function fetchRecentUploads(apiKey, channelId, maxResults = 5) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=${maxResults}&order=date&key=${apiKey}`;
  const res = await fetch(url);

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
