## 2024-03-01 - [DOM XSS]
**Vulnerability:** DOM-based XSS via `window.location.href` assignment in `premium.js` link interception.
**Learning:** `startsWith('javascript')` is insufficient for validating URL scheme prefixes because attackers can pad the scheme with whitespaces (e.g. `   javascript:alert(1)`) or use `data:` URIs.
**Prevention:** Rigorous regex validation `/^\s*(javascript|data)\s*:/i.test(href)` should be used whenever dynamically routing URLs, especially for assignments to `window.location.href`.
