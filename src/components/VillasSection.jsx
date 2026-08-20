import { useEffect, useRef, useState } from 'react'
import villaCard1 from '../assets/villa-card-1.jpg'
import villaCard2 from '../assets/villa-card-2.jpg'
import villaCard3 from '../assets/villa-card-3.jpg'
import EnquiryModal from './EnquiryModal'
import './VillasSection.css'

const villas = [
  {
    id: '01',
    name: 'City Villa 1',
    status: 'completed',
    statusLabel: 'Completed',
    detail: 'Move-in ready',
    beds: 4,
    baths: 5,
    area: '3,800 sq.ft',
    image: villaCard1,
    cta: 'Explore Villa',
  },
  {
    id: '02',
    name: 'City Villa 2',
    status: 'ongoing',
    statusLabel: 'Ongoing',
    detail: '65% complete',
    progress: 65,
    beds: 4,
    baths: 5,
    area: '4,200 sq.ft',
    image: villaCard2,
    cta: 'View Progress',
  },
  {
    id: '03',
    name: 'City Villa 3',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    detail: 'Launching soon',
    beds: 5,
    baths: 6,
    area: '4,600 sq.ft',
    image: villaCard3,
    cta: 'Register Interest',
  },
]

function VillasSection() {
  const wrapperRefs = useRef([])
  const innerRefs = useRef([])
  const [activeVilla, setActiveVilla] = useState(null)

  useEffect(() => {
    const wrappers = wrapperRefs.current
    if (!wrappers.some(Boolean)) return

    let ticking = false

    const updateReveal = () => {
      const viewportHeight = window.innerHeight

      wrappers.forEach((wrapper, i) => {
        const inner = innerRefs.current[i]
        if (!wrapper || !inner) return

        const top = wrapper.getBoundingClientRect().top
        const start = viewportHeight * 0.92
        const end = viewportHeight * 0.55
        const progress = Math.min(Math.max((start - top) / (start - end), 0), 1)
        inner.style.opacity = progress
        inner.style.transform = `translateY(${(1 - progress) * 32}px)`
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

  return (
    <section className="villas-section" id="villas">
      <div className="villas-header">
        <span className="villas-eyebrow">
          <span className="villas-eyebrow-dot" />
          Our Villas
        </span>
        <h2>Three Villas, Three Stages</h2>
        <p>
          From a finished home to a villa still on the drawing board — a look at where
          each of our current projects stands.
        </p>
      </div>

      <div className="villas-grid">
        {villas.map((villa, i) => (
          <div
            className={`villa-card-wrapper villa-card--${villa.status}`}
            key={villa.name}
            ref={(el) => (wrapperRefs.current[i] = el)}
          >
            <article
              className="villa-card"
              ref={(el) => (innerRefs.current[i] = el)}
              onClick={() => setActiveVilla(villa)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveVilla(villa)
                }
              }}
            >
              <span className="villa-card-index">{villa.id}</span>

              <div className="villa-card-media">
                <img src={villa.image} alt={villa.name} />
                <div className="villa-card-overlay" />
                {villa.status === 'upcoming' && (
                  <div className="villa-card-coming-soon">
                    <span>Coming Soon</span>
                  </div>
                )}
                <span className={`villa-card-status villa-card-status--${villa.status}`}>
                  <span className="villa-card-status-dot" />
                  {villa.statusLabel}
                </span>
              </div>

              <div className="villa-card-body">
                <div className="villa-card-heading">
                  <h3>{villa.name}</h3>
                  <span className="villa-card-detail">{villa.detail}</span>
                </div>

                <ul className="villa-card-specs">
                  <li>{villa.beds} Beds</li>
                  <li>{villa.baths} Baths</li>
                  <li>{villa.area}</li>
                </ul>

                {villa.status === 'ongoing' && (
                  <div className="villa-card-progress">
                    <div className="villa-card-progress-track">
                      <div
                        className="villa-card-progress-fill"
                        style={{ width: `${villa.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="villa-card-link"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveVilla(villa)
                  }}
                >
                  {villa.cta} <span>&#8599;</span>
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>

      {activeVilla && <EnquiryModal villa={activeVilla} onClose={() => setActiveVilla(null)} />}
    </section>
  )
}

export default VillasSection
