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
- `shared.js` — Single source of truth for all 118 elements (properties, electronegativity, covalent radii, bond energies, reduction potentials, categories). Loaded by every module that needs element data (`mol3d.html` too).
- `ui.css` — The one design system for every page except the landing page: light tokens, liquid-glass classes, nav pill, form controls, panel/stage primitives. Each tool's own `*.css` only handles its layout and uses these tokens.
- `nav.js` — Injects the glass navigation pill (brand, page name, Tools menu, Home) into `.top-nav`; creates the element if a page lacks one.
- `export.js` — Cross-module export (image download); adds the Export button to the nav.
- `explain.js` — Shared explain mode (the "Explain" pill and tooltips). Tools register elements with `ChemExplain.register(selector, title, html)`; guard with `typeof ChemExplain !== 'undefined'` (it is a top-level `const`, so it is not on `window`).

### Landing page
- `index.html` is a **self-contained** single-page site (inline CSS, no `ui.css`/`nav.js`) with the same light design tokens as `ui.css`. Its images live in `media/` (real screenshots of the tools, a looping lattice video, and blurred "aura" copies).
- To refresh a screenshot, re-capture the tool page (Playwright, 1440x900 at 2x) and re-crop it to the same aspect ratio as the file it replaces.

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
| Crystal Viewer | `crystal` | Canvas 2D, SC/BCC/FCC/HCP/Diamond |
| Mechanisms | `mechanisms` | Canvas 2D, 6 mechanisms (SN1/SN2/E1/E2, addition, esterification) |
| Titration | `titration` | Canvas chart, Ka/Kb, pH curves |
| Electrochemistry | `electrochem` | Canvas animation, Nernst equation |

### Rendering
- **Three.js** (CDN import map) for the 3D modules (`mol3d`, `viewer`/`main.js`).
- **HTML5 Canvas 2D** + `requestAnimationFrame` for all 2D modules.
- No server backend — all chemistry calculations run in the browser.

### Design System (ui.css)
- Light, calm, one accent hue (`--accent` #2F5BEA). No dark mode. Tools sit in white framed "stage" cards; controls are white panels; glass (`.glass`, `.glass-dark`) floats over soft colour.
- Fonts: `Inter Tight` (headings), `Inter` (body), `JetBrains Mono` (code and data).
- Canvas and WebGL colours are hard-coded in each tool's JS and use the same palette (ink `#1D1D1F`, muted `#6E6E73`, accent `#2F5BEA`). Canvas `font` strings need a generic fallback (`, sans-serif`) or they render serif until the web font loads.
- Chemistry data colours (`--data-*`, `--cat-*`) are for dots, bars and tiles. For small *text* use the `--text-*` variants (>= 4.5:1).
- The orbital viewer uses normal (not additive) blending with a light-ground density ramp; the old dark "premium" theme (`premium.js`/`premium.css`) was removed.

## Capacitor / Android
- App ID: `com.stativesh.chemverse`
- `capacitor.config.json` sets `webDir: "www"`.
- No native Capacitor plugins are used — the app is a pure WebView wrapper.
