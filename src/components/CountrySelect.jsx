import { useEffect, useMemo, useRef, useState } from 'react'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min'

// Regional-indicator flag emoji from an ISO 3166-1 alpha-2 code, e.g. 'IN' -> 🇮🇳
function flagEmoji(code) {
  return code.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null

export const countries = getCountries()
  .map((code) => ({
    code,
    name: regionNames?.of(code) || code,
    dial: `+${getCountryCallingCode(code)}`,
    flag: flagEmoji(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const searchRef = useRef(null)
  const selected = countries.find((c) => c.code === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    searchRef.current?.focus()
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
        title={selected.name}
      >
        <span className="country-select-flag" aria-hidden="true">{selected.flag}</span>
        <span className="country-select-dial">{selected.dial}</span>
        <svg className="country-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`country-select-list ${open ? 'is-open' : ''}`}>
        <input
          ref={searchRef}
          type="text"
          className="country-select-search"
          placeholder="Search country or code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="country-select-options" role="listbox">
          {filtered.map((c) => (
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
                <span className="country-select-option-flag" aria-hidden="true">{c.flag}</span>
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
          {filtered.length === 0 && <li className="country-select-empty">No matches</li>}
        </ul>
      </div>
    </div>
  )
}

export default CountrySelect
