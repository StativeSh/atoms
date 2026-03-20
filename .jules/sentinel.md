## 2024-05-24 - [DOM-based XSS via URIs]
**Vulnerability:** A vulnerability to DOM-based XSS was found where `window.location.href = href` was protected using `href.startsWith('javascript')`.
**Learning:** `String.prototype.startsWith` is insufficient for sanitizing URIs assigned to executable contexts (like `location.href` or `<a href>`). Attackers can easily bypass it by using leading whitespaces (` javascript:alert(1)`), varying cases (`JAVASCRIPT:alert(1)`), or `data:` URIs containing malicious scripts.
**Prevention:** Use a robust regular expression to validate and block malicious URIs: `/^\s*(javascript|data)\s*:/i.test(href)`. This correctly handles whitespace padding, case-insensitivity, and both `javascript:` and `data:` protocols.
