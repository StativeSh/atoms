## 2024-03-27 - Inline Import Map and CSP
**Vulnerability:** Inline scripts (import map) are blocked by strict Content Security Policy unless 'unsafe-inline' is used or a hash is provided.
**Learning:** Import maps are scripts. To secure them without 'unsafe-inline', we must calculate their SHA-256 hash. The hash must be calculated on the exact content inside the script tags, including whitespace.
**Prevention:** Always verify script content exactly when generating CSP hashes, or move import maps to external files if supported by the target environment.
