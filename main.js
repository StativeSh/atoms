// ============================================
//  Quantum Mechanical Atomic Model Viewer
//  Faithful to quantum mechanics: probability
//  density clouds, s/p/d/f orbital shapes,
//  Aufbau filling order, quantum numbers
// ============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Element Data ────────────────────────────────────────────────
const ELEMENTS = {};
const ELEMENT_LIST = [
    { z: 1, symbol: 'H', name: 'Hydrogen', neutrons: 0 },
    { z: 2, symbol: 'He', name: 'Helium', neutrons: 2 },
    { z: 3, symbol: 'Li', name: 'Lithium', neutrons: 4 },
    { z: 4, symbol: 'Be', name: 'Beryllium', neutrons: 5 },
    { z: 5, symbol: 'B', name: 'Boron', neutrons: 6 },
    { z: 6, symbol: 'C', name: 'Carbon', neutrons: 6 },
    { z: 7, symbol: 'N', name: 'Nitrogen', neutrons: 7 },
    { z: 8, symbol: 'O', name: 'Oxygen', neutrons: 8 },
    { z: 9, symbol: 'F', name: 'Fluorine', neutrons: 10 },
    { z: 10, symbol: 'Ne', name: 'Neon', neutrons: 10 },
    { z: 11, symbol: 'Na', name: 'Sodium', neutrons: 12 },
    { z: 12, symbol: 'Mg', name: 'Magnesium', neutrons: 12 },
    { z: 13, symbol: 'Al', name: 'Aluminum', neutrons: 14 },
    { z: 14, symbol: 'Si', name: 'Silicon', neutrons: 14 },
    { z: 15, symbol: 'P', name: 'Phosphorus', neutrons: 16 },
    { z: 16, symbol: 'S', name: 'Sulfur', neutrons: 16 },
    { z: 17, symbol: 'Cl', name: 'Chlorine', neutrons: 18 },
    { z: 18, symbol: 'Ar', name: 'Argon', neutrons: 22 },
    { z: 19, symbol: 'K', name: 'Potassium', neutrons: 20 },
    { z: 20, symbol: 'Ca', name: 'Calcium', neutrons: 20 },
    { z: 21, symbol: 'Sc', name: 'Scandium', neutrons: 24 },
    { z: 22, symbol: 'Ti', name: 'Titanium', neutrons: 26 },
    { z: 23, symbol: 'V', name: 'Vanadium', neutrons: 28 },
    { z: 24, symbol: 'Cr', name: 'Chromium', neutrons: 28 },
    { z: 25, symbol: 'Mn', name: 'Manganese', neutrons: 30 },
    { z: 26, symbol: 'Fe', name: 'Iron', neutrons: 30 },
    { z: 27, symbol: 'Co', name: 'Cobalt', neutrons: 32 },
    { z: 28, symbol: 'Ni', name: 'Nickel', neutrons: 31 },
    { z: 29, symbol: 'Cu', name: 'Copper', neutrons: 35 },
    { z: 30, symbol: 'Zn', name: 'Zinc', neutrons: 35 },
    { z: 31, symbol: 'Ga', name: 'Gallium', neutrons: 39 },
    { z: 32, symbol: 'Ge', name: 'Germanium', neutrons: 41 },
    { z: 33, symbol: 'As', name: 'Arsenic', neutrons: 42 },
    { z: 34, symbol: 'Se', name: 'Selenium', neutrons: 45 },
    { z: 35, symbol: 'Br', name: 'Bromine', neutrons: 45 },
    { z: 36, symbol: 'Kr', name: 'Krypton', neutrons: 48 },
];
ELEMENT_LIST.forEach(el => { ELEMENTS[el.z] = el; });

// ─── Aufbau Filling Order ────────────────────────────────────────
// Subshells in order of increasing energy (Aufbau principle)
// Each entry: { n, l, label, maxElectrons }
// l values: 0=s, 1=p, 2=d, 3=f
const SUBSHELL_LABELS = ['s', 'p', 'd', 'f'];
const AUFBAU_ORDER = [
    { n: 1, l: 0 },
    { n: 2, l: 0 },
    { n: 2, l: 1 },
    { n: 3, l: 0 },
    { n: 3, l: 1 },
    { n: 4, l: 0 },
    { n: 3, l: 2 },
    { n: 4, l: 1 },
    { n: 5, l: 0 },
    { n: 4, l: 2 },
    { n: 5, l: 1 },
    { n: 6, l: 0 },
    { n: 4, l: 3 },
    { n: 5, l: 2 },
    { n: 6, l: 1 },
    { n: 7, l: 0 },
    { n: 5, l: 3 },
    { n: 6, l: 2 },
    { n: 7, l: 1 },
].map(s => ({
    ...s,
    label: `${s.n}${SUBSHELL_LABELS[s.l]}`,
    maxElectrons: 2 * (2 * s.l + 1),  // 2(2l+1)
}));

/**
 * Compute the electron configuration for a given atomic number Z.
 * Returns array of { n, l, label, maxElectrons, electrons }
 */
function getElectronConfiguration(Z) {
    let remaining = Z;
    const config = [];
    for (const sub of AUFBAU_ORDER) {
        if (remaining <= 0) break;
        const e = Math.min(remaining, sub.maxElectrons);
        config.push({ ...sub, electrons: e });
        remaining -= e;
    }
    return config;
}

/**
 * Return the electron configuration string, e.g. "1s² 2s² 2p²"
 */
function configToString(config) {
    const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return config.map(sub => {
        const sup = String(sub.electrons).split('').map(d => superscripts[+d]).join('');
        return `${sub.label}${sup}`;
    }).join(' ');
}

// ─── Orbital Color Scheme ────────────────────────────────────────
// Colors by orbital TYPE (s, p, d, f) — the quantum mechanical way
const ORBITAL_COLORS = {
    quantum: {
        name: 'Quantum',
        s: 0x60a5fa,  // Blue
        p: 0x34d399,  // Green
        d: 0xfbbf24,  // Amber/Orange
        f: 0xf87171,  // Red
        proton: 0xff6b6b,
        neutron: 0x94a3b8,
        nucleus_glow: 0xff4444,
        bg: 0x0a0e1a,
    },
    classic: {
        name: 'Classic',
        s: 0x3b82f6,
        p: 0x22c55e,
        d: 0xeab308,
        f: 0xef4444,
        proton: 0xe74c3c,
        neutron: 0x7f8c8d,
        nucleus_glow: 0xe74c3c,
        bg: 0x0d1117,
    },
    neon: {
        name: 'Neon',
        s: 0x00ccff,
        p: 0x00ff88,
        d: 0xffff00,
        f: 0xff00ff,
        proton: 0xff3366,
        neutron: 0x66ffcc,
        nucleus_glow: 0xff3366,
        bg: 0x050510,
    },
};

// ─── State ───────────────────────────────────────────────────────
const state = {
    elementZ: 6,
    cloudDensity: 1.0,
    nucleusScale: 1.0,
    showLabels: true,
    glowEffects: true,
    showIndividualOrbitals: true,
    highlightSubshell: 'all',  // 'all' or e.g. '2p'
    colorScheme: 'quantum',
    animationSpeed: 1.0,
};

// ─── Three.js Setup ──────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(14, 10, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 60;
controls.enablePan = true;

// ─── Lighting ────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x404060, 0.6));
const light1 = new THREE.PointLight(0x6366f1, 1.5, 60);
light1.position.set(10, 10, 10);
scene.add(light1);
const light2 = new THREE.PointLight(0xec4899, 0.8, 40);
light2.position.set(-10, -5, -10);
scene.add(light2);
const light3 = new THREE.PointLight(0x14b8a6, 0.5, 30);
light3.position.set(0, 15, 0);
scene.add(light3);

// ─── Starfield ───────────────────────────────────────────────────
function createStarfield() {
    const geo = new THREE.BufferGeometry();
    const count = 2000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff, size: 0.15, transparent: true, opacity: 0.5, sizeAttenuation: true,
    }));
}
const starfield = createStarfield();
scene.add(starfield);

// ─── Atom Group ──────────────────────────────────────────────────
const atomGroup = new THREE.Group();
scene.add(atomGroup);

let nucleusGroup = null;
let orbitalClouds = [];   // { points, subshellLabel, basePositions }
let labelSprites = [];

// ─── Circular Dot Sprite Texture ─────────────────────────────────
// Creates a soft circular dot texture to replace default square particles
const dotCanvas = document.createElement('canvas');
dotCanvas.width = 64;
dotCanvas.height = 64;
const dotCtx = dotCanvas.getContext('2d');
const gradient = dotCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
gradient.addColorStop(0.6, 'rgba(255,255,255,0.3)');
gradient.addColorStop(1, 'rgba(255,255,255,0)');
dotCtx.fillStyle = gradient;
dotCtx.fillRect(0, 0, 64, 64);
const dotTexture = new THREE.CanvasTexture(dotCanvas);

/**
 * Heatmap color ramp: maps a normalized density (0–1) to a
 * purple → magenta → orange → white gradient, matching the
 * kavan010 reference visualization style.
 * @param {number} t - normalized density (0 = sparse, 1 = peak)
 * @returns {THREE.Color}
 */
/**
 * Heatmap color ramp: maps a normalized density (0–1) to a
 * purple → magenta → orange → white gradient.
 * Optimized to write directly to a Float32Array.
 */
function fillDensityHeatmapColor(t, colArray, index) {
    t = Math.max(0, Math.min(1, t));
    let r, g, b;
    if (t < 0.25) {
        const s = t / 0.25;
        r = 0.15 + s * 0.55;
        g = 0.0;
        b = 0.3 + s * 0.4;
    } else if (t < 0.5) {
        const s = (t - 0.25) / 0.25;
        r = 0.7 + s * 0.3;
        g = 0.0 + s * 0.45;
        b = 0.7 - s * 0.6;
    } else if (t < 0.75) {
        const s = (t - 0.5) / 0.25;
        r = 1.0;
        g = 0.45 + s * 0.45;
        b = 0.1 - s * 0.05;
    } else {
        const s = (t - 0.75) / 0.25;
        r = 1.0;
        g = 0.9 + s * 0.1;
        b = 0.05 + s * 0.95;
    }
    const i3 = index * 3;
    colArray[i3] = r;
    colArray[i3 + 1] = g;
    colArray[i3 + 2] = b;
}

// ═══════════════════════════════════════════════════════════════
// PROBABILITY DENSITY SAMPLERS
// Accurate hydrogen-like wavefunctions with:
// - Radial nodes: (n - l - 1) nodes enforced via Laguerre polynomials
// - Proper angular distributions: spherical harmonics shapes
// - Nodal planes: zero probability at nodes for clear orbital shapes
// - Returns density alongside position for heatmap coloring
// ═══════════════════════════════════════════════════════════════

/** Radial scale factor — target visual radius in scene units for the peak lobe */
function radialScale(n) {
    return 2.5 + (n - 1) * 2.0;
}

/**
 * Generalized Laguerre polynomial L_p^k(x) for radial nodes.
 * Returns the polynomial value which goes through zero at radial nodes.
 * Number of radial nodes = n - l - 1.
 */
function laguerreL(p, k, x) {
    if (p === 0) return 1;
    if (p === 1) return 1 + k - x;
    let lPrev2 = 1;
    let lPrev1 = 1 + k - x;
    for (let i = 2; i <= p; i++) {
        const lCurr = ((2 * i - 1 + k - x) * lPrev1 - (i - 1 + k) * lPrev2) / i;
        lPrev2 = lPrev1;
        lPrev1 = lCurr;
    }
    return lPrev1;
}

/**
 * Hydrogen-like radial probability density: r² |R_nl(r)|²
 * Includes realistic nodes from the associated Laguerre polynomial.
 * @param {number} n - principal quantum number
 * @param {number} l - angular momentum quantum number
 * @param {number} rho - scaled radius (2r / na₀) 
 * @returns {number} unnormalized probability density
 */
function radialProbability(n, l, rho) {
    const lagP = n - l - 1;  // order of Laguerre polynomial = number of radial nodes
    const lagK = 2 * l + 1;
    const L = laguerreL(lagP, lagK, rho);
    // R_nl ∝ rho^l * L * exp(-rho/2)
    const Rnl = Math.pow(rho, l) * L * Math.exp(-rho / 2);
    // Probability ∝ r² |R|² ∝ rho² |R|² (since r = rho * na₀/2)
    return rho * rho * Rnl * Rnl;
}

/**
 * Sample a radial distance from the hydrogen-like radial distribution.
 * Uses rejection sampling with radial nodes properly included.
 */
function sampleRadius(n, l) {
    const R = radialScale(n);
    // rhoMax: tight upper bound — cut the tail for compact shapes
    const rhoMax = 3 * n + 4;

    // Find approximate maximum of the probability for rejection sampling
    let probMax = 0;
    for (let i = 0; i <= 200; i++) {
        const rho = (i / 200) * rhoMax;
        const p = radialProbability(n, l, rho);
        if (p > probMax) probMax = p;
    }
    probMax *= 1.05; // safety margin

    // Rejection sampling — return both radius and density
    let rho;
    for (let attempt = 0; attempt < 500; attempt++) {
        rho = Math.random() * rhoMax;
        const prob = radialProbability(n, l, rho);
        if (Math.random() * probMax < prob) {
            // Convert rho to scene units
            const r_scene = rho * R / (2 * n);
            // Return normalized radial density (0–1)
            const radialDensity = prob / probMax;
            return { r: r_scene, radialDensity };
        }
    }
    // Fallback
    return { r: R * 0.5, radialDensity: 0.3 };
}

/**
 * Sample a position from an s-orbital (l=0, spherical symmetry).
 * |ψ_ns|² ∝ R²_ns(r) — spherically symmetric with (n-1) radial nodes.
 */
function fillSOrbital(n, ml, index, posArray, densities) {
    const { r, radialDensity } = sampleRadius(n, 0);
    // Uniform direction on sphere
    const theta = Math.random() * 2 * Math.PI;
    const cosP = 2 * Math.random() - 1;
    const sinP = Math.sqrt(1 - cosP * cosP);

    const i3 = index * 3;
    posArray[i3] = r * sinP * Math.cos(theta);
    posArray[i3 + 1] = r * cosP;
    posArray[i3 + 2] = r * sinP * Math.sin(theta);
    densities[index] = radialDensity;
}

/**
 * Sample a position from a p-orbital (l=1).
 * Angular part Y_1^m has strong dumbbell character.
 * Writes directly to Float32Array buffers.
 */
function fillPOrbital(n, ml, index, posArray, densities) {
    const { r, radialDensity } = sampleRadius(n, 1);

    // Angular rejection sampling
    let x, y, z;
    let angularVal = 0;
    let accepted = false;
    for (let i = 0; i < 500; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const cosP = 2 * Math.random() - 1;
        const sinP = Math.sqrt(1 - cosP * cosP);
        x = sinP * Math.cos(theta);
        y = cosP;
        z = sinP * Math.sin(theta);

        if (ml === 0) {
            angularVal = y * y;
        } else if (ml === 1) {
            angularVal = x * x;
        } else {
            angularVal = z * z;
        }
        const angularProb = Math.pow(angularVal, 3.5);
        if (Math.random() < angularProb) { accepted = true; break; }
    }
    if (!accepted) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        const spread = 0.15;
        if (ml === 0) { x = (Math.random() - 0.5) * spread; y = sign; z = (Math.random() - 0.5) * spread; }
        else if (ml === 1) { x = sign; y = (Math.random() - 0.5) * spread; z = (Math.random() - 0.5) * spread; }
        else { x = (Math.random() - 0.5) * spread; y = (Math.random() - 0.5) * spread; z = sign; }
        const len = Math.sqrt(x * x + y * y + z * z);
        x /= len; y /= len; z /= len;
        angularVal = 0.9;
    }

    const i3 = index * 3;
    posArray[i3] = x * r;
    posArray[i3 + 1] = y * r;
    posArray[i3 + 2] = z * r;
    densities[index] = radialDensity * angularVal;
}

/**
 * Sample a position from a d-orbital (l=2).
 * Writes directly to Float32Array buffers.
 */
function fillDOrbital(n, ml, index, posArray, densities) {
    const { r, radialDensity } = sampleRadius(n, 2);

    let x, y, z;
    let angularVal = 0;
    let accepted = false;
    for (let i = 0; i < 500; i++) {
        const phi = Math.random() * 2 * Math.PI;
        const cosT = 2 * Math.random() - 1;
        const sinT = Math.sqrt(1 - cosT * cosT);
        x = sinT * Math.cos(phi);
        y = cosT;
        z = sinT * Math.sin(phi);

        const sin2T = sinT * sinT;
        const cos2T = cosT * cosT;

        switch (ml) {
            case 0:
                angularVal = Math.pow(3 * cos2T - 1, 2) / 4;
                break;
            case 1: {
                const cosPhi = Math.cos(phi);
                angularVal = sin2T * cos2T * cosPhi * cosPhi * 4;
                break;
            }
            case -1: {
                const sinPhi = Math.sin(phi);
                angularVal = sin2T * cos2T * sinPhi * sinPhi * 4;
                break;
            }
            case 2: {
                const sin2Phi = Math.sin(2 * phi);
                angularVal = sin2T * sin2T * sin2Phi * sin2Phi;
                break;
            }
            case -2: {
                const cos2Phi = Math.cos(2 * phi);
                angularVal = sin2T * sin2T * cos2Phi * cos2Phi;
                break;
            }
            default:
                angularVal = 1;
        }
        const angularProb = Math.min(Math.pow(angularVal, 2.5), 1);
        if (Math.random() < angularProb) { accepted = true; break; }
    }
    if (!accepted) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        if (ml === 0) { x = 0; y = sign; z = 0; }
        else { x = sign * 0.707; y = 0; z = sign * 0.707; }
        angularVal = 0.8;
    }

    const i3 = index * 3;
    posArray[i3] = x * r;
    posArray[i3 + 1] = y * r;
    posArray[i3 + 2] = z * r;
    densities[index] = radialDensity * angularVal;
}

/**
 * Sample a position from an f-orbital (l=3).
 * Writes directly to Float32Array buffers.
 */
function fillFOrbital(n, ml, index, posArray, densities) {
    const { r, radialDensity } = sampleRadius(n, 3);

    let x, y, z;
    let angularVal = 0;
    let accepted = false;
    for (let i = 0; i < 500; i++) {
        const phi = Math.random() * 2 * Math.PI;
        const cosT = 2 * Math.random() - 1;
        const sinT = Math.sqrt(1 - cosT * cosT);
        x = sinT * Math.cos(phi);
        y = cosT;
        z = sinT * Math.sin(phi);

        const sin2T = sinT * sinT;
        const cos2T = cosT * cosT;

        switch (ml) {
            case 0:
                angularVal = Math.pow(y * (5 * cos2T - 3), 2) * 0.1;
                break;
            case 1: {
                const cosPhi = Math.cos(phi);
                angularVal = sin2T * Math.pow(5 * cos2T - 1, 2) * cosPhi * cosPhi * 0.08;
                break;
            }
            case -1: {
                const sinPhi = Math.sin(phi);
                angularVal = sin2T * Math.pow(5 * cos2T - 1, 2) * sinPhi * sinPhi * 0.08;
                break;
            }
            case 2: {
                const sin2Phi = Math.sin(2 * phi);
                angularVal = sin2T * sin2T * cos2T * sin2Phi * sin2Phi * 2;
                break;
            }
            case -2: {
                const cos2Phi = Math.cos(2 * phi);
                angularVal = sin2T * sin2T * cos2T * cos2Phi * cos2Phi * 2;
                break;
            }
            case 3: {
                const cos3Phi = Math.cos(3 * phi);
                angularVal = sin2T * sin2T * sin2T * cos3Phi * cos3Phi;
                break;
            }
            case -3: {
                const sin3Phi = Math.sin(3 * phi);
                angularVal = sin2T * sin2T * sin2T * sin3Phi * sin3Phi;
                break;
            }
            default:
                angularVal = 0.5;
        }
        const angularProb = Math.min(Math.pow(angularVal, 2.0), 1);
        if (Math.random() < angularProb) { accepted = true; break; }
    }
    if (!accepted) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        x = 0; y = sign; z = 0;
        angularVal = 0.7;
    }

    const i3 = index * 3;
    posArray[i3] = x * r;
    posArray[i3 + 1] = y * r;
    posArray[i3 + 2] = z * r;
    densities[index] = radialDensity * angularVal;
}

/**
 * Master sampler: generate N points for a given subshell.
 * Optimized to fill pre-allocated Float32Arrays.
 */
function fillOrbitalPositions(n, l, ml, count, posArray, densities) {
    let fillFn;
    switch (l) {
        case 0: fillFn = fillSOrbital; break;
        case 1: fillFn = fillPOrbital; break;
        case 2: fillFn = fillDOrbital; break;
        case 3: fillFn = fillFOrbital; break;
        default: fillFn = fillSOrbital; break;
    }
    for (let i = 0; i < count; i++) {
        fillFn(n, ml, i, posArray, densities);
    }
}


// ═══════════════════════════════════════════════════════════════
// SCENE BUILDERS
// ═══════════════════════════════════════════════════════════════

/** Build the nucleus cluster */
function buildNucleus(protons, neutrons, scheme) {
    const group = new THREE.Group();
    const total = protons + neutrons;
    const baseRadius = 0.18 * Math.pow(total, 0.2);

    const particles = [];
    for (let i = 0; i < protons; i++) particles.push('proton');
    for (let i = 0; i < neutrons; i++) particles.push('neutron');
    // Shuffle
    for (let i = particles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [particles[i], particles[j]] = [particles[j], particles[i]];
    }

    particles.forEach((type, idx) => {
        const phi = Math.acos(1 - 2 * (idx + 0.5) / total);
        const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
        const dist = idx === 0 ? 0 : baseRadius * 0.8 * Math.cbrt((idx + 1) / total) * 1.5;
        const pos = idx === 0
            ? new THREE.Vector3(0, 0, 0)
            : new THREE.Vector3(
                dist * Math.sin(phi) * Math.cos(theta),
                dist * Math.sin(phi) * Math.sin(theta),
                dist * Math.cos(phi)
            );

        const color = type === 'proton' ? scheme.proton : scheme.neutron;
        const geo = new THREE.SphereGeometry(baseRadius * 0.45, 16, 16);
        const mat = new THREE.MeshPhongMaterial({
            color,
            emissive: new THREE.Color(color).multiplyScalar(0.3),
            shininess: 80, specular: 0x666666,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.userData = { type, isNucleon: true };
        group.add(mesh);
    });

    // Glow
    if (state.glowEffects) {
        const glowGeo = new THREE.SphereGeometry(baseRadius * 2.5, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: scheme.nucleus_glow, transparent: true, opacity: 0.08, side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.userData.isGlow = true;
        group.add(glow);
    }

    return group;
}

/** Get color for subshell type */
function getSubshellColor(l) {
    const scheme = ORBITAL_COLORS[state.colorScheme];
    return [scheme.s, scheme.p, scheme.d, scheme.f][l] || scheme.s;
}

/**
 * Build particle cloud for an orbital.
 * Expands each subshell (n, l) into its magnetic quantum numbers (mₗ)
 * and distributes electrons accordingly.
 */
function buildOrbitalCloud(n, l, ml, electronCount, densityMultiplier) {
    const particleCount = Math.round(electronCount * 5000 * densityMultiplier);

    const posArray = new Float32Array(particleCount * 3);
    const densities = new Float32Array(particleCount);
    const colArray = new Float32Array(particleCount * 3);

    fillOrbitalPositions(n, l, ml, particleCount, posArray, densities);

    // Find max density for normalization
    let maxDensity = 0;
    for (let i = 0; i < particleCount; i++) {
        if (densities[i] > maxDensity) maxDensity = densities[i];
    }
    if (maxDensity === 0) maxDensity = 1;

    for (let i = 0; i < particleCount; i++) {
        // Heatmap coloring based on probability density
        // Apply gamma for more contrast (boosts mid-range visibility)
        const t = Math.pow(densities[i] / maxDensity, 0.6);
        fillDensityHeatmapColor(t, colArray, i);
    }

    const basePos = new Float32Array(posArray);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.065,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    points.userData = {
        subshellLabel: `${n}${SUBSHELL_LABELS[l]}`,
        n, l, ml, electronCount,
        isOrbitalCloud: true,
    };

    return { points, basePositions: basePos };
}

/** Create a text sprite label */
function createLabel(text, position, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 64;
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 150, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85 });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    sprite.scale.set(3, 0.64, 1);
    return sprite;
}


// ═══════════════════════════════════════════════════════════════
// MAIN REBUILD
// ═══════════════════════════════════════════════════════════════

function rebuildAtom() {
    // Clear
    while (atomGroup.children.length > 0) {
        const child = atomGroup.children[0];
        atomGroup.remove(child);
        disposeObject(child);
    }
    orbitalClouds = [];
    labelSprites = [];

    const element = ELEMENTS[state.elementZ];
    const scheme = ORBITAL_COLORS[state.colorScheme];
    const config = getElectronConfiguration(state.elementZ);

    // ─ Nucleus ─
    nucleusGroup = buildNucleus(element.z, element.neutrons, scheme);
    nucleusGroup.scale.setScalar(state.nucleusScale);
    atomGroup.add(nucleusGroup);

    if (state.showLabels) {
        const nLabel = createLabel(
            `${element.z}p  ${element.neutrons}n`,
            new THREE.Vector3(0, -1.6 * state.nucleusScale, 0),
            '#94a3b8'
        );
        atomGroup.add(nLabel);
        labelSprites.push(nLabel);
    }

    // ─ Orbital Clouds ─
    config.forEach(sub => {
        const numOrbitals = 2 * sub.l + 1; // number of mₗ values
        const electronsPerOrbital = Math.ceil(sub.electrons / numOrbitals);
        const remaining = sub.electrons;

        // Dimmed if not highlighted
        const isHighlighted = state.highlightSubshell === 'all' || state.highlightSubshell === sub.label;
        const densityMult = state.cloudDensity * (isHighlighted ? 1 : 0.15);

        if (state.showIndividualOrbitals) {
            // Show each mₗ orbital separately
            let electronsLeft = sub.electrons;
            for (let ml = -sub.l; ml <= sub.l; ml++) {
                const eInThis = Math.min(electronsLeft, 2); // max 2 per orbital (Pauli)
                if (eInThis <= 0) break;
                electronsLeft -= eInThis;

                const { points, basePositions } = buildOrbitalCloud(sub.n, sub.l, ml, eInThis, densityMult);
                if (!isHighlighted) points.material.opacity = 0.15;
                atomGroup.add(points);
                orbitalClouds.push({ points, basePositions, label: sub.label, n: sub.n, l: sub.l, ml });
            }
        } else {
            // Combined cloud for whole subshell: distribute among mₗ values
            let electronsLeft = sub.electrons;
            for (let ml = -sub.l; ml <= sub.l; ml++) {
                const eInThis = Math.min(electronsLeft, 2);
                if (eInThis <= 0) break;
                electronsLeft -= eInThis;

                const { points, basePositions } = buildOrbitalCloud(sub.n, sub.l, ml, eInThis, densityMult);
                if (!isHighlighted) points.material.opacity = 0.15;
                atomGroup.add(points);
                orbitalClouds.push({ points, basePositions, label: sub.label, n: sub.n, l: sub.l, ml });
            }
        }

        // Label for this subshell
        if (state.showLabels && isHighlighted) {
            const R = radialScale(sub.n);
            const colorHex = '#' + new THREE.Color(getSubshellColor(sub.l)).getHexString();
            const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
            const supStr = String(sub.electrons).split('').map(d => superscripts[+d]).join('');
            const labelText = `${sub.label}${supStr}`;
            const offsetAngle = sub.l * 0.8;
            const labelPos = new THREE.Vector3(
                (R + 1.2) * Math.cos(offsetAngle),
                1.0 + sub.l * 0.4,
                (R + 1.2) * Math.sin(offsetAngle)
            );
            const label = createLabel(labelText, labelPos, colorHex);
            atomGroup.add(label);
            labelSprites.push(label);
        }
    });

    // ─ Update UI ─
    document.getElementById('element-symbol').textContent = element.symbol;
    document.getElementById('element-name').textContent = element.name;
    document.getElementById('electron-config-text').textContent = configToString(config);

    updateLegend(config);
    updateSubshellButtons(config);
    updateEnergyDiagram(config);
}

function disposeObject(obj) {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
    }
    if (obj.children) obj.children.forEach(child => disposeObject(child));
}


// ═══════════════════════════════════════════════════════════════
// LEGEND
// ═══════════════════════════════════════════════════════════════

function updateLegend(config) {
    const legend = document.getElementById('orbital-legend');
    legend.innerHTML = '';

    const scheme = ORBITAL_COLORS[state.colorScheme];

    // Proton/Neutron
    ['proton', 'neutron'].forEach(type => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-dot" style="background:#${new THREE.Color(scheme[type]).getHexString()};"></span>
            <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
        `;
        legend.appendChild(item);
    });

    // Orbital types present
    const types = new Set(config.map(s => s.l));
    const typeNames = ['s orbital', 'p orbital', 'd orbital', 'f orbital'];
    types.forEach(l => {
        const color = '#' + new THREE.Color(getSubshellColor(l)).getHexString();
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-dot" style="background:${color}; color:${color};"></span>
            <span>${typeNames[l]} (l=${l})</span>
        `;
        legend.appendChild(item);
    });
}


// ═══════════════════════════════════════════════════════════════
// SUBSHELL HIGHLIGHT BUTTONS
// ═══════════════════════════════════════════════════════════════

function updateSubshellButtons(config) {
    const container = document.getElementById('subshell-buttons');
    container.innerHTML = '';

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'subshell-btn' + (state.highlightSubshell === 'all' ? ' active' : '');
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => {
        state.highlightSubshell = 'all';
        rebuildAtom();
    });
    container.appendChild(allBtn);

    config.forEach(sub => {
        const btn = document.createElement('button');
        const color = '#' + new THREE.Color(getSubshellColor(sub.l)).getHexString();
        btn.className = 'subshell-btn' + (state.highlightSubshell === sub.label ? ' active' : '');
        btn.textContent = sub.label;
        btn.style.borderColor = color;
        if (state.highlightSubshell === sub.label) {
            btn.style.backgroundColor = color + '33';
            btn.style.color = color;
        }
        btn.addEventListener('click', () => {
            state.highlightSubshell = sub.label;
            rebuildAtom();
        });
        container.appendChild(btn);
    });
}


// ═══════════════════════════════════════════════════════════════
// ENERGY LEVEL DIAGRAM
// ═══════════════════════════════════════════════════════════════

function updateEnergyDiagram(config) {
    const canvas = document.getElementById('energy-diagram');
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth - 4;
    const H = canvas.height = Math.max(180, config.length * 28 + 40);

    ctx.clearRect(0, 0, W, H);

    const padding = { top: 20, bottom: 12, left: 40, right: 16 };
    const usableH = H - padding.top - padding.bottom;
    const levelHeight = Math.min(26, usableH / config.length);

    // Energy arrow
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, H - padding.bottom);
    ctx.lineTo(20, padding.top - 5);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(16, padding.top + 2);
    ctx.lineTo(20, padding.top - 8);
    ctx.lineTo(24, padding.top + 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.save();
    ctx.translate(10, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Energy ↑', 0, 0);
    ctx.restore();

    // Draw levels (bottom = lowest energy)
    config.forEach((sub, idx) => {
        const y = H - padding.bottom - (idx + 1) * levelHeight;
        const x = padding.left;
        const lineW = W - padding.left - padding.right;
        const color = '#' + new THREE.Color(getSubshellColor(sub.l)).getHexString();
        const isActive = state.highlightSubshell === 'all' || state.highlightSubshell === sub.label;

        // Level line
        ctx.strokeStyle = isActive ? color : '#334155';
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + lineW, y);
        ctx.stroke();

        // Orbital boxes (each box = one mₗ orbital, holds 2 electrons)
        const numOrbitals = 2 * sub.l + 1;
        const boxW = Math.min(20, (lineW - 50) / numOrbitals - 4);
        const boxStartX = x + 45;
        let electronsLeft = sub.electrons;

        for (let m = 0; m < numOrbitals; m++) {
            const bx = boxStartX + m * (boxW + 4);
            ctx.strokeStyle = isActive ? color : '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, y - 10, boxW, 12);

            // Arrows for electrons (up/down = spin)
            const eInBox = Math.min(electronsLeft, 2);
            electronsLeft -= eInBox;

            ctx.fillStyle = isActive ? color : '#475569';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            if (eInBox >= 1) ctx.fillText('↑', bx + boxW / 2 - 4, y - 1);
            if (eInBox >= 2) ctx.fillText('↓', bx + boxW / 2 + 4, y - 1);
        }

        // Label
        ctx.fillStyle = isActive ? '#e2e8f0' : '#475569';
        ctx.font = `${isActive ? 'bold' : 'normal'} 11px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(sub.label, x + 2, y + 3);
    });
}


// ═══════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    controls.update();
    starfield.rotation.y += delta * 0.008;

    // Nucleus wobble
    if (nucleusGroup) {
        nucleusGroup.rotation.y += delta * 0.15;
        nucleusGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.08;
    }

    // Orbital cloud breathing animation (quantum uncertainty visualization)
    orbitalClouds.forEach(cloud => {
        const positions = cloud.points.geometry.attributes.position.array;
        const base = cloud.basePositions;
        const speed = state.animationSpeed;
        const phase = elapsed * speed * 0.8 + cloud.n * 1.3 + cloud.l * 0.7;

        // Gentle pulsing — expand and contract
        const breathe = 1.0 + Math.sin(phase) * 0.04;
        // Slight jitter to represent inherent quantum uncertainty
        for (let i = 0; i < positions.length; i += 3) {
            const jitterScale = 0.03 * speed;
            positions[i] = base[i] * breathe + (Math.sin(elapsed * 2.3 + i) * jitterScale);
            positions[i + 1] = base[i + 1] * breathe + (Math.cos(elapsed * 1.7 + i) * jitterScale);
            positions[i + 2] = base[i + 2] * breathe + (Math.sin(elapsed * 3.1 + i + 1) * jitterScale);
        }
        cloud.points.geometry.attributes.position.needsUpdate = true;

        // Subtle opacity pulse
        const opacityBase = (state.highlightSubshell === 'all' || state.highlightSubshell === cloud.label) ? 0.7 : 0.12;
        cloud.points.material.opacity = opacityBase + Math.sin(phase * 0.5) * 0.08;
    });

    // Labels face camera
    labelSprites.forEach(s => s.lookAt(camera.position));

    renderer.render(scene, camera);
}


// ═══════════════════════════════════════════════════════════════
// RAYCASTER — Click to inspect
// ═══════════════════════════════════════════════════════════════

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.3;
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('info-tooltip');
const tooltipContent = document.getElementById('tooltip-content');

renderer.domElement.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(atomGroup.children, true);
    if (intersects.length > 0) {
        const hit = intersects[0].object;
        let info = '';

        if (hit.userData.isNucleon) {
            const t = hit.userData.type;
            info = `<strong>${t === 'proton' ? 'Proton' : 'Neutron'}</strong><br>
                    Charge: ${t === 'proton' ? '+1e' : '0'}<br>
                    Mass: ~${t === 'proton' ? '1.007' : '1.009'} amu<br>
                    Location: Nucleus`;
        } else if (hit.userData.isGlow) {
            const el = ELEMENTS[state.elementZ];
            info = `<strong>${el.name} Nucleus</strong><br>
                    ${el.z} protons, ${el.neutrons} neutrons<br>
                    Mass number: ${el.z + el.neutrons}`;
        } else if (hit.userData.isOrbitalCloud) {
            const d = hit.userData;
            const typeNames = ['s', 'p', 'd', 'f'];
            info = `<strong>${d.subshellLabel} Orbital</strong><br>
                    n = ${d.n}, l = ${d.l} (${typeNames[d.l]})<br>
                    mₗ = ${d.ml}<br>
                    Electrons: ${d.electronCount}<br>
                    Shape: ${['Spherical', 'Dumbbell', 'Cloverleaf', 'Multi-lobe'][d.l]}`;
        }

        if (info) {
            tooltipContent.innerHTML = info;
            tooltip.style.left = event.clientX + 15 + 'px';
            tooltip.style.top = event.clientY - 10 + 'px';
            tooltip.classList.remove('hidden');
            setTimeout(() => tooltip.classList.add('hidden'), 4000);
        }
    } else {
        tooltip.classList.add('hidden');
    }
});


// ═══════════════════════════════════════════════════════════════
// UI CONTROLS
// ═══════════════════════════════════════════════════════════════

// Element selector
document.getElementById('element-select').addEventListener('change', e => {
    state.elementZ = parseInt(e.target.value);
    state.highlightSubshell = 'all';
    rebuildAtom();
});

// Cloud density
document.getElementById('cloud-density').addEventListener('input', e => {
    state.cloudDensity = parseFloat(e.target.value);
    document.getElementById('density-display').textContent = state.cloudDensity.toFixed(1) + 'x';
    rebuildAtom();
});

// Animation speed
document.getElementById('animation-speed').addEventListener('input', e => {
    state.animationSpeed = parseFloat(e.target.value);
    document.getElementById('anim-speed-display').textContent = state.animationSpeed.toFixed(1) + 'x';
});

// Nucleus size
document.getElementById('nucleus-size').addEventListener('input', e => {
    state.nucleusScale = parseFloat(e.target.value);
    document.getElementById('nucleus-size-display').textContent = state.nucleusScale.toFixed(1) + 'x';
    if (nucleusGroup) nucleusGroup.scale.setScalar(state.nucleusScale);
});

// Toggles
document.getElementById('show-labels').addEventListener('change', e => {
    state.showLabels = e.target.checked;
    rebuildAtom();
});
document.getElementById('glow-effects').addEventListener('change', e => {
    state.glowEffects = e.target.checked;
    rebuildAtom();
});
document.getElementById('show-individual').addEventListener('change', e => {
    state.showIndividualOrbitals = e.target.checked;
    rebuildAtom();
});

// Color scheme
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.colorScheme = btn.dataset.scheme;
        scene.background = new THREE.Color(ORBITAL_COLORS[state.colorScheme].bg);
        rebuildAtom();
    });
});

// Reset view
document.getElementById('reset-view').addEventListener('click', () => {
    camera.position.set(14, 10, 14);
    controls.target.set(0, 0, 0);
    controls.update();
    state.highlightSubshell = 'all';
    rebuildAtom();
});

// Panel toggle
document.getElementById('panel-toggle').addEventListener('click', () => {
    const panel = document.getElementById('control-panel');
    const icon = document.querySelector('.toggle-icon');
    panel.classList.toggle('collapsed');
    icon.textContent = panel.classList.contains('collapsed') ? '▶' : '◀';
});


// ═══════════════════════════════════════════════════════════════
// RESIZE & INIT
// ═══════════════════════════════════════════════════════════════

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.background = new THREE.Color(ORBITAL_COLORS[state.colorScheme].bg);
rebuildAtom();
animate();

// Fade instructions
setTimeout(() => {
    const instr = document.getElementById('instructions');
    if (instr) {
        instr.style.transition = 'opacity 1s ease';
        instr.style.opacity = '0';
        setTimeout(() => instr.style.display = 'none', 1000);
    }
}, 8000);
