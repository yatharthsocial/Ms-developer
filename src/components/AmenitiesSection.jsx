import { useCallback, useEffect, useRef, useState } from 'react'
import elevatorVideo from '../assets/amenity-elevator.mp4'
import terraceVideo from '../assets/amenity-terrace.mp4'
import poolVideo from '../assets/amenity-pool.mp4'
import loungeVideo from '../assets/amenity-lounge.mp4'
import './AmenitiesSection.css'

const VH_PER_AMENITY = 78
// Lounge (the last amenity) gets extra dwell room of its own: it shows
// normally for SETTLE_VH, then — still fully pinned, zero vertical motion —
// spends SLIDE_VH sliding the whole panel out to the left, finishing right
// as it unpins and hands off to Gallery scrolling up normally underneath.
const SETTLE_VH = 28
const SLIDE_VH = 90

// A touch swipe covers far less physical distance per gesture than a
// trackpad/mouse-wheel scroll — at the vh distances above (tuned by feel
// for desktop), getting through this section on a phone took roughly
// twice as many swipes as felt right. Shortening the same dwell
// distances on narrow viewports fixes that without touching the desktop
// feel or the easing/animation itself.
const MOBILE_BREAKPOINT = '(max-width: 720px)'
const MOBILE_VH_SCALE = 0.55

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

const amenities = [
  {
    id: '01',
    name: 'Modular Elevator',
    description: 'A private, modern elevator connecting every floor of the villa.',
    video: elevatorVideo,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <path d="M11 8l1.5-2L14 8" />
        <path d="M11 15l1.5 2 1.5-2" />
      </svg>
    ),
  },
  {
    id: '02',
    name: 'Terrace',
    description: 'An open-air rooftop terrace for evenings, gatherings and views.',
    video: terraceVideo,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="6" r="2.5" />
        <path d="M3 21h18" />
        <path d="M4 21v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6" />
        <path d="M8 21v-4" />
        <path d="M12 21v-4" />
        <path d="M16 21v-4" />
      </svg>
    ),
  },
  {
    id: '03',
    name: 'Mini Pool & Jacuzzi',
    description: 'A private plunge pool and jacuzzi for everyday unwinding.',
    video: poolVideo,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="1" />
        <circle cx="14" cy="5" r="1" />
        <path d="M3 12c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
        <path d="M3 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
      </svg>
    ),
  },
  {
    id: '04',
    name: 'Lounge',
    description: 'A relaxed indoor lounge space designed for everyday comfort.',
    video: loungeVideo,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        <path d="M4 18v2" />
        <path d="M20 18v2" />
        <path d="M4 14v-3a2 2 0 0 1 2-2h1" />
        <path d="M20 14v-3a2 2 0 0 1-2-2h-1" />
        <path d="M2 18h20" />
      </svg>
    ),
  },
]

const lastIndex = amenities.length - 1

function AmenitiesSection() {
  const pinContainerRef = useRef(null)
  const pinRef = useRef(null)
  const rowRefs = useRef([])
  const poppedRef = useRef([])

  // Read once on mount, same as the rest of this component's setup —
  // this doesn't need to react live to resizing.
  const [scale] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches ? MOBILE_VH_SCALE : 1
  )
  const vhPerAmenity = VH_PER_AMENITY * scale
  const settleVh = SETTLE_VH * scale
  const slideVh = SLIDE_VH * scale
  const regularTotalVh = lastIndex * vhPerAmenity
  const totalDwellVh = regularTotalVh + settleVh + slideVh

  const [activeIndex, setActiveIndex] = useState(0)
  const [frontLayer, setFrontLayer] = useState('a')
  const videoARef = useRef(null)
  const videoBRef = useRef(null)
  const frontLayerRef = useRef('a')
  const layerSrcRef = useRef({ a: amenities[0].video, b: null })
  // Whether each layer's current src has actually fired 'canplay' yet —
  // lets a later swap be instant instead of re-waiting on a load that's
  // already in flight.
  const layerReadyRef = useRef({ a: true, b: false })

  const hoveringRef = useRef(false)
  const activeIndexRef = useRef(0)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    frontLayerRef.current = frontLayer
  }, [frontLayer])

  // Starts loading `index`'s clip into whichever layer is currently the
  // *back* one, well before it's actually needed — so the actual crossfade
  // in goToIndex can be instant instead of visibly waiting on a fresh
  // video load, which is what made switching feel laggy before. Reads
  // frontLayerRef, so this must only ever run when that ref is known to be
  // up to date (i.e. not in the same tick as a swap that hasn't finished
  // updating it yet — see the comment in goToIndex below).
  const preloadIndex = useCallback((index) => {
    if (index < 0 || index > lastIndex) return
    const targetSrc = amenities[index].video
    const front = frontLayerRef.current
    if (layerSrcRef.current[front] === targetSrc) return

    const back = front === 'a' ? 'b' : 'a'
    if (layerSrcRef.current[back] === targetSrc) return

    const video = (back === 'a' ? videoARef : videoBRef).current
    if (!video) return

    layerSrcRef.current[back] = targetSrc
    layerReadyRef.current[back] = false
    video.src = targetSrc
    video.load()
    video.addEventListener(
      'canplay',
      () => {
        layerReadyRef.current[back] = true
      },
      { once: true }
    )
  }, [])

  // Updates which row/caption is active and crossfades its video in — if
  // it was already preloaded and ready, this swaps immediately; otherwise
  // it falls back to loading it right now (e.g. scrolling faster than the
  // predictive lead time can keep up). Only once the swap has *actually*
  // landed (frontLayerRef updated) does it kick off preloading the next
  // one — doing that any earlier would race preloadIndex's own read of
  // frontLayerRef against this swap and clobber the very layer mid-swap.
  const goToIndex = useCallback(
    (index) => {
      setActiveIndex(index)

      const targetSrc = amenities[index].video
      const front = frontLayerRef.current
      if (layerSrcRef.current[front] === targetSrc) {
        preloadIndex(index + 1)
        return
      }

      const back = front === 'a' ? 'b' : 'a'
      const video = (back === 'a' ? videoARef : videoBRef).current
      if (!video) return

      const swap = () => {
        video.play().catch(() => {})
        frontLayerRef.current = back
        setFrontLayer(back)
        preloadIndex(index + 1)
      }

      if (layerSrcRef.current[back] === targetSrc) {
        if (layerReadyRef.current[back]) swap()
        else video.addEventListener('canplay', swap, { once: true })
        return
      }

      layerSrcRef.current[back] = targetSrc
      layerReadyRef.current[back] = false
      video.src = targetSrc
      video.load()
      video.addEventListener('canplay', swap, { once: true })
    },
    [preloadIndex]
  )

  useEffect(() => {
    videoARef.current?.play().catch(() => {})
    preloadIndex(1)
  }, [preloadIndex])

  useEffect(() => {
    const pinContainer = pinContainerRef.current
    if (!pinContainer) return

    let ticking = false

    const updateProgress = () => {
      const rect = pinContainer.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const vhPx = viewportHeight / 100
      const scrolled = -rect.top

      const nextIndex = Math.min(
        lastIndex,
        Math.max(0, Math.floor(scrolled / vhPx / vhPerAmenity))
      )

      if (!hoveringRef.current && nextIndex !== activeIndexRef.current) {
        goToIndex(nextIndex)
      }

      if (!poppedRef.current[nextIndex]) {
        poppedRef.current[nextIndex] = true
        const icon = rowRefs.current[nextIndex]?.querySelector('.amenity-icon')
        if (icon) icon.classList.add('amenity-icon-pop')
      }

      // Once Lounge is active, it first shows in place for SETTLE_VH, then —
      // still fully pinned, zero vertical motion — spends SLIDE_VH sliding
      // the whole panel out to the left, finishing right as it unpins.
      let exitProgress = 0
      const scrolledVh = scrolled / vhPx
      if (nextIndex === lastIndex) {
        const localVh = scrolledVh - regularTotalVh
        exitProgress = Math.min(Math.max((localVh - settleVh) / slideVh, 0), 1)
      }

      const eased = easeInOutCubic(exitProgress)

      if (pinRef.current) {
        pinRef.current.style.transform = `translateX(${-eased * 100}%)`
        // A pure position slide with no fade looks fine mid-scroll, but a
        // scroll that pauses (or is just slow) partway through freezes on
        // a static frame with text hard-clipped at the viewport edge and
        // no visual cue anything is mid-transition — reads as broken UI
        // rather than "still sliding". Fading it out alongside the slide
        // means a paused frame reads as "fading away" instead.
        pinRef.current.style.opacity = String(1 - eased)
        pinRef.current.style.pointerEvents = exitProgress > 0.05 ? 'none' : 'auto'
      }

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress)
        ticking = true
      }
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [goToIndex])

  return (
    <section
      className="amenities-section"
      id="amenities"
      ref={pinContainerRef}
      // The release runway (last term) has to match .amenities-pin's own
      // *rendered* height exactly, or the pin unsticks at the wrong
      // scroll position — a sticky element only stays glued at top:0 for
      // (wrapperHeight - itsOwnHeight) of scroll. That's 100svh, not
      // 100vh: .amenities-pin uses 100svh (see AmenitiesSection.css) so
      // its real height matches what's actually visible on a phone with
      // its address bar showing, rather than the larger, bar-collapsed
      // 100vh, which used to push its bottom content past the true fold.
      style={{ height: `calc(${totalDwellVh}vh + 100svh)` }}
    >
      <div className="amenities-pin" ref={pinRef}>
        <div className="amenities-header">
          <span className="amenities-eyebrow">
            <span className="amenities-eyebrow-dot" />
            Amenities
          </span>
          <h2>Every Detail, Thoughtfully Included</h2>
          <p>Built-in comforts that turn a villa into a complete, elevated way of living.</p>
        </div>

        <div className="amenities-layout">
          <div className="amenities-image-wrapper">
            <div className="amenities-image-inner">
              <video
                ref={videoARef}
                className={`amenities-video ${frontLayer === 'a' ? 'is-front' : ''}`}
                src={amenities[0].video}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
              />
              <video
                ref={videoBRef}
                className={`amenities-video ${frontLayer === 'b' ? 'is-front' : ''}`}
                muted
                loop
                playsInline
                preload="auto"
              />
              <div className="amenities-image-overlay" />
              <div className="amenities-image-caption">
                <span className="amenities-image-caption-label" key={activeIndex}>
                  {amenities[activeIndex].name}
                </span>
              </div>
            </div>
          </div>

          <ul className="amenities-list">
            {amenities.map((item, i) => (
              <li className="amenity-row-wrapper" key={item.name}>
                <div
                  className={`amenity-row ${activeIndex === i ? 'is-active' : ''}`}
                  ref={(el) => (rowRefs.current[i] = el)}
                  onMouseEnter={() => {
                    hoveringRef.current = true
                    goToIndex(i)
                  }}
                  onMouseLeave={() => {
                    hoveringRef.current = false
                  }}
                  onFocus={() => goToIndex(i)}
                  tabIndex={0}
                >
                  <span className="amenity-row-index">{item.id}</span>
                  <div className="amenity-icon">{item.icon}</div>
                  <div className="amenity-row-text">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AmenitiesSection
