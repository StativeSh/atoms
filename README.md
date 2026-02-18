# ⚛️ Quantum Atomic Model

An interactive 3D visualization of atomic orbitals built with **Three.js**, showing electron probability density clouds using quantum mechanical wavefunctions.

🌐 **[Live Demo →](https://stativesh.github.io/atoms/)**

![Quantum Atomic Model](https://img.shields.io/badge/Physics-Quantum%20Mechanics-blueviolet) ![Three.js](https://img.shields.io/badge/3D-Three.js-black) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- **Accurate Wavefunctions** — Hydrogen-like radial probability distributions with proper Laguerre polynomials
- **Heatmap Coloring** — Probability density mapped to a purple → magenta → orange → white gradient
- **All Orbital Types** — s, p, d, and f orbitals with correct angular distributions
- **Dense Point Clouds** — 5,000 particles per electron create a continuous-looking probability field
- **Crisp Nodal Regions** — Angular rejection sampling ensures clean nodal planes and radial nodes
- **Interactive Controls** — Select any element (H–Og), highlight individual subshells, adjust density
- **Individual Orbital View** — Inspect each orbital (px, py, pz, dxy, etc.) separately
- **Smooth Animations** — Particles gently oscillate to represent quantum uncertainty

## 🎮 Controls

| Action | Input |
|---|---|
| **Rotate** | Left-click drag |
| **Pan** | Right-click drag |
| **Zoom** | Scroll wheel |
| **Inspect** | Click on orbital |

## 🧪 Orbital Types Visualized

| Orbital | Shape | Nodes |
|---|---|---|
| **s** | Spherical | Radial only |
| **p** | Dumbbell (2 lobes) | 1 nodal plane |
| **d** | Cloverleaf (4 lobes) / Donut | 2 nodal planes |
| **f** | Multi-lobed (6-8 lobes) | 3 nodal planes |

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/StativeSh/atoms.git
cd atoms

# Serve with any HTTP server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## 🛠️ Tech Stack

- **Three.js** — 3D rendering and particle systems
- **Vanilla JavaScript** — Quantum mechanical calculations (radial probability, spherical harmonics)
- **HTML/CSS** — Responsive UI with glassmorphism design

## 📐 Physics

The visualization uses hydrogen-like wavefunctions:

**Ψ(r,θ,φ) = R(r) · Y(θ,φ)**

- **Radial part R(r)**: Computed using associated Laguerre polynomials with rejection sampling
- **Angular part Y(θ,φ)**: Spherical harmonics implemented via angular rejection sampling
- **Probability density |Ψ|²**: Mapped to particle density and heatmap color

---

Made with ❤️ by [@StativeSh](https://github.com/StativeSh)
