## 2024-05-24 - CSP Inline Styles and Meta Tag
**Vulnerability:** Inline styles (e.g. `style="display: none;"`) require `'unsafe-inline'` in `style-src`.
**Learning:** Even simple inline styles block strict CSP. `frame-ancestors` is ignored in meta tags.
**Prevention:** Move all inline styles to CSS files and remove `frame-ancestors` from meta tags.
