## 2026-03-01 - [XSS] Fix Unsanitized `innerHTML` Injections
**Vulnerability:** Several points in the codebase inject data, such as element properties, directly into the DOM using `innerHTML` and template literals without sanitization. This is a vector for Cross-Site Scripting (XSS).
**Learning:** In vanilla JS projects without a templating engine (like React/Vue), all manual DOM updates utilizing `innerHTML` or `insertAdjacentHTML` are high-risk locations for XSS if they include variables originating from outside of the immediate scope, even if those variables are currently sourced from "safe" local data files.
**Prevention:** Implement a global `escapeHTML` utility function (e.g. in `shared.js`) and ensure it wraps all dynamic data interpolation within `innerHTML` string assignments.
