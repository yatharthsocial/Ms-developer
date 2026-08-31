import { useEffect, useRef, useState } from 'react'
import heroVideo from '../assets/videohero.mp4'
import heroVideoMobile from '../assets/herosections.mp4'
import logo from '../assets/logo.jpg'
import { scrollToSection } from '../utils/scrollToSection'
import './HeroSection.css'

const MOBILE_BREAKPOINT = '(max-width: 767px)'

function HeroSection() {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Picking the clip here instead of via <source media="..."> — Safari
  // (iOS in particular, and it's gotten worse across recent versions) is
  // unreliable about re-evaluating a <source>'s media query inside a
  // <video>, and has been seen falling back to the last/desktop <source>
  // regardless of actual viewport width. Read once on mount, same as the
  // rest of the site's mobile checks (AmenitiesSection.jsx,
  // GallerySection.jsx) — doesn't need to react live to resizing, same
  // as the media-query version never did either.
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (video.readyState >= 3) {
      setIsLoaded(true)
    }

    video.play().catch(() => {})
  }, [])

  // Content (nav, headline, CTAs) stays hidden until the intro video
  // reaches its actual last frame, then pops in smoothly over it — see the
  // slow scale/opacity transition on .hero-content in HeroSection.css.
  const handleEnded = (e) => {
    e.currentTarget.pause()
    setShowOverlay(true)
  }

  return (
    <section className="hero-section" id="home">
      <video
        ref={videoRef}
        className={`hero-video ${isLoaded ? 'is-loaded' : ''}`}
        src={isMobile ? heroVideoMobile : heroVideo}
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setIsLoaded(true)}
        onEnded={handleEnded}
      />
      <div className="hero-overlay" />

      <div className={`hero-content ${showOverlay ? 'is-visible' : ''}`}>
        <nav className="hero-nav">
          <img src={logo} alt="MS Developers" className="hero-nav-logo" />
          <ul className="hero-nav-links">
            <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About Us</a></li>
            <li><a href="#villas" onClick={(e) => scrollToSection(e, 'villas')}>Projects</a></li>
            <li><a href="#amenities" onClick={(e) => scrollToSection(e, 'amenities')}>Amenities</a></li>
            <li><a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')}>Gallery</a></li>
            <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact Us</a></li>
          </ul>
          <div className="hero-nav-cta">
            <a href="#contact" className="hero-btn" onClick={(e) => scrollToSection(e, 'contact')}>
              Get In Touch
            </a>
          </div>
        </nav>

        <div className="hero-headline">
          <h1>
            LUXURY VILLAS
            <br />
            REDEFINED LIVING
          </h1>
          <p className="hero-tagline">
            with <em>intelligent design, inspired living</em>
          </p>
        </div>

        <div className="hero-stats">
          <ul className="hero-stats-list">
            <li>
              <strong>2</strong>
              <span>Villas Delivered</span>
            </li>
            <li>
              <strong>3+</strong>
              <span>Years Experience</span>
            </li>
            <li>
              <strong>100%</strong>
              <span>Happy Clients</span>
            </li>
          </ul>
          <a href="#contact" className="hero-btn" onClick={(e) => scrollToSection(e, 'contact')}>
            Get A Consultation
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
