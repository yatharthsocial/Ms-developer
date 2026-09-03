const SHEET_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

// Google Apps Script web apps don't return CORS headers we can read, so this
// never inspects the response — the row still gets appended server-side, we
// just can't confirm it from here.
export function submitEnquiry(data) {
  if (!SHEET_URL) {
    if (import.meta.env.DEV) {
      console.error(
        '[submitEnquiry] VITE_GOOGLE_SCRIPT_URL is not set — skipping submission. Add it to .env.local and restart the dev server.'
      )
    }
    return
  }

  const payload = { timestamp: new Date().toISOString(), ...data }
  const body = JSON.stringify(payload)

  // sendBeacon first, not fetch: the villa enquiry form (EnquiryModal.jsx)
  // opens a brochure PDF in a new tab right after calling this, which
  // blurs/backgrounds the current tab — and recent iOS Safari versions
  // suspend a backgrounded tab's network activity aggressively enough to
  // kill an in-flight fetch() before the request actually leaves the
  // device. That's why villa enquiries were silently failing to reach the
  // sheet on newer iPhones specifically (giving the brochure link its own
  // target="_blank" wasn't enough — opening any new tab still blurs this
  // one) while the plain contact form, which never triggers a tab switch,
  // worked fine with fetch. sendBeacon is built exactly for this case: the
  // browser guarantees delivery independent of what happens to the page
  // right after the call returns.
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const queued = navigator.sendBeacon(SHEET_URL, blob)
    if (queued) {
      if (import.meta.env.DEV) {
        console.log('[submitEnquiry] queued via sendBeacon:', payload)
      }
      return
    }
    // sendBeacon returns false if it couldn't queue the request (e.g. the
    // payload is over its ~64KB limit, which won't happen here in
    // practice) — fall through to fetch as a backup.
  }

  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
  })
    .then(() => {
      if (import.meta.env.DEV) {
        console.log(
          '[submitEnquiry] request sent via fetch (response is opaque under no-cors, so this does not confirm the row was written):',
          payload
        )
      }
    })
    .catch((err) => {
      if (import.meta.env.DEV) {
        console.error('[submitEnquiry] fetch failed:', err)
      }
    })
}
