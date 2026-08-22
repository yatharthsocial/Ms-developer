import { useEffect, useRef, useState } from 'react'
import aboutImage from '../assets/about-villa-2.png'
import aboutDetailImage from '../assets/about-villa-1.png'
import './AboutSection.css'

const MAX_RADIUS = 24
const RADIUS_RANGE = 160

const REVEAL_START = 620
const REVEAL_END = 40

const COUNT_DURATION_UP = 1000
const COUNT_DURATION_DOWN = 650

const stats = [
  { value: 2, suffix: '', label: 'Villas Delivered' },
  { value: 3, suffix: '+', label: 'Years Experience' },
  { value: 100, suffix: '%', label: 'Happy Clients' },
]

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x)
}

function AboutSection() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const countTargetRef = useRef(0)
  const countProgressRef = useRef(0)
  const countRafRef = useRef(null)
  const [counts, setCounts] = useState(stats.map(() => 0))

  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return

    let ticking = false

    const animateCountTo = (target, duration) => {
      if (countRafRef.current) cancelAnimationFrame(countRafRef.current)
      const startProgress = countProgressRef.current
      const delta = target - startProgress
      const start = performance.now()

      const tick = (now) => {
        const elapsed = now - start
        const linear = Math.min(elapsed / duration, 1)
        const eased = easeOutQuad(linear)
        countProgressRef.current = startProgress + delta * eased
        setCounts(stats.map((stat) => Math.round(stat.value * countProgressRef.current)))
        if (linear < 1) {
          countRafRef.current = window.requestAnimationFrame(tick)
        }
      }

      countRafRef.current = window.requestAnimationFrame(tick)
    }

    const updateScrollEffects = () => {
      const top = section.getBoundingClientRect().top

      const radiusProgress = Math.min(Math.max(top / RADIUS_RANGE, 0), 1)
      const radius = MAX_RADIUS * radiusProgress
      section.style.borderRadius = `${radius}px ${radius}px 0 0`

      const revealProgress = Math.min(
        Math.max((REVEAL_START - top) / (REVEAL_START - REVEAL_END), 0),
        1
      )
      content.style.opacity = revealProgress
      content.style.transform = `translateY(${(1 - revealProgress) * 32}px)`

      const target = revealProgress >= 1 ? 1 : 0
      if (target !== countTargetRef.current) {
        countTargetRef.current = target
        animateCountTo(target, target === 1 ? COUNT_DURATION_UP : COUNT_DURATION_DOWN)
      }

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects)
        ticking = true
      }
    }

    // Only listen while this section is anywhere near the viewport. This
    // page has five sections each running their own always-on scroll +
    // rAF handler; left attached for the whole page lifetime, all five
    // fire on every single scroll event everywhere (e.g. deep inside
    // Amenities/Gallery), each forcing its own layout read — that
    // cross-component contention is what showed up as scroll "friction"
    // on weaker mobile CPUs. rootMargin gives a full viewport of lead-in
    // so the effect is already producing current values by the time this
    // section is actually visible, avoiding any stale-frame pop.
    let cleanupScroll = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!cleanupScroll) {
            updateScrollEffects()
            window.addEventListener('scroll', onScroll, { passive: true })
            cleanupScroll = () => window.removeEventListener('scroll', onScroll)
          }
        } else if (cleanupScroll) {
          cleanupScroll()
          cleanupScroll = null
        }
      },
      { rootMargin: '100% 0px 100% 0px' }
    )
    observer.observe(section)

    return () => {
      observer.disconnect()
      cleanupScroll?.()
    }
  }, [])

  return (
    <section className="about-section" id="about" ref={sectionRef}>
      <div className="about-content" ref={contentRef}>
        <div className="about-text">
          <span className="about-eyebrow">
            <span className="about-eyebrow-dot" />
            About Us
          </span>
          <h2>
            WE BUILD LUXURY
            <br />
            VILLAS IN MANGALORE
          </h2>
          <p>
            MS Developers builds premium luxury villas in Mangalore, complete with
            every amenity a modern family expects — private swimming pools,
            landscaped gardens, modular kitchens, and round-the-clock security. From
            concept to handover, every project is guided by verified quality, honest
            timelines, and a genuine understanding of how families in Mangalore
            actually want to live.
          </p>
          <p>
            Every villa also comes with a dedicated home theatre, covered parking for
            multiple vehicles, and 24/7 CCTV-monitored security, so residents get a
            complete, elevated lifestyle rather than just four walls and a roof.
          </p>
        </div>

        <div className="about-media">
          <div className="about-media-ring" />
          <img src={aboutDetailImage} alt="City Villa 1 by MS Developers" className="about-media-detail" />
          <img src={aboutImage} alt="City Villa 2 by MS Developers" className="about-media-main" />
        </div>

        <ul className="about-stats">
          {stats.map((stat, i) => (
            <li key={stat.label}>
              <strong>
                {counts[i]}
                {stat.suffix}
              </strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default AboutSection
