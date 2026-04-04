// ============================================
//  ChemVerse — 3D Molecular Viewer
//  Three.js-powered molecular visualization
//  Ball-and-stick, Space-filling, Wireframe
//  VSEPR auto-layout, Orbital overlays
// ============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ─── CPK Color Map (standard chemistry colors) ───
const CPK_COLORS = {
    1: 0xFFFFFF,   // H — white
    6: 0x333333,   // C — dark gray
    7: 0x3050F8,   // N — blue
    8: 0xFF0D0D,   // O — red
    9: 0x90E050,   // F — green
    11: 0xAB5CF2,  // Na — purple
    12: 0x8AFF00,  // Mg — bright green
    15: 0xFF8000,  // P — orange
    16: 0xFFFF30,  // S — yellow
    17: 0x1FF01F,  // Cl — green
    19: 0x8F40D4,  // K — violet
    20: 0x3DFF00,  // Ca — green
    26: 0xE06633,  // Fe — dark orange
    35: 0xA62929,  // Br — dark red
    53: 0x940094,  // I — dark violet
};

function getCPKColor(z) { return CPK_COLORS[z] || 0x888888; }

// ─── EN-based color gradient (low=red, high=blue) ───
function getENColor(z) {
    const en = (typeof ELECTRONEGATIVITY !== 'undefined' && ELECTRONEGATIVITY[z]) || 2.0;
    const t = Math.min(1, Math.max(0, (en - 0.7) / 3.3));
    const r = Math.round(255 * (1 - t));
    const g = Math.round(80 + 100 * (1 - Math.abs(t - 0.5) * 2));
    const b = Math.round(255 * t);
    return (r << 16) | (g << 8) | b;
}

// ─── Covalent radius in Å ───
function getRadius(z) {
    return (typeof COVALENT_RADII !== 'undefined' && COVALENT_RADII[z]) || 0.77;
}

function getSymbol(z) {
    if (typeof ELEMENTS_BY_Z !== 'undefined' && ELEMENTS_BY_Z[z]) return ELEMENTS_BY_Z[z].symbol;
    const syms = { 1: 'H', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 11: 'Na', 12: 'Mg', 15: 'P', 16: 'S', 17: 'Cl' };
    return syms[z] || '?';
}

function getName(z) {
    if (typeof ELEMENTS_BY_Z !== 'undefined' && ELEMENTS_BY_Z[z]) return ELEMENTS_BY_Z[z].name;
    return '';
}

function getEN(z) {
    return (typeof ELECTRONEGATIVITY !== 'undefined' && ELECTRONEGATIVITY[z]) || 2.0;
}

// ═══════════════════════════════════════════════════════════════
// PRESET MOLECULES — positions in Ångströms
// ═══════════════════════════════════════════════════════════════

const PRESET_MOLECULES = [
    {
        name: 'Water', formula: 'H₂O', geometry: 'Bent', angle: 104.5, hybridization: 'sp³',
        atoms: [
            { z: 8, pos: [0, 0, 0] },
            { z: 1, pos: [0.757, 0.586, 0] },
            { z: 1, pos: [-0.757, 0.586, 0] },
        ],
        bonds: [[0, 1, 1], [0, 2, 1]],
        lonePairs: [[0, 2]]  // atom index, count
    },
    {
        name: 'Ammonia', formula: 'NH₃', geometry: 'Trigonal Pyramidal', angle: 107.3, hybridization: 'sp³',
        atoms: [
            { z: 7, pos: [0, 0, 0] },
            { z: 1, pos: [0.941, -0.326, 0] },
            { z: 1, pos: [-0.471, -0.326, 0.816] },
            { z: 1, pos: [-0.471, -0.326, -0.816] },
        ],
        bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
        lonePairs: [[0, 1]]
    },
    {
        name: 'Methane', formula: 'CH₄', geometry: 'Tetrahedral', angle: 109.5, hybridization: 'sp³',
        atoms: [
            { z: 6, pos: [0, 0, 0] },
            { z: 1, pos: [0.628, 0.628, 0.628] },
            { z: 1, pos: [-0.628, -0.628, 0.628] },
            { z: 1, pos: [-0.628, 0.628, -0.628] },
            { z: 1, pos: [0.628, -0.628, -0.628] },
        ],
        bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
        lonePairs: []
    },
    {
        name: 'Carbon Dioxide', formula: 'CO₂', geometry: 'Linear', angle: 180, hybridization: 'sp',
        atoms: [
            { z: 8, pos: [-1.16, 0, 0] },
            { z: 6, pos: [0, 0, 0] },
            { z: 8, pos: [1.16, 0, 0] },
        ],
        bonds: [[0, 1, 2], [1, 2, 2]],
        lonePairs: [[0, 2], [2, 2]]
    },
    {
        name: 'Ethylene', formula: 'C₂H₄', geometry: 'Trigonal Planar', angle: 120, hybridization: 'sp²',
        atoms: [
            { z: 6, pos: [-0.667, 0, 0] },
            { z: 6, pos: [0.667, 0, 0] },
            { z: 1, pos: [-1.24, 0.927, 0] },
            { z: 1, pos: [-1.24, -0.927, 0] },
            { z: 1, pos: [1.24, 0.927, 0] },
            { z: 1, pos: [1.24, -0.927, 0] },
        ],
        bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
        lonePairs: []
    },
    {
        name: 'Acetylene', formula: 'C₂H₂', geometry: 'Linear', angle: 180, hybridization: 'sp',
        atoms: [
            { z: 1, pos: [-1.66, 0, 0] },
            { z: 6, pos: [-0.6, 0, 0] },
            { z: 6, pos: [0.6, 0, 0] },
            { z: 1, pos: [1.66, 0, 0] },
        ],
        bonds: [[0, 1, 1], [1, 2, 3], [2, 3, 1]],
        lonePairs: []
    },
    {
        name: 'Hydrogen Fluoride', formula: 'HF', geometry: 'Linear', angle: 180, hybridization: 'sp³',
        atoms: [
            { z: 1, pos: [-0.46, 0, 0] },
            { z: 9, pos: [0.46, 0, 0] },
        ],
        bonds: [[0, 1, 1]],
        lonePairs: [[1, 3]]
    },
    {
        name: 'Sodium Chloride', formula: 'NaCl', geometry: 'Linear (ion pair)', angle: 180, hybridization: 'ionic',
        atoms: [
            { z: 11, pos: [-1.18, 0, 0] },
            { z: 17, pos: [1.18, 0, 0] },
        ],
        bonds: [[0, 1, 1]],
        bondTypes: ['ionic'],
        lonePairs: [[1, 3]]
    },
    {
        name: 'Benzene', formula: 'C₆H₆', geometry: 'Planar Hexagonal', angle: 120, hybridization: 'sp²',
        atoms: [
            { z: 6, pos: [1.4, 0, 0] },
            { z: 6, pos: [0.7, 1.212, 0] },
            { z: 6, pos: [-0.7, 1.212, 0] },
            { z: 6, pos: [-1.4, 0, 0] },
            { z: 6, pos: [-0.7, -1.212, 0] },
            { z: 6, pos: [0.7, -1.212, 0] },
            { z: 1, pos: [2.49, 0, 0] },
            { z: 1, pos: [1.245, 2.156, 0] },
            { z: 1, pos: [-1.245, 2.156, 0] },
            { z: 1, pos: [-2.49, 0, 0] },
            { z: 1, pos: [-1.245, -2.156, 0] },
            { z: 1, pos: [1.245, -2.156, 0] },
        ],
        bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
        [0, 6, 1], [1, 7, 1], [2, 8, 1], [3, 9, 1], [4, 10, 1], [5, 11, 1]],
        lonePairs: []
    },
    {
        name: 'Phosphorus Pentachloride', formula: 'PCl₅', geometry: 'Trigonal Bipyramidal', angle: '90/120', hybridization: 'sp³d',
        atoms: [
            { z: 15, pos: [0, 0, 0] },
            { z: 17, pos: [0, 2.04, 0] },
            { z: 17, pos: [0, -2.04, 0] },
            { z: 17, pos: [1.77, 0, 0] },
            { z: 17, pos: [-0.88, 0, 1.53] },
            { z: 17, pos: [-0.88, 0, -1.53] },
        ],
        bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]],
        lonePairs: []
    },
    {
        name: 'Sulfur Hexafluoride', formula: 'SF₆', geometry: 'Octahedral', angle: 90, hybridization: 'sp³d²',
        atoms: [
            { z: 16, pos: [0, 0, 0] },
            { z: 9, pos: [1.56, 0, 0] },
            { z: 9, pos: [-1.56, 0, 0] },
            { z: 9, pos: [0, 1.56, 0] },
            { z: 9, pos: [0, -1.56, 0] },
            { z: 9, pos: [0, 0, 1.56] },
            { z: 9, pos: [0, 0, -1.56] },
        ],
        bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]],
        lonePairs: []
    },
    {
        name: 'Ozone', formula: 'O₃', geometry: 'Bent', angle: 116.8, hybridization: 'sp²',
        atoms: [
            { z: 8, pos: [-1.06, 0.49, 0] },
            { z: 8, pos: [0, 0, 0] },
            { z: 8, pos: [1.06, 0.49, 0] },
        ],
        bonds: [[0, 1, 1.5], [1, 2, 1.5]],
        lonePairs: [[0, 2], [1, 1], [2, 2]]
    },
];

// ═══════════════════════════════════════════════════════════════
// THREE.JS SETUP
// ═══════════════════════════════════════════════════════════════

const container = document.getElementById('viewport-container');
let W = container.clientWidth, H = container.clientHeight;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060a14);
scene.fog = new THREE.FogExp2(0x060a14, 0.04);

// Camera
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
camera.position.set(0, 2, 8);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// CSS2D Renderer for labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W, H);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.8;
controls.zoomSpeed = 1.2;
controls.minDistance = 2;
controls.maxDistance = 30;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x6366f1, 0.4);
fillLight.position.set(-5, 3, -3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xec4899, 0.3);
rimLight.position.set(0, -3, 5);
scene.add(rimLight);

// Ground grid (subtle)
const gridHelper = new THREE.GridHelper(20, 40, 0x1a1a3e, 0x0d0d2b);
gridHelper.position.y = -3;
scene.add(gridHelper);

// ─── State ───
let currentMol = null;
let viewMode = 'ball-stick';
let colorScheme = 'element';
let showLabels = true;
let showLonePairs = false;
let showAxes = false;
let autoRotate = false;
const moleculeGroup = new THREE.Group();
scene.add(moleculeGroup);
let axesHelper = null;

// ═══════════════════════════════════════════════════════════════
// MOLECULE BUILDING
// ═══════════════════════════════════════════════════════════════

const SCALE = 1.8; // Ångströms → scene units

// Properly dispose all Three.js objects in the molecule group
function clearMoleculeGroup() {
    moleculeGroup.traverse((child) => {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
        // Remove CSS2DObject DOM elements
        if (child.isCSS2DObject && child.element && child.element.parentNode) {
            child.element.parentNode.removeChild(child.element);
        }
    });
    // Remove all children
    while (moleculeGroup.children.length > 0) {
        moleculeGroup.remove(moleculeGroup.children[0]);
    }
}

function buildMolecule(mol) {
    // Clear previous — properly dispose all Three.js resources
    clearMoleculeGroup();
    moleculeGroup.position.set(0, 0, 0);
    moleculeGroup.rotation.set(0, 0, 0);
    currentMol = mol;

    const atoms3D = [];
    const bonds3D = [];

    // ── Build Atoms ──
    mol.atoms.forEach((atomData, i) => {
        const { z, pos } = atomData;
        const r = getRadius(z);

        // Atom sphere
        let sphereR;
        if (viewMode === 'space-fill') {
            sphereR = r * SCALE * 0.9;
        } else if (viewMode === 'wireframe') {
            sphereR = r * SCALE * 0.15;
        } else {
            sphereR = r * SCALE * 0.35;
        }

        const geo = new THREE.SphereGeometry(sphereR, 32, 32);
        let color;
        if (colorScheme === 'element') color = getCPKColor(z);
        else if (colorScheme === 'electronegativity') color = getENColor(z);
        else color = 0x888888;

        const mat = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.3,
            clearcoat: 0.4,
            clearcoatRoughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.05,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0] * SCALE, pos[1] * SCALE, pos[2] * SCALE);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        moleculeGroup.add(mesh);
        atoms3D.push({ mesh, z, pos, index: i });

        // Atom label
        if (showLabels) {
            const div = document.createElement('div');
            div.className = 'atom-label-3d';
            div.textContent = getSymbol(z);
            div.style.cssText = `
                color: #fff;
                font-size: 11px;
                font-weight: 700;
                font-family: Inter, sans-serif;
                text-shadow: 0 0 4px rgba(0,0,0,0.8);
                pointer-events: none;
            `;
            const label = new CSS2DObject(div);
            label.position.set(0, sphereR + 0.15, 0);
            mesh.add(label);
        }

        // Electron cloud glow
        if (viewMode === 'ball-stick') {
            const glowGeo = new THREE.SphereGeometry(sphereR * 2.2, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.04,
                side: THREE.BackSide,
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glow);
        }
    });

    // ── Build Bonds ──
    mol.bonds.forEach((bDef, bi) => {
        const [ai, bi2, order] = bDef;
        const a = atoms3D[ai], b = atoms3D[bi2];
        if (!a || !b) return;

        const posA = new THREE.Vector3(a.pos[0] * SCALE, a.pos[1] * SCALE, a.pos[2] * SCALE);
        const posB = new THREE.Vector3(b.pos[0] * SCALE, b.pos[1] * SCALE, b.pos[2] * SCALE);
        const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(posB, posA);
        const length = dir.length();
        dir.normalize();

        const bondType = (mol.bondTypes && mol.bondTypes[bi]) || 'covalent';
        const actualOrder = Math.floor(order);
        const offsets = actualOrder === 1 ? [0] : actualOrder === 2 ? [-0.08, 0.08] : [-0.12, 0, 0.12];

        // Find perpendicular vector for multi-bond offset
        const up = new THREE.Vector3(0, 1, 0);
        let perp = new THREE.Vector3().crossVectors(dir, up);
        if (perp.length() < 0.01) perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0));
        perp.normalize();

        offsets.forEach((offset, oi) => {
            let bondR = viewMode === 'wireframe' ? 0.015 : viewMode === 'space-fill' ? 0.04 : 0.06;
            // Thinner for multi-bonds
            if (actualOrder > 1) bondR *= 0.7;

            const geo = new THREE.CylinderGeometry(bondR, bondR, length, 8, 1);
            geo.rotateX(Math.PI / 2);

            let bondColor;
            if (bondType === 'ionic') {
                bondColor = 0xFFCC66;
            } else if (colorScheme === 'element') {
                bondColor = 0x667788;
            } else if (colorScheme === 'electronegativity') {
                bondColor = 0x4466aa;
            } else {
                bondColor = 0x667788;
            }

            const mat = new THREE.MeshPhysicalMaterial({
                color: bondColor,
                metalness: 0.3,
                roughness: 0.4,
                transparent: bondType === 'ionic',
                opacity: bondType === 'ionic' ? 0.6 : 1.0,
            });

            const mesh = new THREE.Mesh(geo, mat);
            const offsetVec = perp.clone().multiplyScalar(offset * SCALE);
            mesh.position.copy(mid).add(offsetVec);
            mesh.lookAt(posB.clone().add(offsetVec));
            mesh.castShadow = true;
            moleculeGroup.add(mesh);
            bonds3D.push(mesh);
        });
    });

    // ── Lone Pairs ──
    if (showLonePairs && mol.lonePairs) {
        mol.lonePairs.forEach(([atomIdx, count]) => {
            const atom = atoms3D[atomIdx];
            if (!atom) return;
            const center = new THREE.Vector3(atom.pos[0] * SCALE, atom.pos[1] * SCALE, atom.pos[2] * SCALE);

            // Find directions away from bonds
            const bondDirs = [];
            mol.bonds.forEach(b => {
                if (b[0] === atomIdx) {
                    const other = atoms3D[b[1]];
                    bondDirs.push(new THREE.Vector3(
                        (other.pos[0] - atom.pos[0]),
                        (other.pos[1] - atom.pos[1]),
                        (other.pos[2] - atom.pos[2])
                    ).normalize());
                } else if (b[1] === atomIdx) {
                    const other = atoms3D[b[0]];
                    bondDirs.push(new THREE.Vector3(
                        (other.pos[0] - atom.pos[0]),
                        (other.pos[1] - atom.pos[1]),
                        (other.pos[2] - atom.pos[2])
                    ).normalize());
                }
            });

            // Average bond direction → lone pairs face opposite
            const avgBond = new THREE.Vector3();
            bondDirs.forEach(d => avgBond.add(d));
            avgBond.normalize();

            for (let lp = 0; lp < count; lp++) {
                const angle = (lp / count) * Math.PI * 2;
                const lpDir = avgBond.clone().negate();

                // Rotate around bond axis
                const axis = new THREE.Vector3().crossVectors(lpDir, new THREE.Vector3(0, 0, 1)).normalize();
                if (axis.length() < 0.01) axis.set(1, 0, 0);
                lpDir.applyAxisAngle(axis, angle * 0.5 - Math.PI / 4);

                const lpPos = center.clone().add(lpDir.multiplyScalar(0.7));

                // Two dots per lone pair
                const dotGeo = new THREE.SphereGeometry(0.08, 8, 8);
                const dotMat = new THREE.MeshBasicMaterial({ color: getCPKColor(atom.z), transparent: true, opacity: 0.6 });

                const perpLP = new THREE.Vector3().crossVectors(lpDir.normalize(), new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.1);

                const dot1 = new THREE.Mesh(dotGeo, dotMat);
                dot1.position.copy(lpPos).add(perpLP);
                moleculeGroup.add(dot1);

                const dot2 = new THREE.Mesh(dotGeo, dotMat);
                dot2.position.copy(lpPos).sub(perpLP);
                moleculeGroup.add(dot2);
            }
        });
    }

    // Center molecule
    const box = new THREE.Box3().setFromObject(moleculeGroup);
    const center = box.getCenter(new THREE.Vector3());
    moleculeGroup.position.sub(center);

    // Reset camera
    const size = box.getSize(new THREE.Vector3()).length();
    camera.position.set(0, size * 0.3, size * 1.8);
    controls.target.set(0, 0, 0);
    controls.update();

    // Update info
    updateInfoPanel(mol);
}

// ═══════════════════════════════════════════════════════════════
// INFO PANEL
// ═══════════════════════════════════════════════════════════════

function updateInfoPanel(mol) {
    document.getElementById('info-name').textContent = mol.name;
    document.getElementById('info-formula').textContent = mol.formula;

    // Count atoms
    const atomCounts = {};
    let totalMass = 0;
    mol.atoms.forEach(a => {
        const sym = getSymbol(a.z);
        atomCounts[sym] = (atomCounts[sym] || 0) + 1;
        if (typeof ELEMENTS_BY_Z !== 'undefined' && ELEMENTS_BY_Z[a.z]) {
            totalMass += ELEMENTS_BY_Z[a.z].mass;
        }
    });

    const grid = document.getElementById('info-grid');
    grid.innerHTML = `
        <div class="info-item">
            <div class="info-item-label">Geometry</div>
            <div class="info-item-value">${mol.geometry}</div>
        </div>
        <div class="info-item">
            <div class="info-item-label">Bond Angle</div>
            <div class="info-item-value">${mol.angle}°</div>
        </div>
        <div class="info-item">
            <div class="info-item-label">Hybridization</div>
            <div class="info-item-value">${mol.hybridization}</div>
        </div>
        <div class="info-item">
            <div class="info-item-label">Atoms</div>
            <div class="info-item-value">${mol.atoms.length}</div>
        </div>
        <div class="info-item">
            <div class="info-item-label">Bonds</div>
            <div class="info-item-value">${mol.bonds.length}</div>
        </div>
        <div class="info-item">
            <div class="info-item-label">Molar Mass</div>
            <div class="info-item-value">${totalMass.toFixed(1)} g/mol</div>
        </div>
    `;

    // Bond list
    const bondSection = document.getElementById('bond-section');
    const bondList = document.getElementById('bond-list');
    bondSection.style.display = 'block';
    bondList.innerHTML = '';

    const seenBonds = new Set();
    mol.bonds.forEach((b, bi) => {
        const z1 = mol.atoms[b[0]].z, z2 = mol.atoms[b[1]].z;
        const order = b[2];
        const key = `${Math.min(z1, z2)}-${Math.max(z1, z2)}-${order}`;
        if (seenBonds.has(key)) return;
        seenBonds.add(key);

        const s1 = getSymbol(z1), s2 = getSymbol(z2);
        const orderStr = order === 1 ? 'Single' : order === 2 ? 'Double' : order === 3 ? 'Triple' : `×${order}`;

        const delta = Math.abs(getEN(z1) - getEN(z2));
        const type = delta > 1.7 ? 'ionic' : delta >= 0.4 ? 'polar' : 'nonpolar';
        const ionic = Math.round(100 * (1 - Math.exp(-0.25 * delta * delta)));

        const div = document.createElement('div');
        div.className = 'bond-item-3d';
        div.innerHTML = `
            <div>
                <span class="bond-item-pair">${s1}${order > 1 ? '═'.repeat(Math.min(order - 1, 2)) : '─'}${s2}</span>
                <span class="bond-type-tag ${type}">${type}</span>
            </div>
            <div class="bond-item-meta">${orderStr} • ${ionic}% ionic</div>
        `;
        bondList.appendChild(div);
    });

    // Geometry
    const geoSection = document.getElementById('geometry-section');
    const geoInfo = document.getElementById('geometry-info');
    geoSection.style.display = 'block';
    geoInfo.innerHTML = `
        <div class="geom-row"><span class="geom-label">Shape</span><span class="geom-value">${mol.geometry}</span></div>
        <div class="geom-row"><span class="geom-label">Bond Angle</span><span class="geom-value">${mol.angle}°</span></div>
        <div class="geom-row"><span class="geom-label">Hybridization</span><span class="geom-value">${mol.hybridization}</span></div>
        <div class="geom-row"><span class="geom-label">Lone Pairs</span><span class="geom-value">${(mol.lonePairs || []).reduce((s, lp) => s + lp[1], 0)}</span></div>
        <div class="geom-row"><span class="geom-label">Steric Number</span><span class="geom-value">${mol.bonds.filter(b => b[0] === 0 || b[1] === 0).length + (mol.lonePairs || []).filter(lp => lp[0] === 0).reduce((s, lp) => s + lp[1], 0)}</span></div>
    `;
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR CONTROLS
// ═══════════════════════════════════════════════════════════════

// Build molecule buttons
function buildMoleculeGrid() {
    const grid = document.getElementById('molecule-grid');
    PRESET_MOLECULES.forEach((mol, i) => {
        const btn = document.createElement('button');
        btn.className = 'mol-btn';
        btn.innerHTML = `
            <span class="mol-btn-name">${mol.name}</span>
            <span class="mol-btn-formula">${mol.formula}</span>
        `;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mol-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            buildMolecule(mol);
        });
        grid.appendChild(btn);
    });
}

// View mode toggles
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        viewMode = btn.dataset.mode;
        if (currentMol) buildMolecule(currentMol);
    });
});

// Color scheme toggles
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        colorScheme = btn.dataset.color;
        if (currentMol) buildMolecule(currentMol);
    });
});

// Checkboxes
document.getElementById('show-labels').addEventListener('change', (e) => {
    showLabels = e.target.checked;
    if (currentMol) buildMolecule(currentMol);
});

document.getElementById('show-lone-pairs').addEventListener('change', (e) => {
    showLonePairs = e.target.checked;
    if (currentMol) buildMolecule(currentMol);
});

document.getElementById('show-axes').addEventListener('change', (e) => {
    showAxes = e.target.checked;
    if (showAxes) {
        axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);
    } else if (axesHelper) {
        scene.remove(axesHelper);
        axesHelper = null;
    }
});

document.getElementById('auto-rotate').addEventListener('change', (e) => {
    autoRotate = e.target.checked;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
});

// Reset view
document.getElementById('btn-reset-view').addEventListener('click', () => {
    if (currentMol) buildMolecule(currentMol);
});

// Screenshot
document.getElementById('btn-screenshot').addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `chemverse-${currentMol ? currentMol.name.toLowerCase().replace(/\s+/g, '-') : 'molecule'}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
});

// ─── Resize ───
function onResize() {
    W = container.clientWidth;
    H = container.clientHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    labelRenderer.setSize(W, H);
}
window.addEventListener('resize', onResize);

// ─── Animation Loop ───
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Subtle floating of molecule
    if (moleculeGroup.children.length > 0 && !autoRotate) {
        moleculeGroup.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// ─── Init ───
buildMoleculeGrid();
// Load water by default
buildMolecule(PRESET_MOLECULES[0]);
document.querySelector('.mol-btn').classList.add('active');
animate();
