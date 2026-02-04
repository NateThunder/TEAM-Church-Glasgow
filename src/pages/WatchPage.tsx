import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLatestVideos, type YouTubeVideo } from '../services/youtube'

const formatDate = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function WatchPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [selected, setSelected] = useState<YouTubeVideo | null>(null)
  const [mode, setMode] = useState<'recorded' | 'live'>('recorded')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const updateQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setStatus('loading')
      try {
        const data = await getLatestVideos()
        if (!active) return
        setVideos(data)
        setSelected(data[0] || null)
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
      <div className="watch-top">
        {mode === 'recorded' ? (
          <input
            className="watch-search"
            type="search"
            placeholder="Search videos"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
        ) : null}
        <div className="watch-toggle" role="tablist" aria-label="Video type">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'recorded'}
            className={`watch-toggle-button${mode === 'recorded' ? ' is-active' : ''}`}
            onClick={() => setMode('recorded')}
          >
            Messages
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'live'}
            className={`watch-toggle-button${mode === 'live' ? ' is-active' : ''}`}
            onClick={() => setMode('live')}
          >
            Live
          </button>
        </div>
      </div>

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
            src={selected.embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="watch-player-meta">
            <h2>{selected.title}</h2>
            <span>{formatDate(selected.publishedAt)}</span>
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
              onClick={() => setSelected(video)}
            >
              <img src={video.thumbnailUrl} alt={video.title} />
              <div className="watch-card-body">
                <h3>{video.title}</h3>
                <span>{formatDate(video.publishedAt)}</span>
                <p>{video.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
