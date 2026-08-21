import { useEffect, useRef, useState } from 'react'

export const countries = [
  { code: 'IN', name: 'India', dial: '+91', digits: 10 },
  { code: 'US', name: 'United States', dial: '+1', digits: 10 },
  { code: 'GB', name: 'United Kingdom', dial: '+44', digits: 10 },
  { code: 'AE', name: 'UAE', dial: '+971', digits: 9 },
  { code: 'AU', name: 'Australia', dial: '+61', digits: 9 },
  { code: 'SG', name: 'Singapore', dial: '+65', digits: 8 },
]

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

export default CountrySelect
