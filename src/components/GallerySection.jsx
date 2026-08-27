import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import galleryVideo1 from '../assets/gallery01.mp4'
import galleryVideo2 from '../assets/gallery02.mp4'
import galleryVideo3 from '../assets/gallery03.mp4'
import galleryVideo4 from '../assets/gallery04.mp4'
import villa1Exterior from '../assets/villa1-exterior.mp4'
import villa1GroundFloor from '../assets/villa1-ground-floor.jpg'
import villa1FirstFloor from '../assets/villa1-first-floor.jpg'
import villa1SecondFloor from '../assets/villa1-second-floor.jpg'
import villa2Exterior from '../assets/villa2-exterior.mp4'
import villa2CellarFloor from '../assets/villa2-cellar-floor.jpg'
import villa2GroundFloor from '../assets/villa2-ground-floor.jpg'
import villa2FirstFloor from '../assets/villa2-first-floor.jpg'
import villa3SecondFloorVideo from '../assets/villa3-second-floor.mp4'
import villa3GroundFloor from '../assets/villa3-ground-floor.jpg'
import villa3FirstFloor from '../assets/villa3-first-floor.jpg'
import villa3SecondFloor from '../assets/villa3-second-floor.jpg'
import interiorKitchen from '../assets/interior-kitchen.jpg'
import interiorBathroom from '../assets/interior-bathroom.jpg'
import interiorTerrace from '../assets/interior-terrace.jpg'
import interiorPool from '../assets/interior-pool.jpg'
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

// A touch swipe covers far less physical distance per gesture than a
// trackpad/mouse-wheel scroll — at INTRO_DWELL_VH above (tuned by feel
// for desktop), the heading took roughly twice as many swipes as felt
// right to finish sliding in on a phone. Shortening the same dwell
// distance on narrow viewports fixes that without touching the desktop
// feel or the easing itself (same approach as AmenitiesSection.jsx).
const MOBILE_BREAKPOINT = '(max-width: 720px)'
const MOBILE_VH_SCALE = 0.55

// Four equal tall columns rather than a hero + tall mix — with four
// portrait clips, a clean filmstrip of four reads better than forcing an
// odd item into a leftover corner, and tall columns crop portrait video
// more gracefully than a wide/square one would.
//
// `category` ties an item to exactly one filter pill — including
// "Videos" itself, which is its own category (the four original clips)
// rather than an "everything" view, so a villa's assets show only under
// that villa's own pill and nowhere else.
const gallery = [
  { id: 'prime-location', name: 'Prime Location', tag: 'Video', type: 'video', video: galleryVideo1, size: 'gallery-item--tall', category: 'Videos' },
  { id: 'villa-by-night', name: 'Villa by Night', tag: 'Video', type: 'video', video: galleryVideo2, size: 'gallery-item--tall', category: 'Videos' },
  { id: 'rooftop-pool', name: 'Rooftop Pool Walkthrough', tag: 'Video', type: 'video', video: galleryVideo3, size: 'gallery-item--tall', category: 'Videos' },
  { id: 'aerial-overview', name: 'Aerial Overview', tag: 'Video', type: 'video', video: galleryVideo4, size: 'gallery-item--tall', category: 'Videos' },

  { id: 'villa1-exterior', name: 'City Villa 1 — Exterior', tag: 'Video', type: 'video', video: villa1Exterior, size: 'gallery-item--tall', category: 'City Villa 1' },
  { id: 'villa1-ground-floor', name: 'Ground Floor Plan', tag: 'Floor Plan', type: 'image', image: villa1GroundFloor, size: 'gallery-item--tall', category: 'City Villa 1' },
  { id: 'villa1-first-floor', name: 'First Floor Plan', tag: 'Floor Plan', type: 'image', image: villa1FirstFloor, size: 'gallery-item--tall', category: 'City Villa 1' },
  { id: 'villa1-second-floor', name: 'Second Floor Plan', tag: 'Floor Plan', type: 'image', image: villa1SecondFloor, size: 'gallery-item--tall', category: 'City Villa 1' },

  { id: 'villa2-exterior', name: 'City Villa 2 — Exterior Walkthrough', tag: 'Video', type: 'video', video: villa2Exterior, size: 'gallery-item--tall', category: 'City Villa 2' },
  { id: 'villa2-cellar-floor', name: 'Cellar Floor Plan', tag: 'Floor Plan', type: 'image', image: villa2CellarFloor, size: 'gallery-item--tall', category: 'City Villa 2' },
  { id: 'villa2-ground-floor', name: 'Ground Floor Plan', tag: 'Floor Plan', type: 'image', image: villa2GroundFloor, size: 'gallery-item--tall', category: 'City Villa 2' },
  { id: 'villa2-first-floor', name: 'First Floor Plan', tag: 'Floor Plan', type: 'image', image: villa2FirstFloor, size: 'gallery-item--tall', category: 'City Villa 2' },

  { id: 'villa3-second-floor-video', name: 'City Villa 3 — Second Floor Walkthrough', tag: 'Video', type: 'video', video: villa3SecondFloorVideo, size: 'gallery-item--tall', category: 'City Villa 3' },
  { id: 'villa3-ground-floor', name: 'Ground Floor Plan', tag: 'Floor Plan', type: 'image', image: villa3GroundFloor, size: 'gallery-item--tall', category: 'City Villa 3' },
  { id: 'villa3-first-floor', name: 'First Floor Plan', tag: 'Floor Plan', type: 'image', image: villa3FirstFloor, size: 'gallery-item--tall', category: 'City Villa 3' },
  { id: 'villa3-second-floor', name: 'Second Floor Plan', tag: 'Floor Plan', type: 'image', image: villa3SecondFloor, size: 'gallery-item--tall', category: 'City Villa 3' },

  { id: 'interior-kitchen', name: 'Kitchen', tag: 'Photo', type: 'image', image: interiorKitchen, size: 'gallery-item--tall', category: 'Interior' },
  { id: 'interior-bathroom', name: 'Bathroom', tag: 'Photo', type: 'image', image: interiorBathroom, size: 'gallery-item--tall', category: 'Interior' },
  { id: 'interior-terrace', name: 'Terrace', tag: 'Photo', type: 'image', image: interiorTerrace, size: 'gallery-item--tall', category: 'Interior' },
  { id: 'interior-pool', name: 'Indoor Pool', tag: 'Photo', type: 'image', image: interiorPool, size: 'gallery-item--tall', category: 'Interior' },
]

// Each pill shows only its own category's items now — "Videos" is the
// four original, unbranded clips; City Villa 1/2/3 each show that
// villa's own exterior/walkthrough footage plus its floor plans;
// "Interior" shows real photos of finished interior spaces (kitchen,
// bathroom, terrace, indoor pool) rather than renders. A pill with
// nothing tagged falls back to the empty state below the grid instead of
// showing blank space — the pattern each villa followed before its own
// folder was added.
const filters = ['Videos', 'City Villa 1', 'City Villa 2', 'City Villa 3', 'Interior']

// How much each filter pill's own reveal progress lags the one before it
// (as a fraction of the shared scroll range below), so they pop in one at
// a time left-to-right instead of all at once.
const FILTER_STAGGER = 0.16

function GallerySection() {
  const introStageRef = useRef(null)
  const introPinRef = useRef(null)
  const introSlideRef = useRef(null)
  const filterRefs = useRef([])
  const tileRefs = useRef([])
  const videoRefs = useRef([])
  const fullscreenVideoRef = useRef(null)
  // Grid videos always play muted on loop; clicking one opens it fullscreen
  // with sound instead of toggling sound in place. Clicking an image (a
  // floor plan) just opens it larger — no sound involved, same lightbox.
  const [activeMedia, setActiveMedia] = useState(null)
  const [activeFilter, setActiveFilter] = useState(filters[0])

  // Read once on mount, same as AmenitiesSection.jsx — doesn't need to
  // react live to resizing.
  const [scale] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches ? MOBILE_VH_SCALE : 1
  )
  const introDwellVh = INTRO_DWELL_VH * scale

  const visibleGallery = gallery.filter((item) => item.category === activeFilter)

  // The heading is pinned dead-center for its own dwell while it slides in
  // from the right (zero vertical motion — see INTRO_DWELL_VH above), then
  // unpins and moves up normally. The grid's own fade-and-rise is a
  // separate, ordinary scroll-linked reveal computed from each tile's own
  // position in the very same frame, so once the heading starts leaving,
  // the grid rising up underneath it reads as a continuous handoff rather
  // than a delayed pop-in.
  //
  // Re-runs on every activeFilter change (not just on mount) and calls
  // updateReveal() once immediately below — switching filters swaps in a
  // new, still-scrolled-into-view set of tiles that would otherwise sit at
  // their CSS-default opacity: 0 forever until the next scroll event.
  useEffect(() => {
    const stage = introStageRef.current
    const pin = introPinRef.current
    const slide = introSlideRef.current
    if (!stage || !pin || !slide) return

    let ticking = false
    const playedVideoAt = []

    const updateReveal = () => {
      const viewportHeight = window.innerHeight
      const vhPx = viewportHeight / 100

      const stageTop = stage.getBoundingClientRect().top
      const introProgress = Math.min(Math.max(-stageTop / (vhPx * introDwellVh), 0), 1)
      const introEased = easeOutCubic(introProgress)

      // The slide moves on an inner wrapper, not the sticky pin itself —
      // .gallery-intro-pin stays put and clips it (overflow: hidden), so
      // the off-screen resting position (translateX 55%) never bleeds
      // into the page's own scrollable width. Doing this translate on the
      // pin directly used to push real layout overflow out to the right
      // on narrow/mobile viewports, making the whole page pannable
      // sideways — see GallerySection.css.
      slide.style.transform = `translateX(${(1 - introEased) * 55}%)`
      pin.style.opacity = String(introEased)

      // The filter row sits right above the grid in normal flow (not
      // pinned), so it reaches these same thresholds slightly before the
      // tiles below it do — giving a natural "filters settle, then the
      // videos rise in under them" order. Each pill's raw progress is
      // pushed back by FILTER_STAGGER * i and rescaled to 0–1, so instead
      // of every pill fading in at once, they pop in left-to-right as the
      // section scrolls past.
      filterRefs.current.forEach((btn, i) => {
        if (!btn) return

        const top = btn.getBoundingClientRect().top
        const start = viewportHeight * 0.95
        const end = viewportHeight * 0.7
        const raw = Math.min(Math.max((start - top) / (start - end), 0), 1)
        const stagger = FILTER_STAGGER * i
        const progress = Math.min(Math.max((raw - stagger) / (1 - stagger), 0), 1)
        const eased = easeOutCubic(progress)

        btn.style.opacity = String(eased)
        btn.style.transform = `translateY(${(1 - eased) * 14}px) scale(${0.82 + eased * 0.18})`
      })

      tileRefs.current.forEach((tile, i) => {
        if (!tile) return

        const top = tile.getBoundingClientRect().top
        const start = viewportHeight * 0.92
        const end = viewportHeight * 0.6
        const progress = Math.min(Math.max((start - top) / (start - end), 0), 1)

        tile.style.opacity = String(progress)
        tile.style.transform = `translateY(${(1 - progress) * 32}px)`

        // Videos only start loading + playing once actually scrolled into
        // view, rather than fetching all three up front. Floor-plan images
        // have no videoRefs entry, so this is a no-op for them.
        if (progress > 0 && !playedVideoAt[i] && visibleGallery[i]?.type === 'video') {
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
  }, [activeFilter])

  // Clicking a video tile opens it fullscreen with sound on, the grid tile
  // behind it kept quietly looping, muted. Clicking an image tile (a floor
  // plan) opens the same lightbox with the full image instead — no sound
  // to manage there.
  const openMedia = useCallback((item, i) => {
    if (item.type === 'video') {
      const gridVideo = videoRefs.current[i]
      if (gridVideo) gridVideo.muted = true
    }
    setActiveMedia(item)
  }, [])

  const closeMedia = useCallback(() => {
    const video = fullscreenVideoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setActiveMedia(null)
  }, [])

  useEffect(() => {
    if (!activeMedia) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMedia()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [activeMedia, closeMedia])

  return (
    <section className="gallery-section" id="gallery">
      <div
        className="gallery-intro-stage"
        ref={introStageRef}
        // The release runway (last term) must match .gallery-intro-pin's
        // own *rendered* height exactly (100svh, not 100vh — see the
        // comment in GallerySection.css) or the pin unsticks at the
        // wrong scroll position. Same fix as AmenitiesSection.jsx.
        style={{ height: `calc(${introDwellVh}vh + 100svh)` }}
      >
        <div className="gallery-intro-pin" ref={introPinRef}>
          <div className="gallery-intro-slide" ref={introSlideRef}>
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
      </div>

      <div className="gallery-filters">
        {filters.map((label, i) => (
          <button
            type="button"
            key={label}
            className={`gallery-filter-btn ${activeFilter === label ? 'is-active' : ''}`}
            ref={(el) => (filterRefs.current[i] = el)}
            onClick={() => setActiveFilter(label)}
            aria-pressed={activeFilter === label}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleGallery.length > 0 ? (
        <div className="gallery-grid">
          {visibleGallery.map((item, i) => (
            <button
              type="button"
              key={item.id}
              className={`gallery-item gallery-item--${item.type} ${item.size}`}
              ref={(el) => (tileRefs.current[i] = el)}
              onClick={() => openMedia(item, i)}
              aria-label={item.type === 'video' ? `Play ${item.name} fullscreen with sound` : `View ${item.name} fullscreen`}
            >
              {item.type === 'video' ? (
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={item.video}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
              ) : (
                <img src={item.image} alt={item.name} loading="lazy" />
              )}
              <span className="gallery-item-overlay" />
              <span className="gallery-item-index">{String(i + 1).padStart(2, '0')}</span>
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
      ) : (
        // A villa with no tagged footage yet (see the `filters` comment
        // above) — a friendly placeholder instead of a blank stretch of
        // page under the pills.
        <div className="gallery-empty">
          <p>More from {activeFilter} is on the way — check back soon.</p>
        </div>
      )}

      {activeMedia &&
        createPortal(
          <div className="gallery-lightbox" onMouseDown={(e) => e.target === e.currentTarget && closeMedia()}>
            <button type="button" className="gallery-lightbox-close" onClick={closeMedia} aria-label="Close">
              &times;
            </button>
            <div className="gallery-lightbox-frame">
              {activeMedia.type === 'video' ? (
                <video
                  ref={fullscreenVideoRef}
                  src={activeMedia.video}
                  autoPlay
                  controls
                  playsInline
                  loop
                />
              ) : (
                <img src={activeMedia.image} alt={activeMedia.name} />
              )}
              <div className="gallery-lightbox-caption">
                <span className="gallery-lightbox-tag">{activeMedia.tag}</span>
                <span className="gallery-lightbox-name">{activeMedia.name}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}

export default GallerySection
