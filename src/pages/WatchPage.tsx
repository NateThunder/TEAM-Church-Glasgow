import '../styles/watch.css'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getActiveLiveVideo,
  getLatestVideos,
  searchChannelVideos,
  type YouTubeVideo,
} from '../services/youtube'

export default function WatchPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [selected, setSelected] = useState<YouTubeVideo | null>(null)
  const [autoPlayId, setAutoPlayId] = useState<string | null>(null)
  const [mode, setMode] = useState<'recorded' | 'live'>('recorded')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'searching' | 'error'
  >('idle')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [latestCache, setLatestCache] = useState<{
    videos: YouTubeVideo[]
    nextPageToken: string | null
  } | null>(null)
  const [liveVideo, setLiveVideo] = useState<YouTubeVideo | null>(null)
  const [liveStatus, setLiveStatus] = useState<
    'idle' | 'loading' | 'offline' | 'error'
  >('idle')
  const [liveError, setLiveError] = useState('')
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const videoId = searchParams.get('v')
  const urlMode = searchParams.get('mode')
  const resolvedMode: 'recorded' | 'live' =
    urlMode === 'live' ? 'live' : 'recorded'

  useEffect(() => {
    setMode(resolvedMode)
  }, [resolvedMode])

  const handleSelectVideo = (video: YouTubeVideo) => {
    setSelected(video)
    setAutoPlayId(video.id)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      // Pagination switches between latest and search based on current query.
      const data = currentQuery
        ? await searchChannelVideos({
            query: currentQuery,
            pageToken: nextPageToken,
            useCache: false,
          })
        : await getLatestVideos({
            pageToken: nextPageToken,
            useCache: false,
          })
      setVideos((prev) => [...prev, ...data.videos])
      setNextPageToken(data.nextPageToken ?? null)
      if (!currentQuery) {
        setLatestCache((prev) => ({
          videos: [...(prev?.videos ?? []), ...data.videos],
          nextPageToken: data.nextPageToken ?? null,
        }))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleBackToTop = () => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getEmbedUrl = (video: YouTubeVideo) => {
    if (!autoPlayId || autoPlayId !== video.id) return video.embedUrl
    const url = new URL(video.embedUrl)
    url.searchParams.set('autoplay', '1')

    return url.toString()
  }

  const getLiveEmbedUrl = (video: YouTubeVideo) => {
    const url = new URL(video.embedUrl)
    url.searchParams.set('autoplay', '1')
    url.searchParams.set('rel', '0')

    return url.toString()
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (mode !== 'recorded') return
    let active = true
    const load = async () => {
      const isSearch = debouncedQuery.length > 0
      // Query-aware switching between search and latest feeds.
      setStatus(isSearch ? 'searching' : 'loading')
      setError('')
      setIsLoadingMore(false)
      setVideos([])
      setSelected(null)
      setNextPageToken(null)
      setCurrentQuery(debouncedQuery)

      if (!isSearch && latestCache) {
        if (!active) return
        setVideos(latestCache.videos)
        setNextPageToken(latestCache.nextPageToken)
        const match = videoId
          ? latestCache.videos.find((video) => video.id === videoId)
          : null
        setSelected(match ?? latestCache.videos[0] ?? null)
        setAutoPlayId(match ? match.id : null)
        setStatus('idle')
        return
      }

      try {
        const data = isSearch
          ? await searchChannelVideos({
              query: debouncedQuery,
              maxResults: 21,
              useCache: false,
            })
          : await getLatestVideos({ maxResults: 21, useCache: true })
        if (!active) return
        setVideos(data.videos)
        setNextPageToken(data.nextPageToken ?? null)
        if (!isSearch) {
          setLatestCache({
            videos: data.videos,
            nextPageToken: data.nextPageToken ?? null,
          })
        }
        const match = videoId
          ? data.videos.find((video) => video.id === videoId)
          : null
        setSelected(match ?? data.videos[0] ?? null)
        setAutoPlayId(match ? match.id : null)
        setStatus('idle')
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setStatus('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [debouncedQuery, mode])

  useEffect(() => {
    if (mode !== 'live') {
      setLiveVideo(null)
      setLiveStatus('idle')
      setLiveError('')
      return
    }
    if (!channelId) {
      setLiveVideo(null)
      setLiveStatus('error')
      setLiveError('MISSING_YOUTUBE_CONFIG')
      return
    }

    let active = true

    const loadLive = async () => {
      try {
        const data = await getActiveLiveVideo()
        if (!active) return
        setLiveVideo(data)
        setLiveStatus(data ? 'idle' : 'offline')
        setLiveError('')
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        setLiveVideo(null)
        setLiveStatus('error')
        setLiveError(message)
      }
    }

    setLiveStatus('loading')
    void loadLive()

    const interval = window.setInterval(() => {
      void loadLive()
    }, 60_000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [channelId, mode])

  useEffect(() => {
    if (!videoId || videos.length === 0) return
    const match = videos.find((video) => video.id === videoId)
    if (!match) return
    setSelected(match)
    setAutoPlayId(match.id)
  }, [videoId, videos])

  return (
    <div className="watch-page-wrapper">
      <section className="page watch-page">
        {mode === 'recorded' && status === 'loading' ? (
          <div className="watch-state">Loading videos...</div>
        ) : null}

        {mode === 'recorded' && status === 'searching' ? (
          <div className="watch-state">Searching...</div>
        ) : null}

        {mode === 'recorded' && status === 'error' ? (
          <div className="watch-state">
            {error === 'MISSING_YOUTUBE_CONFIG'
              ? 'Missing YouTube API configuration. Add VITE_YOUTUBE_API_KEY and VITE_YOUTUBE_CHANNEL_ID to your .env file.'
              : 'Sorry, we could not load videos right now.'}
          </div>
        ) : null}

        {mode === 'live' ? (
          <div className="watch-live">
            <div className="watch-live-card">
              <div className="watch-live-meta">
                <h2>Live Stream</h2>
                <span>Sundays at 11:00 AM</span>
              </div>
              <span className="watch-live-pill">Live</span>
            </div>
            {liveStatus === 'loading' ? (
              <div className="watch-state watch-live-state">Checking live stream status...</div>
            ) : null}
            {liveVideo ? (
              <div className="watch-player">
                <iframe
                  title={liveVideo.title}
                  src={getLiveEmbedUrl(liveVideo)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="watch-player-meta">
                  <h2>{liveVideo.title}</h2>
                </div>
              </div>
            ) : null}
            {liveStatus === 'offline' ? (
              <div className="watch-state watch-live-state">
                We are not live right now. Join us Sundays at 11:00 AM.
              </div>
            ) : null}
            {liveStatus === 'error' ? (
              <div className="watch-state watch-live-state">
                {liveError === 'MISSING_YOUTUBE_CONFIG'
                  ? 'Missing YouTube API configuration. Add VITE_YOUTUBE_API_KEY and VITE_YOUTUBE_CHANNEL_ID to your .env file.'
                  : 'We could not load the live stream right now.'}
                {channelId ? (
                  <>
                    {' '}
                    <a
                      href={`https://www.youtube.com/channel/${channelId}/live`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on YouTube
                    </a>
                    .
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {mode === 'recorded' && selected ? (
        <section className="tone-section">
          <div className="tone-inner">
            <div className="watch-player">
              <iframe
                title={selected.title}
                src={getEmbedUrl(selected)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="watch-player-meta">
                <h2>{selected.title}</h2>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="page watch-page">
        {mode === 'recorded' &&
        status === 'idle' &&
        currentQuery &&
        videos.length === 0 ? (
          <div className="watch-state">
            No results for '{currentQuery}'. Try clearing the search.
          </div>
        ) : null}

        {mode === 'recorded' ? (
          <div className="watch-grid">
            {videos.map((video) => (
              <button
                key={video.id}
                className="watch-card"
                type="button"
                onClick={() => handleSelectVideo(video)}
              >
                <img src={video.thumbnailUrl} alt={video.title} />
                <div className="watch-card-body">
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                </div>
              </button>
            ))}
            {nextPageToken ? (
              <div className="watch-load-more">
                <button
                  type="button"
                  className="watch-load-more-button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Show more'}
                </button>
                <button
                  type="button"
                  className="watch-load-more-button watch-back-top-button"
                  onClick={handleBackToTop}
                >
                  Back to Top
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
