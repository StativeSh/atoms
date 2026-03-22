## 2026-03-22 - Prevent DOM XSS via intercepted padded URIs
**Vulnerability:** DOM-based XSS when assigning intercepted links to `window.location.href` bypassing simple `startsWith('javascript')` validation with leading whitespace (` javascript:`).
**Learning:** Application intercepts navigational links application-wide. Naive validation fails against encoded/padded `javascript:` and `data:` URIs. It is critical to enforce regex checks AND explicitly call `e.preventDefault()` before returning early; otherwise the browser processes the dangerous link natively.
**Prevention:** Use `/^\s*(javascript|data)\s*:/i.test(href)` combined with `e.preventDefault()` whenever intercepting and rewriting routing state.
