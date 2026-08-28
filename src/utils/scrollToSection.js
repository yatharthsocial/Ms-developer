// Native `<a href="#id">` hash navigation has been unreliable on iOS
// Safari on this page specifically — it has a lot of very tall,
// scroll-jacked pinned sections above most targets (Amenities, Gallery),
// and Safari has a history of landing short/long on hash jumps in pages
// like that, especially on newer versions. Driving the scroll explicitly
// via scrollIntoView sidesteps the browser's own hash-jump handling
// entirely, the same fix already applied to the hero video's source
// selection (see HeroSection.jsx) for a different iOS-only bug.
export function scrollToSection(event, id) {
  const el = document.getElementById(id)
  if (!el) return

  event.preventDefault()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
