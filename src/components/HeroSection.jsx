import { useEffect, useRef, useState } from 'react'
import heroVideo from '../assets/Creating_luxury_villa_commercial_202608191618.mp4'
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

  const handleEnded = (e) => {
    e.currentTarget.pause()
    setShowOverlay(true)
  }

  return (
    <section className="hero-section">
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
            <li><a href="#projects">Projects</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#faq">FAQ</a></li>
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
              <strong>10+</strong>
              <span>Projects Delivered</span>
            </li>
            <li>
              <strong>5+</strong>
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
