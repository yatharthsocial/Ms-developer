import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './EnquiryModal.css'

const countries = [
  { code: 'IN', name: 'India', dial: '+91', digits: 10 },
  { code: 'US', name: 'United States', dial: '+1', digits: 10 },
  { code: 'GB', name: 'United Kingdom', dial: '+44', digits: 10 },
  { code: 'AE', name: 'UAE', dial: '+971', digits: 9 },
  { code: 'AU', name: 'Australia', dial: '+61', digits: 9 },
  { code: 'SG', name: 'Singapore', dial: '+65', digits: 8 },
]

const NAME_REGEX = /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/

function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = countries.find((c) => c.code === value)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="country-select" ref={rootRef}>
      <button
        type="button"
        className={`country-select-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="country-select-dial">{selected.dial}</span>
        <span className="country-select-name">{selected.code}</span>
        <svg className="country-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <ul className={`country-select-list ${open ? 'is-open' : ''}`} role="listbox">
        {countries.map((c) => (
          <li key={c.code}>
            <button
              type="button"
              className={`country-select-option ${c.code === value ? 'is-selected' : ''}`}
              onClick={() => {
                onChange(c.code)
                setOpen(false)
              }}
              role="option"
              aria-selected={c.code === value}
            >
              <span className="country-select-option-dial">{c.dial}</span>
              <span>{c.name}</span>
              {c.code === value && (
                <svg className="country-select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EnquiryModal({ villa, onClose }) {
  const [name, setName] = useState('')
  const [countryCode, setCountryCode] = useState('IN')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useRef(null)

  const country = countries.find((c) => c.code === countryCode)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.querySelector('input')?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const validateName = (value) => {
    if (!value.trim()) return 'Name is required'
    if (!NAME_REGEX.test(value.trim())) return 'Letters only, no numbers or special characters'
    return ''
  }

  const validatePhone = (value, c) => {
    if (!value) return 'Phone number is required'
    if (!/^\d+$/.test(value)) return 'Digits only'
    if (value.length !== c.digits) return `Enter a valid ${c.digits}-digit number for ${c.name}`
    return ''
  }

  const validateEmail = (value) => {
    if (!value) return ''
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    return ok ? '' : 'Enter a valid email address'
  }

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

  return createPortal(
    <div className="enquiry-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="enquiry-modal" role="dialog" aria-modal="true" ref={dialogRef}>
        <button type="button" className="enquiry-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {submitted ? (
          <div className="enquiry-success">
            <div className="enquiry-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3>Thank you</h3>
            <p>
              Your enquiry about {villa?.name || 'this villa'} has been received. Our team will get
              back to you shortly.
            </p>
            <button type="button" className="enquiry-btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <span className="enquiry-eyebrow">Enquire Now</span>
            <h3>{villa?.name || 'Villa Enquiry'}</h3>
            <p className="enquiry-subtitle">Share your details and we'll get in touch.</p>

            <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
              <div
                className="enquiry-field"
                style={{ '--field-delay': '0ms' }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('is-settled')}
              >
                <label htmlFor="enquiry-name">
                  Name <span className="enquiry-required">*</span>
                </label>
                <input
                  id="enquiry-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validateName(name) }))}
                  placeholder="Your full name"
                  className={errors.name ? 'has-error' : ''}
                />
                {errors.name && <span className="enquiry-error">{errors.name}</span>}
              </div>

              <div
                className="enquiry-field"
                style={{ '--field-delay': '60ms' }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('is-settled')}
              >
                <label htmlFor="enquiry-phone">
                  Phone Number <span className="enquiry-required">*</span>
                </label>
                <div className="enquiry-phone-row">
                  <CountrySelect value={countryCode} onChange={handleCountryChange} />
                  <input
                    id="enquiry-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={() => setErrors((prev) => ({ ...prev, phone: validatePhone(phone, country) }))}
                    placeholder={`${country.digits}-digit number`}
                    className={errors.phone ? 'has-error' : ''}
                  />
                </div>
                {errors.phone && <span className="enquiry-error">{errors.phone}</span>}
              </div>

              <div
                className="enquiry-field"
                style={{ '--field-delay': '120ms' }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('is-settled')}
              >
                <label htmlFor="enquiry-email">Email</label>
                <input
                  id="enquiry-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
                  placeholder="you@example.com"
                  className={errors.email ? 'has-error' : ''}
                />
                {errors.email && <span className="enquiry-error">{errors.email}</span>}
              </div>

              <div
                className="enquiry-field"
                style={{ '--field-delay': '180ms' }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('is-settled')}
              >
                <label htmlFor="enquiry-message">Message</label>
                <textarea
                  id="enquiry-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're looking for"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="enquiry-btn"
                style={{ '--field-delay': '240ms' }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('is-settled')}
              >
                Submit Enquiry
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

export default EnquiryModal
