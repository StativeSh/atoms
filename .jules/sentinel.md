## 2024-05-22 - Strict CSP Implementation
**Vulnerability:** Lack of Content Security Policy (CSP) allowing potential XSS and data exfiltration.
**Learning:** `innerHTML` with `style` attributes (e.g., `<div style="background:...">`) is blocked by strict CSP `style-src`. Inline import maps require a SHA-256 hash in `script-src`.
**Prevention:** Use `document.createElement` and set `element.style.property` for dynamic styles. Compute hashes for inline scripts.
