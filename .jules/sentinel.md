## 2025-02-18 - [Inline Import Map CSP]
**Vulnerability:** Inline import maps in static sites require 'unsafe-inline' or hashes in CSP.
**Learning:** Browsers require the hash of the *exact* text content of the script tag, including whitespace.
**Prevention:** Use a script to calculate the SHA-256 hash of the import map content and add it to 'script-src'.
