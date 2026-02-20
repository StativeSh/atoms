## 2024-05-22 - [CSP Implementation in Static Site]
**Vulnerability:** Lack of Content Security Policy allowed potential XSS if future vulnerabilities were introduced.
**Learning:** In a static site using external CDNs and inline scripts (importmap), CSP requires careful hashing of inline scripts and refactoring of `innerHTML` with style attributes to avoiding 'unsafe-inline'.
**Prevention:** Always use `document.createElement` for dynamic content generation instead of `innerHTML` to remain CSP compliant. Calculate hashes for necessary inline scripts like import maps.
