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
  const [isTheaterMode, setIsTheaterMode] = useState(false)
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
  const [liveVideo, setLiveVideo] = useState<YouTubeVideo | null>(null)
  const [liveStatus, setLiveStatus] = useState<
    'idle' | 'loading' | 'offline' | 'error'
  >('idle')
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const videoId = searchParams.get('v')
  const urlMode = searchParams.get('mode')
  const resolvedMode: 'recorded' | 'live' =
    urlMode === 'live' ? 'live' : 'recorded'

  useEffect(() => {
    setMode(resolvedMode)
  }, [resolvedMode])

  const handleSelectVideo = (video: YouTubeVideo | null) => {
    setSelected(video)
    setAutoPlayId(video?.id ?? null)

    const next = new URLSearchParams(searchParams)
    if (video) {
      next.set('v', video.id)
    } else {
      next.delete('v')
    }
    setSearchParams(next, { replace: true })

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return
    setIsLoadingMore(true)
    try {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoadingMore(false)
    }
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

  const getFallbackLiveEmbedUrl = (channel: string) => {
    const url = new URL('https://www.youtube.com/embed/live_stream')
    url.searchParams.set('channel', channel)
    url.searchParams.set('autoplay', '1')
    url.searchParams.set('rel', '0')
    return url.toString()
  }

  const youtubeSetupMessage =
    'Missing YouTube API configuration for this deployment. Add VITE_YOUTUBE_API_KEY and VITE_YOUTUBE_CHANNEL_ID in Netlify environment variables, then redeploy.'

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
      setStatus(debouncedQuery ? 'searching' : 'loading')
      setError('')
      try {
        const data = debouncedQuery
          ? await searchChannelVideos({ query: debouncedQuery, useCache: true })
          : await getLatestVideos({ useCache: true })

        if (!active) return

        setVideos(data.videos)
        setNextPageToken(data.nextPageToken ?? null)
        setCurrentQuery(debouncedQuery)
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setStatus('error')
        return
      }
      if (active) {
        setStatus('idle')
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
      return
    }
    let active = true

    const loadLive = async () => {
      setLiveStatus('loading')
      try {
        const live = await getActiveLiveVideo()
        if (!active) return

        if (live) {
          setLiveVideo(live)
          setLiveStatus('idle')
        } else {
          setLiveStatus('offline')
        }
      } catch (err) {
        if (!active) return
        console.error('Error loading live stream:', err)
        setLiveStatus('error')
      }
    }
    loadLive()
    return () => {
      active = false
    }
  }, [channelId, mode])

  useEffect(() => {
    if (!videoId) {
      setSelected(null)
      return
    }
    if (videos.length === 0) return
    const match = videos.find((video) => video.id === videoId)
    if (!match) return
    setSelected(match)
    setAutoPlayId(match.id)
  }, [videoId, videos])

  const recentVideos = videos.slice(0, 6)
  const pastVideos = videos.slice(6)

  return (
    <div className={`watch-page-wrapper${isTheaterMode ? ' theater-mode' : ''}`}>
      <section className={`watch-container ${selected ? 'has-selected' : 'grid-mode'}`}>
        <div className="watch-main-col">
          {mode === 'recorded' && (status === 'loading' || status === 'searching') && !selected ? (
            <div className="watch-state">
              {status === 'searching' ? 'Searching...' : 'Loading videos...'}
            </div>
          ) : null}

          {mode === 'recorded' && status === 'error' && !selected ? (
            <div className="watch-state">
              {error === 'MISSING_YOUTUBE_CONFIG'
                ? youtubeSetupMessage
                : error.startsWith('YouTube API error')
                ? `${error} Check Google Cloud API restrictions/quota for this key.`
                : 'Sorry, we could not load videos right now.'}
            </div>
          ) : null}

          {mode === 'live' && (
            <div className="watch-live">
              <div className="watch-live-card">
                <div className="watch-live-meta">
                  <h2>Live Stream</h2>
                  <span>Sundays at 11:00 AM</span>
                </div>
                <span className="watch-live-pill">Live</span>
              </div>

              {!channelId && (
                <div className="watch-state">
                  {youtubeSetupMessage}
                </div>
              )}

              {liveStatus === 'loading' ? (
                <div className="watch-state watch-live-state">Checking live stream status...</div>
              ) : null}

              {channelId && (
                <div className="watch-player-area">
                  <div className="watch-video-container">
                    <iframe
                      title={liveVideo?.title ?? 'Live stream'}
                      src={
                        liveVideo
                          ? getLiveEmbedUrl(liveVideo)
                          : getFallbackLiveEmbedUrl(channelId)
                      }
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="watch-player-meta">
                    <h2>{liveVideo?.title ?? 'Team Church Glasgow Live'}</h2>
                    <div className="watch-meta-details">
                       <span>Team Church Glasgow</span>
                       {liveVideo && (
                         <>
                           <span className="dot">·</span>
                           <a href={liveVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="watch-youtube-link">
                             Watch on YouTube
                           </a>
                         </>
                       )}
                    </div>
                    <p>Sundays at 11:00 AM</p>
                  </div>
                </div>
              )}
              {liveStatus === 'offline' && (
                <div className="watch-state watch-live-state">
                  <p>We are not live right now. Join us Sundays at 11:00 AM.</p>
                  {channelId && (
                    <p style={{ marginTop: '12px' }}>
                      <a href={`https://www.youtube.com/channel/${channelId}/live`} target="_blank" rel="noopener noreferrer" className="watch-youtube-link">
                        Visit our YouTube Live page
                      </a>
                    </p>
                  )}
                </div>
              )}
              {liveStatus === 'error' && (
                 <div className="watch-state watch-live-state">
                   Unable to load live stream status. Please try again later.
                 </div>
              )}
            </div>
          )}

          {mode === 'recorded' && selected && (
            <div className="watch-player-area">
              <button className="watch-back-btn" onClick={() => handleSelectVideo(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to all messages
              </button>
              <div className="watch-video-container">
                <iframe
                  title={selected.title}
                  src={getEmbedUrl(selected)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  className="theater-toggle"
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  title="Toggle Theater Mode"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h14v14zm-2-2V7H7v10h10z" />
                  </svg>
                </button>
              </div>
              <div className="watch-player-meta">
                <h2>{selected.title}</h2>
                <div className="watch-meta-details">
                   <span>Team Church Glasgow</span>
                   <span className="dot">·</span>
                   <span>{new Date(selected.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                   <span className="dot">·</span>
                   <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer" className="watch-youtube-link">
                     Watch on YouTube
                   </a>
                </div>
                <div className="watch-description">
                  <p>{selected.description}</p>
                </div>
              </div>
            </div>
          )}

          {mode === 'recorded' && !selected && status === 'idle' && (
             <div className="watch-browse-feed">
                {recentVideos.length > 0 && (
                  <div className="watch-feed-section">
                    <h2 className="watch-section-title">Most Recent</h2>
                    <div className="watch-grid">
                      {recentVideos.map(video => (
                        <button key={video.id} className="watch-card" onClick={() => handleSelectVideo(video)}>
                          <div className="watch-card-thumb">
                            <img src={video.thumbnailUrl} alt="" />
                          </div>
                          <div className="watch-card-info">
                            <h3>{video.title}</h3>
                            <p>Team Church Glasgow</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {pastVideos.length > 0 && (
                  <div className="watch-feed-section">
                    <h2 className="watch-section-title">Past Messages</h2>
                    <div className="watch-grid">
                      {pastVideos.map(video => (
                        <button key={video.id} className="watch-card" onClick={() => handleSelectVideo(video)}>
                          <div className="watch-card-thumb">
                            <img src={video.thumbnailUrl} alt="" />
                          </div>
                          <div className="watch-card-info">
                            <h3>{video.title}</h3>
                            <p>Team Church Glasgow</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length === 0 && !debouncedQuery && (
                  <div className="watch-state">No videos found.</div>
                )}

                {videos.length === 0 && debouncedQuery && (
                  <div className="watch-state">No videos found matching "{debouncedQuery}".</div>
                )}
             </div>
          )}
        </div>

        {selected && (
          <div className="watch-sidebar">
            <h3 className="sidebar-title">Up Next</h3>
            <div className="sidebar-list">
              {videos.filter(v => v.id !== selected.id).map(video => (
                <button key={video.id} className="sidebar-item" onClick={() => handleSelectVideo(video)}>
                  <div className="sidebar-item-thumb">
                    <img src={video.thumbnailUrl} alt="" />
                  </div>
                  <div className="sidebar-item-info">
                    <h4>{video.title}</h4>
                    <p>Team Church Glasgow</p>
                  </div>
                </button>
              ))}
            </div>
            {nextPageToken && (
               <button className="sidebar-load-more" onClick={handleLoadMore} disabled={isLoadingMore}>
                 {isLoadingMore ? 'Loading...' : 'Show more'}
               </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
