export interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  embedUrl: string
  videoUrl: string
  duration?: string
  viewCount?: string
}

interface CachePayload {
  timestamp: number
  data: YouTubeVideo[]
}

const CACHE_KEY = 'teamchurch_youtube_cache_v1'
const CACHE_TTL_MS = 10 * 60 * 1000

let memoryCache: CachePayload | null = null

const getEnv = (key: string) => {
  return import.meta.env[key] as string | undefined
}

const API_BASE = 'https://www.googleapis.com/youtube/v3'

const fetchJson = async <T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> => {
  const url = new URL(`${API_BASE}/${endpoint}`)
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  )
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }
  return (await response.json()) as T
}

const loadCache = (): CachePayload | null => {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache
  }

  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachePayload
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null
    memoryCache = parsed
    return parsed
  } catch {
    return null
  }
}

const saveCache = (data: YouTubeVideo[]) => {
  const payload: CachePayload = {
    timestamp: Date.now(),
    data,
  }
  memoryCache = payload
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

interface ChannelResponse {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string
      }
    }
  }>
}

interface PlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      title?: string
      description?: string
      publishedAt?: string
      resourceId?: {
        videoId?: string
      }
      thumbnails?: {
        medium?: { url?: string }
        high?: { url?: string }
        default?: { url?: string }
      }
    }
  }>
}

interface VideosResponse {
  items?: Array<{
    id?: string
    contentDetails?: {
      duration?: string
    }
    statistics?: {
      viewCount?: string
    }
  }>
}

const getUploadsPlaylistId = async (apiKey: string, channelId: string) => {
  const response = await fetchJson<ChannelResponse>('channels', {
    part: 'contentDetails',
    id: channelId,
    key: apiKey,
  })

  const uploadsId =
    response.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsId) {
    throw new Error('YouTube channel uploads playlist not found.')
  }

  return uploadsId
}

const getPlaylistItems = async (apiKey: string, playlistId: string) => {
  const response = await fetchJson<PlaylistItemsResponse>('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: '20',
    key: apiKey,
  })

  return (
    response.items
      ?.map((item) => {
        const snippet = item.snippet
        const videoId = snippet?.resourceId?.videoId
        if (!videoId) return null
        const thumbnail =
          snippet?.thumbnails?.high?.url ||
          snippet?.thumbnails?.medium?.url ||
          snippet?.thumbnails?.default?.url ||
          ''

        return {
          id: videoId,
          title: snippet?.title || 'Untitled video',
          description: snippet?.description || '',
          publishedAt: snippet?.publishedAt || '',
          thumbnailUrl: thumbnail,
        }
      })
      .filter(Boolean) as Array<{
      id: string
      title: string
      description: string
      publishedAt: string
      thumbnailUrl: string
    }> || []
  )
}

const getVideoDetails = async (apiKey: string, ids: string[]) => {
  if (!ids.length) return new Map<string, { duration?: string; viewCount?: string }>()
  const response = await fetchJson<VideosResponse>('videos', {
    part: 'contentDetails,statistics',
    id: ids.join(','),
    key: apiKey,
  })

  const map = new Map<string, { duration?: string; viewCount?: string }>()
  response.items?.forEach((item) => {
    if (!item.id) return
    map.set(item.id, {
      duration: item.contentDetails?.duration,
      viewCount: item.statistics?.viewCount,
    })
  })
  return map
}

export const getLatestVideos = async (): Promise<YouTubeVideo[]> => {
  const cached = loadCache()
  if (cached) return cached.data

  const apiKey = getEnv('VITE_YOUTUBE_API_KEY')
  const channelId = getEnv('VITE_YOUTUBE_CHANNEL_ID')

  if (!apiKey || !channelId) {
    throw new Error('MISSING_YOUTUBE_CONFIG')
  }

  // NOTE: Restrict your API key in Google Cloud Console (HTTP referrers for web).
  const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelId)
  const playlistItems = await getPlaylistItems(apiKey, uploadsPlaylistId)
  const detailsMap = await getVideoDetails(
    apiKey,
    playlistItems.map((item) => item.id)
  )

  const videos: YouTubeVideo[] = playlistItems.map((item) => {
    const details = detailsMap.get(item.id)
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      publishedAt: item.publishedAt,
      thumbnailUrl: item.thumbnailUrl,
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
      videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
      duration: details?.duration,
      viewCount: details?.viewCount,
    }
  })

  saveCache(videos)
  return videos
}
