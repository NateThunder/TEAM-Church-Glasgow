import { useEffect, useMemo, useState } from 'react'
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
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

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
        <input
          className="watch-search"
          type="search"
          placeholder="Search videos"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {status === 'loading' ? (
        <div className="watch-state">Loading videos...</div>
      ) : null}

      {status === 'error' ? (
        <div className="watch-state">
          {error === 'MISSING_YOUTUBE_CONFIG'
            ? 'Missing YouTube API configuration. Add VITE_YOUTUBE_API_KEY and VITE_YOUTUBE_CHANNEL_ID to your .env file.'
            : 'Sorry, we could not load videos right now.'}
        </div>
      ) : null}

      {selected ? (
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

      {status === 'idle' && filtered.length === 0 ? (
        <div className="watch-state">No videos match that search.</div>
      ) : null}

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
    </section>
  )
}
