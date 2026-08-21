import { useEffect, useRef, useState } from 'react'
import heroVideo from '../assets/hero-video-trimmed.mp4'
import logo from '../assets/logo.jpg'
import './HeroSection.css'

function HeroSection() {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

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
        src={heroVideo}
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
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#villas">Projects</a></li>
            <li><a href="#amenities">Amenities</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
          <div className="hero-nav-cta">
            <a href="#contact" className="hero-btn">Get In Touch</a>
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
          <a href="#contact" className="hero-btn">Get A Consultation</a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
