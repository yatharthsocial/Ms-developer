const NAME_REGEX = /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/

export function validateName(value) {
  if (!value.trim()) return 'Name is required'
  if (!NAME_REGEX.test(value.trim())) return 'Letters only, no numbers or special characters'
  return ''
}

export function validatePhone(value, country) {
  if (!value) return 'Phone number is required'
  if (!/^\d+$/.test(value)) return 'Digits only'
  if (value.length !== country.digits) return `Enter a valid ${country.digits}-digit number for ${country.name}`
  return ''
}

export function validateEmail(value) {
  if (!value) return ''
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  return ok ? '' : 'Enter a valid email address'
}
