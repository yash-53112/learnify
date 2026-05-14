const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;

export function extractPlaylistId(input: string): string | null {
  // Handle full URLs
  try {
    const url = new URL(input);
    const listParam = url.searchParams.get('list');
    if (listParam) return listParam;
  } catch {
    // Not a URL, might be a bare playlist ID
  }
  // Check if it looks like a playlist ID (starts with PL, FL, RD, etc.)
  if (/^(PL|FL|RD|OL|LL|WL)[a-zA-Z0-9_-]+$/.test(input.trim())) {
    return input.trim();
  }
  return null;
}

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    thumbnails: { medium?: { url: string }; high?: { url: string }; default?: { url: string } };
    resourceId: { videoId: string };
    position: number;
  };
}

interface YouTubeVideoItem {
  id: string;
  contentDetails: { duration: string };
}

export interface FetchedPlaylist {
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  videos: {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    position: number;
  }[];
}

// Convert ISO 8601 duration to human-readable format
export function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function fetchPlaylistData(playlistId: string): Promise<FetchedPlaylist> {
  if (!API_KEY) throw new Error('YouTube API key not configured');

  // 1. Fetch playlist metadata
  const metaRes = await fetch(
    `${YOUTUBE_API_BASE}/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`
  );
  if (!metaRes.ok) throw new Error('Failed to fetch playlist metadata');
  const metaData = await metaRes.json();

  if (!metaData.items || metaData.items.length === 0) {
    throw new Error('Playlist not found or is private');
  }

  const playlist = metaData.items[0];
  const snippet = playlist.snippet;
  const thumbnail =
    snippet.thumbnails?.maxres?.url ||
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url || '';

  // 2. Fetch all playlist items (paginated, max 50 per request)
  const allItems: YouTubePlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
    const itemsRes = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${pageParam}&key=${API_KEY}`
    );
    if (!itemsRes.ok) throw new Error('Failed to fetch playlist items');
    const itemsData = await itemsRes.json();
    allItems.push(...(itemsData.items || []));
    pageToken = itemsData.nextPageToken;
  } while (pageToken);

  // Filter out deleted/private videos
  const validItems = allItems.filter(
    (item) => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video'
  );

  // 3. Fetch video durations in batches of 50
  const videoIds = validItems.map((item) => item.snippet.resourceId.videoId);
  const durations: Record<string, string> = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const durRes = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${batch.join(',')}&key=${API_KEY}`
    );
    if (durRes.ok) {
      const durData = await durRes.json();
      (durData.items as YouTubeVideoItem[]).forEach((v) => {
        durations[v.id] = parseDuration(v.contentDetails.duration);
      });
    }
  }

  const videos = validItems.map((item, index) => {
    const vidId = item.snippet.resourceId.videoId;
    return {
      videoId: vidId,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url || '',
      duration: durations[vidId] || '',
      position: index,
    };
  });

  return {
    playlistId,
    title: snippet.title,
    description: snippet.description || '',
    thumbnail,
    channelTitle: snippet.channelTitle || '',
    videos,
  };
}
