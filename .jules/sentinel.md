## 2025-01-20 - Fix DOM-based XSS in Link Interception
**Vulnerability:** A DOM-based Cross-Site Scripting (XSS) vulnerability existed in `premium.js` where link interception logic failed to securely block malicious URIs. Specifically, `href.startsWith('javascript')` could be bypassed using whitespace (e.g., ` javascript:alert(1)`), and `data:` URIs were not blocked at all. Furthermore, the check didn't call `e.preventDefault()`, allowing the browser to natively execute the payload.
**Learning:** Simple string prefix checks (like `startsWith`) are insufficient for validating URLs because browsers are lenient and will strip leading whitespace before executing protocol handlers. Additionally, security checks must explicitly block execution (via `e.preventDefault()`) rather than just exiting the custom script logic.
**Prevention:** Always use rigorous regular expressions (e.g., `/^\s*(javascript|data)\s*:/i`) to validate user-controlled or intercepted URLs against potentially executable schemes. Separate security intercept logic from normal control flow, ensuring that malicious attempts are actively stopped (`e.preventDefault()`) before returning.

## 2026-10-10 - Control Character Protocol Scheme Bypass
**Vulnerability:** XSS payload `\x01javascript:alert(1)` executed because the link interception logic in `premium.js` only checked for simple regex `^\s*javascript:` ignoring control characters.
**Learning:** Browsers natively strip control characters (`\x00-\x1F`) before parsing standard protocol schemes like `javascript:`, bypassing standard whitespace regex checks like `\s`.
**Prevention:** Always sanitize inputs by aggressively stripping all whitespace and control characters `[\s\x00-\x1F]` before validating or interpreting URI schemes.
