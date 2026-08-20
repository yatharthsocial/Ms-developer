import { useEffect, useRef, useState } from 'react'
import elevatorVideo from '../assets/amenity-elevator.mp4'
import terraceVideo from '../assets/amenity-terrace.mp4'
import poolVideo from '../assets/amenity-pool.mp4'
import maidRoomVideo from '../assets/amenity-maid-room.mp4'
import './AmenitiesSection.css'

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
    name: 'Separate Maid Room',
    description: 'A private, self-contained room for household staff.',
    video: maidRoomVideo,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19V9l9-5 9 5v10" />
        <path d="M3 19h18" />
        <rect x="7" y="12" width="5" height="7" />
      </svg>
    ),
  },
]

function AmenitiesSection() {
  const pinContainerRef = useRef(null)
  const rowRefs = useRef([])
  const poppedRef = useRef([])

  const [activeIndex, setActiveIndex] = useState(0)
  const [frontLayer, setFrontLayer] = useState('a')
  const videoARef = useRef(null)
  const videoBRef = useRef(null)
  const layerSrcRef = useRef({ a: amenities[0].video, b: null })

  const hoveringRef = useRef(false)
  const activeIndexRef = useRef(0)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    const backLayer = frontLayer === 'a' ? 'b' : 'a'
    const backRef = backLayer === 'a' ? videoARef : videoBRef
    const video = backRef.current
    if (!video) return

    const targetSrc = amenities[activeIndex].video
    if (layerSrcRef.current[backLayer] === targetSrc) return

    layerSrcRef.current[backLayer] = targetSrc
    video.src = targetSrc
    video.load()

    const handleCanPlay = () => {
      video.play().catch(() => {})
      setFrontLayer(backLayer)
    }

    video.addEventListener('canplay', handleCanPlay, { once: true })
    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [activeIndex])

  useEffect(() => {
    videoARef.current?.play().catch(() => {})
  }, [])

  useEffect(() => {
    const pinContainer = pinContainerRef.current
    if (!pinContainer) return

    let ticking = false

    const updateProgress = () => {
      const rect = pinContainer.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const scrollable = rect.height - viewportHeight

      const scrolled = -rect.top
      const progress = scrollable > 0 ? Math.min(Math.max(scrolled / scrollable, 0), 1) : 0

      const rawIndex = Math.floor(progress * amenities.length)
      const nextIndex = Math.min(amenities.length - 1, Math.max(0, rawIndex))

      if (!hoveringRef.current && nextIndex !== activeIndexRef.current) {
        setActiveIndex(nextIndex)
      }

      if (!poppedRef.current[nextIndex]) {
        poppedRef.current[nextIndex] = true
        const icon = rowRefs.current[nextIndex]?.querySelector('.amenity-icon')
        if (icon) icon.classList.add('amenity-icon-pop')
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
  }, [])

  return (
    <section
      className="amenities-section"
      id="amenities"
      ref={pinContainerRef}
      style={{ height: `${amenities.length * 100}vh` }}
    >
      <div className="amenities-pin">
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
                <span className="amenities-image-caption-label">{amenities[activeIndex].name}</span>
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
                    setActiveIndex(i)
                  }}
                  onMouseLeave={() => {
                    hoveringRef.current = false
                  }}
                  onFocus={() => setActiveIndex(i)}
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
