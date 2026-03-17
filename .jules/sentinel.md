
## 2026-03-17 - [DOM XSS] Whitespace Bypass in `window.location.href` assignments
**Vulnerability:** A DOM-based XSS existed in `premium.js`. The intercept links functionality prevented `javascript:` execution by checking `href.startsWith('javascript')`. This was bypassed via leading whitespaces (e.g. ` javascript:alert(1)`) or `data:` URIs, allowing arbitrary script execution on navigation.
**Learning:** `startsWith` is insufficient for validating URL protocols, as browser parsers trim leading whitespace for URIs, defeating exact prefix matching.
**Prevention:** Use a case-insensitive regular expression (e.g., `/^\s*(javascript|data)\s*:/i.test(href)`) to safely validate URIs before assigning them to `window.location.href`.
