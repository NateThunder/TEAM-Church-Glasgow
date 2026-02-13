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
  nextPageToken?: string
}

const CACHE_KEY = 'teamchurch_youtube_cache_v2'
const CACHE_TTL_MS = 10 * 60 * 1000

let memoryCache: CachePayload | null = null
const searchMemoryCache = new Map<string, CachePayload>()

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
    let reason = ''
    let message = response.statusText || 'Request failed'
    try {
      const payload = (await response.json()) as {
        error?: {
          message?: string
          errors?: Array<{ reason?: string; message?: string }>
        }
      }
      reason = payload.error?.errors?.[0]?.reason || ''
      message =
        payload.error?.errors?.[0]?.message ||
        payload.error?.message ||
        message
    } catch {
      // Keep a generic status-based message when body parsing fails.
    }
    throw new Error(
      `YouTube API error ${response.status}${
        reason ? ` (${reason})` : ''
      }: ${message}`
    )
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

const saveCache = (data: YouTubeVideo[], nextPageToken?: string) => {
  const payload: CachePayload = {
    timestamp: Date.now(),
    data,
    nextPageToken,
  }
  memoryCache = payload
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

const loadSearchCache = (key: string): CachePayload | null => {
  const cached = searchMemoryCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    searchMemoryCache.delete(key)
    return null
  }
  return cached
}

const saveSearchCache = (key: string, data: YouTubeVideo[], nextPageToken?: string) => {
  searchMemoryCache.set(key, {
    timestamp: Date.now(),
    data,
    nextPageToken,
  })
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
  nextPageToken?: string
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

interface SearchResponse {
  nextPageToken?: string
  items?: Array<{
    id?: { videoId?: string }
    snippet?: {
      title?: string
      description?: string
      publishedAt?: string
      thumbnails?: {
        medium?: { url?: string }
        high?: { url?: string }
        default?: { url?: string }
      }
    }
  }>
}

export const getActiveLiveVideo = async (): Promise<YouTubeVideo | null> => {
  const apiKey = getEnv('VITE_YOUTUBE_API_KEY')
  const channelId = getEnv('VITE_YOUTUBE_CHANNEL_ID')

  if (!apiKey || !channelId) {
    throw new Error('MISSING_YOUTUBE_CONFIG')
  }

  const response = await fetchJson<SearchResponse>('search', {
    part: 'snippet',
    channelId,
    eventType: 'live',
    type: 'video',
    maxResults: '1',
    order: 'date',
    key: apiKey,
  })

  const liveItem = response.items?.find((item) => item.id?.videoId)
  const videoId = liveItem?.id?.videoId
  if (!liveItem || !videoId) return null

  const snippet = liveItem.snippet
  const thumbnail =
    snippet?.thumbnails?.high?.url ||
    snippet?.thumbnails?.medium?.url ||
    snippet?.thumbnails?.default?.url ||
    ''

  return {
    id: videoId,
    title: snippet?.title || 'Live stream',
    description: snippet?.description || '',
    publishedAt: snippet?.publishedAt || '',
    thumbnailUrl: thumbnail,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }
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

const getPlaylistItems = async (
  apiKey: string,
  playlistId: string,
  pageToken?: string,
  maxResults = 21
) => {
  const response = await fetchJson<PlaylistItemsResponse>('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: String(maxResults),
    key: apiKey,
    ...(pageToken ? { pageToken } : {}),
  })

  const items =
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

  return { items, nextPageToken: response.nextPageToken }
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

export const getLatestVideos = async (options?: {
  pageToken?: string
  maxResults?: number
  useCache?: boolean
}): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> => {
  const { pageToken, maxResults = 21, useCache = true } = options ?? {}
  const cached = !pageToken && useCache ? loadCache() : null
  if (cached && cached.nextPageToken !== undefined) {
    return { videos: cached.data, nextPageToken: cached.nextPageToken }
  }

  const apiKey = getEnv('VITE_YOUTUBE_API_KEY')
  const channelId = getEnv('VITE_YOUTUBE_CHANNEL_ID')

  if (!apiKey || !channelId) {
    throw new Error('MISSING_YOUTUBE_CONFIG')
  }

  // NOTE: Restrict your API key in Google Cloud Console (HTTP referrers for web).
  const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelId)
  const playlistResult = await getPlaylistItems(
    apiKey,
    uploadsPlaylistId,
    pageToken,
    maxResults
  )
  const detailsMap = await getVideoDetails(
    apiKey,
    playlistResult.items.map((item) => item.id)
  )

  const videos: YouTubeVideo[] = playlistResult.items.map((item) => {
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

  if (!pageToken && useCache) {
    saveCache(videos, playlistResult.nextPageToken)
  }
  return { videos, nextPageToken: playlistResult.nextPageToken }
}

export const searchChannelVideos = async (options: {
  query: string
  pageToken?: string
  maxResults?: number
  useCache?: boolean
}): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> => {
  const {
    query,
    pageToken,
    maxResults = 21,
    useCache = true,
  } = options

  const normalizedQuery = query.trim()
  const cacheKey = `search:${normalizedQuery}:${pageToken ?? 'first'}:${maxResults}`
  const cached = useCache ? loadSearchCache(cacheKey) : null
  if (cached && cached.nextPageToken !== undefined) {
    return { videos: cached.data, nextPageToken: cached.nextPageToken }
  }

  const apiKey = getEnv('VITE_YOUTUBE_API_KEY')
  const channelId = getEnv('VITE_YOUTUBE_CHANNEL_ID')

  if (!apiKey || !channelId) {
    throw new Error('MISSING_YOUTUBE_CONFIG')
  }

  const response = await fetchJson<SearchResponse>('search', {
    part: 'snippet',
    channelId,
    q: normalizedQuery,
    type: 'video',
    maxResults: String(maxResults),
    order: 'relevance',
    key: apiKey,
    ...(pageToken ? { pageToken } : {}),
  })

  const items =
    response.items
      ?.map((item) => {
        const videoId = item.id?.videoId
        if (!videoId) return null
        const snippet = item.snippet
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

  const detailsMap = await getVideoDetails(
    apiKey,
    items.map((item) => item.id)
  )

  const videos: YouTubeVideo[] = items.map((item) => {
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

  if (useCache) {
    saveSearchCache(cacheKey, videos, response.nextPageToken)
  }

  return { videos, nextPageToken: response.nextPageToken }
}
