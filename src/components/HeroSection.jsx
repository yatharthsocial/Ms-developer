import { useEffect, useRef, useState } from 'react'
import heroVideo from '../assets/finaldesktop.mp4'
import heroVideoMobile from '../assets/clean.mp4'
import logo from '../assets/logo.jpg'
import { scrollToSection } from '../utils/scrollToSection'
import './HeroSection.css'

const MOBILE_BREAKPOINT = '(max-width: 767px)'

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'villas', label: 'Projects' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact Us' },
]

function HeroSection() {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  // Nav links collapse behind a hamburger below 720px, opening as a
  // full-screen overlay (see HeroSection.css) — this tracks whether it's
  // open.
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  // Shared by every nav link (desktop row and mobile full-screen menu
  // alike) — scrolls to the section, then closes the menu if it was open
  // so a tap on mobile doesn't leave it hanging open over the next
  // section.
  const handleNavClick = (e, id) => {
    scrollToSection(e, id)
    setIsMenuOpen(false)
  }

  // The full-screen mobile menu behaves like the gallery lightbox
  // (GallerySection.jsx): Escape closes it, and the page underneath
  // can't scroll while it's open.
  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isMenuOpen])

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
          <ul className={`hero-nav-links ${isMenuOpen ? 'is-open' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} onClick={(e) => handleNavClick(e, link.id)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="hero-nav-actions">
            <a href="#contact" className="hero-btn hero-nav-cta" onClick={(e) => scrollToSection(e, 'contact')}>
              Get In Touch
            </a>
            <button
              type="button"
              className={`hero-nav-toggle ${isMenuOpen ? 'is-open' : ''}`}
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
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
          <a href="#contact" className="hero-btn hero-stats-cta" onClick={(e) => scrollToSection(e, 'contact')}>
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
