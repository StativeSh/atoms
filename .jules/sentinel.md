## 2025-01-20 - Fix DOM-based XSS in Link Interception
**Vulnerability:** A DOM-based Cross-Site Scripting (XSS) vulnerability existed in `premium.js` where link interception logic failed to securely block malicious URIs. Specifically, `href.startsWith('javascript')` could be bypassed using whitespace (e.g., ` javascript:alert(1)`), and `data:` URIs were not blocked at all. Furthermore, the check didn't call `e.preventDefault()`, allowing the browser to natively execute the payload.
**Learning:** Simple string prefix checks (like `startsWith`) are insufficient for validating URLs because browsers are lenient and will strip leading whitespace before executing protocol handlers. Additionally, security checks must explicitly block execution (via `e.preventDefault()`) rather than just exiting the custom script logic.
**Prevention:** Always use rigorous regular expressions (e.g., `/^\s*(javascript|data)\s*:/i`) to validate user-controlled or intercepted URLs against potentially executable schemes. Separate security intercept logic from normal control flow, ensuring that malicious attempts are actively stopped (`e.preventDefault()`) before returning.

## 2024-10-15 - [XSS Bypass via Control Characters]
**Vulnerability:** XSS validation logic in link click handlers was bypassed by prepending control characters (e.g., `\x01`) to the URL protocol scheme.
**Learning:** Modern browsers actively strip control characters (`\x00-\x1F`) and whitespace before interpreting URI protocol schemes. Simple `startsWith` or basic regex (`/^\s*javascript:/`) fail to catch payloads like `\x01javascript:alert(1)`.
**Prevention:** Always strip all whitespace and control characters from URLs using `href.replace(/[\s\x00-\x1F]/g, '')` before validating the protocol scheme.
