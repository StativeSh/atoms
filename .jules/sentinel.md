## 2024-10-26 - Securing Static SPAs with Import Maps

**Vulnerability:** Static sites using `<script type="importmap">` (like this Three.js project) cannot use `script-src` nonces easily without a backend to generate them. This often leads to using `'unsafe-inline'`, which weakens CSP.

**Learning:** Import maps are treated as inline scripts by CSP. To secure them without `'unsafe-inline'`, we must calculate the SHA-256 hash of the exact script content (including whitespace) and include it in `script-src`. This allows the specific import map to execute while blocking other inline scripts.

**Prevention:**
- Avoid `'unsafe-inline'` for `script-src` even in static sites.
- Use `sha256-<hash>` for static inline scripts like import maps.
- Ensure the build/deploy process (or manual edit) preserves the exact whitespace of hashed scripts.
