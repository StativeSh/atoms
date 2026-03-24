## 2024-03-24 - Intercept Links javascript URI bypass
**Vulnerability:** `premium.js` intercepting link click checks for `href.startsWith('javascript')` to avoid XSS execution via `window.location.href = href`. However, it can be bypassed using whitespace like ` javascript:`, since `.startsWith()` checks the literal string.
**Learning:** Checking for safe URL schemes must be rigorous. `javascript:` or `data:` URIs can have leading whitespaces which are valid in HTML and parsed by browsers as the protocol.
**Prevention:** Use regex `/^\s*(javascript|data)\s*:/i` to check for these schemes, and ALWAYS call `e.preventDefault()` if returning early when blocking a bad link or falling back to default browser behavior, otherwise the browser will still execute the XSS payload.
