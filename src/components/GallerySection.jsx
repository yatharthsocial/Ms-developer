import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import galleryVideo1 from '../assets/gallery01.mp4'
import galleryVideo2 from '../assets/gallery02.mp4'
import galleryVideo3 from '../assets/gallery03.mp4'
import galleryVideo4 from '../assets/gallery04.mp4'
import './GallerySection.css'

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

// How long, in vh, the heading stays pinned dead-center while it slides in
// from the right. It's a real pin (position: sticky), not just a
// scroll-tied nudge on normal flow — that's what keeps it perfectly still
// vertically during the slide instead of drifting upward at the same time.
// Once this dwell ends it unpins and starts moving up normally with the
// page, which is also exactly when the grid below — positioned right
// after this pinned stage — first reaches the bottom of the viewport, so
// the grid's own rise-up (still handled by its own scroll-linked reveal)
// picks up right as the heading starts leaving.
const INTRO_DWELL_VH = 68

// Four equal tall columns rather than a hero + tall mix — with four
// portrait clips, a clean filmstrip of four reads better than forcing an
// odd item into a leftover corner, and tall columns crop portrait video
// more gracefully than a wide/square one would.
const gallery = [
  { id: '01', name: 'Prime Location', tag: 'Video', video: galleryVideo1, size: 'gallery-item--tall' },
  { id: '02', name: 'Villa by Night', tag: 'Video', video: galleryVideo2, size: 'gallery-item--tall' },
  { id: '03', name: 'Rooftop Pool Walkthrough', tag: 'Video', video: galleryVideo3, size: 'gallery-item--tall' },
  { id: '04', name: 'Aerial Overview', tag: 'Video', video: galleryVideo4, size: 'gallery-item--tall' },
]

function GallerySection() {
  const introStageRef = useRef(null)
  const introPinRef = useRef(null)
  const tileRefs = useRef([])
  const videoRefs = useRef([])
  const fullscreenVideoRef = useRef(null)
  // Grid videos always play muted on loop; clicking one opens it fullscreen
  // with sound instead of toggling sound in place.
  const [activeVideo, setActiveVideo] = useState(null)

  // The heading is pinned dead-center for its own dwell while it slides in
  // from the right (zero vertical motion — see INTRO_DWELL_VH above), then
  // unpins and moves up normally. The grid's own fade-and-rise is a
  // separate, ordinary scroll-linked reveal computed from each tile's own
  // position in the very same frame, so once the heading starts leaving,
  // the grid rising up underneath it reads as a continuous handoff rather
  // than a delayed pop-in.
  useEffect(() => {
    const stage = introStageRef.current
    const pin = introPinRef.current
    if (!stage || !pin) return

    let ticking = false
    const playedVideoAt = []

    const updateReveal = () => {
      const viewportHeight = window.innerHeight
      const vhPx = viewportHeight / 100

      const stageTop = stage.getBoundingClientRect().top
      const introProgress = Math.min(Math.max(-stageTop / (vhPx * INTRO_DWELL_VH), 0), 1)
      const introEased = easeOutCubic(introProgress)

      pin.style.transform = `translateX(${(1 - introEased) * 55}%)`
      pin.style.opacity = String(introEased)

      tileRefs.current.forEach((tile, i) => {
        if (!tile) return

        const top = tile.getBoundingClientRect().top
        const start = viewportHeight * 0.92
        const end = viewportHeight * 0.6
        const progress = Math.min(Math.max((start - top) / (start - end), 0), 1)

        tile.style.opacity = String(progress)
        tile.style.transform = `translateY(${(1 - progress) * 32}px)`

        // Videos only start loading + playing once actually scrolled into
        // view, rather than fetching all three up front.
        if (progress > 0 && !playedVideoAt[i]) {
          playedVideoAt[i] = true
          videoRefs.current[i]?.play().catch(() => {})
        }
      })

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateReveal)
        ticking = true
      }
    }

    updateReveal()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Clicking a tile opens that video fullscreen with sound on; the grid
  // tile behind it keeps quietly looping, muted, exactly as before.
  const openVideo = useCallback((item, i) => {
    const gridVideo = videoRefs.current[i]
    if (gridVideo) gridVideo.muted = true
    setActiveVideo(item)
  }, [])

  const closeVideo = useCallback(() => {
    const video = fullscreenVideoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setActiveVideo(null)
  }, [])

  useEffect(() => {
    if (!activeVideo) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeVideo()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [activeVideo, closeVideo])

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-intro-stage" ref={introStageRef} style={{ height: `${INTRO_DWELL_VH + 100}vh` }}>
        <div className="gallery-intro-pin" ref={introPinRef}>
          <div className="gallery-header">
            <span className="gallery-eyebrow">
              <span className="gallery-eyebrow-dot" />
              Gallery
            </span>
            <h2>A Closer Look</h2>
            <p>A few moments from across our villas — click any video to hear it.</p>
          </div>
        </div>
      </div>

      <div className="gallery-grid">
        {gallery.map((item, i) => (
          <button
            type="button"
            key={item.id}
            className={`gallery-item gallery-item--video ${item.size}`}
            ref={(el) => (tileRefs.current[i] = el)}
            onClick={() => openVideo(item, i)}
            aria-label={`Play ${item.name} fullscreen with sound`}
          >
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              src={item.video}
              muted
              loop
              playsInline
              preload="none"
            />
            <span className="gallery-item-overlay" />
            <span className="gallery-item-index">{item.id}</span>
            <span className="gallery-item-expand" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </span>
            <span className="gallery-item-caption">
              <span className="gallery-item-tag">{item.tag}</span>
              <span className="gallery-item-name">{item.name}</span>
            </span>
          </button>
        ))}
      </div>

      {activeVideo &&
        createPortal(
          <div className="gallery-lightbox" onMouseDown={(e) => e.target === e.currentTarget && closeVideo()}>
            <button type="button" className="gallery-lightbox-close" onClick={closeVideo} aria-label="Close">
              &times;
            </button>
            <div className="gallery-lightbox-frame">
              <video
                ref={fullscreenVideoRef}
                src={activeVideo.video}
                autoPlay
                controls
                playsInline
                loop
              />
              <div className="gallery-lightbox-caption">
                <span className="gallery-lightbox-tag">{activeVideo.tag}</span>
                <span className="gallery-lightbox-name">{activeVideo.name}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}

export default GallerySection
