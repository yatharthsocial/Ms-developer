import { useEffect, useRef, useState } from 'react'
import CountrySelect, { countries } from './CountrySelect'
import { validateEmail, validateName, validatePhone } from './formValidation'
import './ContactSection.css'

// Each line can carry its own `href` (so, e.g., three separate phone
// numbers each become their own tel: link) rather than the whole card
// being a single link — the old model only supported one.
const infoCards = [
  {
    id: 'address',
    label: 'Visit Us',
    lines: [
      { text: 'Premise No. 206, Second Floor' },
      { text: 'Marian Paradise Plaza, Bunts Hostel Road' },
      { text: 'Mangalore, DK' },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'phone',
    label: 'Call Us',
    lines: [
      { text: '+91 94484 56279', href: 'tel:+919448456279' },
      { text: '+91 86180 50684', href: 'tel:+918618050684' },
      { text: '+91 76763 61375', href: 'tel:+917676361375' },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5a2 2 0 0 1 2-2h2.5a1 1 0 0 1 1 .8l.9 4a1 1 0 0 1-.5 1.1L7 10.5a12 12 0 0 0 6.5 6.5l1.6-1.9a1 1 0 0 1 1.1-.5l4 .9a1 1 0 0 1 .8 1V19a2 2 0 0 1-2 2h-1C10.6 21 3 13.4 3 4Z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email Us',
    lines: [{ text: 'hello@msdevelopers.in', href: 'mailto:hello@msdevelopers.in' }],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 6.5 8.5 6 8.5-6" />
      </svg>
    ),
  },
  {
    id: 'timing',
    label: 'Timing',
    lines: [{ text: '10:00 AM – 6:00 PM' }],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
]

function ContactSection() {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const mapRef = useRef(null)
  const formRef = useRef(null)

  const [name, setName] = useState('')
  const [countryCode, setCountryCode] = useState('IN')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const country = countries.find((c) => c.code === countryCode)

  // Same continuous scroll-linked reveal used across the rest of the site
  // (Villas, Gallery): opacity/translateY computed from each element's own
  // position every frame, rather than an IntersectionObserver kicking off
  // a fixed-duration CSS animation — keeps this section's motion in step
  // with actual scroll speed instead of its own separate timer. The
  // IntersectionObserver added below is a different thing entirely: it
  // only gates whether the scroll listener is attached at all (a perf
  // measure, see the comment there), it never drives the reveal values.
  useEffect(() => {
    const section = sectionRef.current
    const elements = [...cardRefs.current, mapRef.current, formRef.current].filter(Boolean)
    if (!section || !elements.length) return

    let ticking = false

    const updateReveal = () => {
      const viewportHeight = window.innerHeight

      elements.forEach((el) => {
        const top = el.getBoundingClientRect().top
        const start = viewportHeight * 0.92
        const end = viewportHeight * 0.68
        const progress = Math.min(Math.max((start - top) / (start - end), 0), 1)

        el.style.opacity = String(progress)
        el.style.transform = `translateY(${(1 - progress) * 26}px)`
      })

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateReveal)
        ticking = true
      }
    }

    // Only listen while this section is anywhere near the viewport — see
    // the same gating in AboutSection.jsx for why (five always-on
    // scroll+rAF handlers on one page otherwise compete for every single
    // frame's budget regardless of which section is actually in view).
    let cleanupScroll = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!cleanupScroll) {
            updateReveal()
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

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s'-]/g, '')
    setName(value)
    if (errors.name) setErrors((prev) => ({ ...prev, name: validateName(value) }))
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, country.digits)
    setPhone(value)
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: validatePhone(value, country) }))
  }

  const handleCountryChange = (nextCode) => {
    const nextCountry = countries.find((c) => c.code === nextCode)
    setCountryCode(nextCode)
    const trimmedPhone = phone.slice(0, nextCountry.digits)
    setPhone(trimmedPhone)
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: validatePhone(trimmedPhone, nextCountry) }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nameError = validateName(name)
    const phoneError = validatePhone(phone, country)
    const emailError = validateEmail(email)

    const nextErrors = { name: nameError, phone: phoneError, email: emailError }
    setErrors(nextErrors)

    if (nameError || phoneError || emailError) return

    setSubmitted(true)
  }

  return (
    <section className="contact-section" id="contact" ref={sectionRef}>
      <div className="contact-header">
        <span className="contact-eyebrow">
          <span className="contact-eyebrow-dot" />
          Contact
        </span>
        <h2>Let's Build Something Together</h2>
        <p>Have a project in mind, or just exploring? Reach out and our team will get back to you.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info">
          {infoCards.map((card, i) => (
            <div className="contact-info-card" key={card.id} ref={(el) => (cardRefs.current[i] = el)}>
              <span className="contact-info-icon">{card.icon}</span>
              <div className="contact-info-text">
                <span className="contact-info-label">{card.label}</span>
                {card.lines.map((line) =>
                  line.href ? (
                    <a className="contact-info-line contact-info-line--link" href={line.href} key={line.text}>
                      {line.text}
                    </a>
                  ) : (
                    <span className="contact-info-line" key={line.text}>
                      {line.text}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}

          <div className="contact-map" ref={mapRef}>
            <iframe
              title="MS Developers location"
              src="https://www.google.com/maps?q=Marian+Paradise+Plaza,+Bunts+Hostel+Road,+Mangalore&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="contact-map-caption"
              href="https://www.google.com/maps/search/?api=1&query=Marian+Paradise+Plaza,+Bunts+Hostel+Road,+Mangalore"
              target="_blank"
              rel="noreferrer"
            >
              <span>Bunts Hostel Road, Mangalore</span>
              <span className="contact-map-caption-link">Get Directions →</span>
            </a>
          </div>
        </div>

        <div className="contact-form-wrapper" ref={formRef}>
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3>Message sent</h3>
              <p>Thanks for reaching out — our team will get back to you shortly.</p>
              <button
                type="button"
                className="contact-btn"
                onClick={() => {
                  setSubmitted(false)
                  setName('')
                  setPhone('')
                  setEmail('')
                  setMessage('')
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="contact-name">
                  Name <span className="contact-required">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validateName(name) }))}
                  placeholder="Your full name"
                  className={errors.name ? 'has-error' : ''}
                />
                {errors.name && <span className="contact-error">{errors.name}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-phone">
                  Phone Number <span className="contact-required">*</span>
                </label>
                <div className="contact-phone-row">
                  <CountrySelect value={countryCode} onChange={handleCountryChange} />
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={() => setErrors((prev) => ({ ...prev, phone: validatePhone(phone, country) }))}
                    placeholder={`${country.digits}-digit number`}
                    className={errors.phone ? 'has-error' : ''}
                  />
                </div>
                {errors.phone && <span className="contact-error">{errors.phone}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
                  placeholder="you@example.com"
                  className={errors.email ? 'has-error' : ''}
                />
                {errors.email && <span className="contact-error">{errors.email}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're looking for"
                  rows={4}
                />
              </div>

              <button type="submit" className="contact-btn">
                Send Message
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>
              <p className="contact-form-note">We usually respond within 24 hours.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default ContactSection
