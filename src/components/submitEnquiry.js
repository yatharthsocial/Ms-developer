const SHEET_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

// Google Apps Script web apps don't return CORS headers we can read, so this
// fires the request in 'no-cors' mode and never inspects the response — the
// row still gets appended server-side, we just can't confirm it from here.
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

  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
    .then(() => {
      if (import.meta.env.DEV) {
        console.log(
          '[submitEnquiry] request sent (response is opaque under no-cors, so this does not confirm the row was written):',
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
