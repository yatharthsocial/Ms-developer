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

  // Gallery opens with a tall scroll-pinned intro stage that slides its
  // heading in from the right over ~1 viewport of scroll, then reveals
  // the filter pills and grid (see GallerySection.jsx). Landing on the
  // plain #gallery top drops the visitor onto a blank pre-animation
  // frame — heading still off-screen, grid still at opacity 0 — and they
  // have to scroll through the whole dwell before the section shows
  // anything. For a nav/footer click we want it there immediately, so
  // skip straight past the intro dwell: land with the heading fully in
  // and the pills + first row of tiles already on screen.
  if (id === 'gallery') {
    const stage = el.querySelector('.gallery-intro-stage')
    const pin = el.querySelector('.gallery-intro-pin')
    if (stage && pin) {
      const stageTop = window.scrollY + stage.getBoundingClientRect().top
      // stage height is `calc(dwell vh + 100svh)`, pin height is 100svh —
      // the difference is exactly the dwell distance in real px, whatever
      // vh resolved to on this device (same trick as AmenitiesSection.jsx).
      const dwellPx = stage.offsetHeight - pin.offsetHeight
      window.scrollTo({ top: stageTop + dwellPx + window.innerHeight * 0.55, behavior: 'smooth' })
      return
    }
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
