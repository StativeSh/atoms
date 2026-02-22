## 2024-05-22 - Inline Styles and innerHTML CSP Violation
**Vulnerability:** The codebase used inline styles in HTML and `innerHTML` with `style='...'` in JavaScript, preventing the implementation of a strict Content Security Policy (CSP).
**Learning:** Even static sites can have security gaps if they rely on patterns that necessitate `'unsafe-inline'`. Refactoring `innerHTML` to use `document.createElement` allows for a much stricter policy without breaking functionality.
**Prevention:** Always prefer `document.createElement` and direct property manipulation (e.g., `element.style.color = ...`) over `innerHTML` strings containing styles.
