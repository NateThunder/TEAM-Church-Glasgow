import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLatestVideos, type YouTubeVideo } from '../services/youtube'

export default function WatchPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [selected, setSelected] = useState<YouTubeVideo | null>(null)
  const [autoPlayId, setAutoPlayId] = useState<string | null>(null)
  const [mode, setMode] = useState<'recorded' | 'live'>('recorded')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const urlMode = searchParams.get('mode')
  const resolvedMode: 'recorded' | 'live' =
    urlMode === 'live' ? 'live' : 'recorded'

  useEffect(() => {
    setMode(resolvedMode)
  }, [resolvedMode])

  const handleSelectVideo = (video: YouTubeVideo) => {
    setSelected(video)
    setAutoPlayId(video.id)
    if (typeof window !== 'undefined' && window.innerWidth < 769) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const data = await getLatestVideos({
        pageToken: nextPageToken,
        useCache: false,
      })
      setVideos((prev) => [...prev, ...data.videos])
      setNextPageToken(data.nextPageToken ?? null)
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

  useEffect(() => {
    let active = true
    const load = async () => {
      setStatus('loading')
      try {
        const data = await getLatestVideos()
        if (!active) return
        setVideos(data.videos)
        setSelected(data.videos[0] || null)
        setNextPageToken(data.nextPageToken ?? null)
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
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return videos
    return videos.filter((video) => video.title.toLowerCase().includes(q))
  }, [videos, query])

  return (
    <section className="page watch-page">
      {mode === 'recorded' && status === 'loading' ? (
        <div className="watch-state">Loading videos...</div>
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
          {channelId ? (
            <div className="watch-player">
              <iframe
                title="Live stream"
                src={`https://www.youtube.com/embed/live_stream?channel=${channelId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="watch-state">
              Missing live stream configuration. Add VITE_YOUTUBE_CHANNEL_ID to your .env file.
            </div>
          )}
        </div>
      ) : null}

      {mode === 'recorded' && selected ? (
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
      ) : null}

      {mode === 'recorded' && status === 'idle' && filtered.length === 0 ? (
        <div className="watch-state">No videos match that search.</div>
      ) : null}

      {mode === 'recorded' ? (
        <div className="watch-grid">
          {filtered.map((video) => (
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
                {isLoadingMore ? 'Loading...' : 'More Videos'}
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
  )
}
