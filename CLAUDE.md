# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ChemVerse** is an interactive chemistry education web application with Android support via Capacitor. It is pure vanilla JavaScript — no framework, no bundler, no transpiler.

## Commands

### Local Development
```bash
# Serve locally (from project root or www/)
python3 -m http.server 8080
```

### Android Build
```bash
# Copy root source files into www/ for Capacitor
./build_android.sh

# Build Android APK
cd android && ./gradlew build

# Or via Capacitor CLI
npx cap build android
```

### No test suite is defined.

## Architecture

### Source vs. Deploy
- Root-level `*.html`, `*.js`, `*.css` are the **source files** you edit.
- `www/` is the **build output** populated by `build_android.sh` (copy of root files). Capacitor loads `www/` as its WebView.
- Never edit files inside `www/` directly — they are overwritten on each build.

### Shared Layer
- `shared.js` — Single source of truth for all 118 elements (properties, electronegativity, covalent radii, bond energies, reduction potentials, categories). Loaded by every module.
- `shared.css` — Full design system: dark theme, glassmorphism utilities, element category colors, fluid typography (`clamp()`).
- `nav.js` — Navigation bar component injected into every page.
- `export.js` — Cross-module export (SVG/image/canvas download).
- `premium.js` — Premium feature gating logic.
- `explain.js` — Shared educational explanation popups (D3 explain mode).

### Module Pattern
Each chemistry tool is a **self-contained HTML + JS + CSS triplet** (e.g., `reaction-lab.html`, `reaction-lab.js`, `reaction-lab.css`). Modules share `shared.js` for data but manage their own state entirely in local JS variables.

### Chemistry Modules
| Module | File prefix | Key technique |
|--------|-------------|---------------|
| Periodic Table | `periodic-table` | SVG/DOM element grid |
| 3D Molecular Viewer | `mol3d` | Three.js, CPK/space-fill/ball-stick |
| Reaction Lab | `reaction-lab` | Canvas 2D drag-drop, Pauling ΔH |
| Spectroscopy | `spectroscopy` | Canvas chart, IR/UV-Vis databases |
| Organic Builder | `organic` | Canvas 2D, IUPAC naming, VSEPR |
| Crystal Viewer | `crystal` | Three.js, BCC/FCC/HCP/Diamond |
| Mechanisms | `mechanisms` | Canvas 2D, SN1/SN2/E1/E2 arrows |
| Titration | `titration` | Canvas chart, Ka/Kb, pH curves |
| Electrochemistry | `electrochem` | Canvas animation, Nernst equation |

### Rendering
- **Three.js** (CDN `<script>` tag) for all 3D modules (`mol3d`, `crystal`).
- **HTML5 Canvas 2D** + `requestAnimationFrame` for all 2D modules.
- No server backend — all chemistry calculations run in the browser.

### Design System (shared.css)
- Dark theme with indigo/purple/magenta accent palette.
- Glassmorphism: `backdrop-filter: blur()` on panels/cards.
- Fonts: `Outfit` (headers), `Inter` (body), `JetBrains Mono` (code), `Orbitron` (tech labels).
- Element categories each have a dedicated CSS color variable.

## Capacitor / Android
- App ID: `com.stativesh.chemverse`
- `capacitor.config.json` sets `webDir: "www"`.
- No native Capacitor plugins are used — the app is a pure WebView wrapper.
