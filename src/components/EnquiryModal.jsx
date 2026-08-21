import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CountrySelect, { countries } from './CountrySelect'
import { validateEmail, validateName, validatePhone } from './formValidation'
import './EnquiryModal.css'

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

    if (villa?.brochure) {
      const link = document.createElement('a')
      link.href = villa.brochure
      link.download = villa.brochureName || `${villa.name}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
          <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="enquiry-scroll">
              <span className="enquiry-eyebrow">Enquire Now</span>
              <h3>{villa?.name || 'Villa Enquiry'}</h3>
              <p className="enquiry-subtitle">Share your details and we'll get in touch.</p>

              <div className="enquiry-fields">
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
              </div>
            </div>

            <div className="enquiry-footer">
              <button
                type="submit"
                className="enquiry-btn"
                style={{ '--field-delay': '240ms' }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('is-settled')}
              >
                Submit Enquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}

export default EnquiryModal
