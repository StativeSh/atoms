## 2026-02-28 - [DOM Clobbering / XSS via innerHTML]
**Vulnerability:** Found uses of innerHTML assigning values constructed directly from object properties without escaping, which could lead to DOM Clobbering or XSS if the data source becomes polluted or user-controlled (e.g., `bondInfo.innerHTML = ... ${mol.name}`).
**Learning:** Even static object configurations can become vectors for attacks if they are modified at runtime or updated from external sources. Defensive programming requires escaping variables before interpolation into `innerHTML`, or using `textContent` and proper DOM node creation.
**Prevention:** Use a simple HTML escaper function for any variable interpolated into template literals that are assigned to `innerHTML`, or use `textContent` where applicable.
