// ============================================
//  ChemVerse — Reaction Lab Engine v3
//  Chemistry-accurate simulation backed by:
//  - Pauling bond energies & covalent radii
//  - Electronegativity-based bond types
//  - VSEPR molecular geometry
//  - Enthalpy tracking (ΔH)
//  - % Ionic character (Pauling formula)
//  - Lewis dot rendering
// ============================================

(function () {
    'use strict';

    // ─── Canvas Setup ───
    const canvas = document.getElementById('lab-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        W = canvas.width = rect.width * devicePixelRatio;
        H = canvas.height = rect.height * devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    // ─── State ───
    const atoms = [];
    const bonds = [];
    const particles = [];   // spark/frost particles
    let nextId = 1;
    let dragging = null;
    let dragOffX = 0, dragOffY = 0;
    let undoStack = [];
    let activePreset = null;
    let score = 0;
    let reacting = false;
    let hoveredAtom = null;

    const BASE_RADIUS = 22;
    const BOND_DIST = 72;

    // ─── Chemistry Helpers ───

    function getEN(z) { return ELECTRONEGATIVITY[z] || 1.5; }
    function getProps(z) { return ELEMENT_PROPERTIES[z] || { valence: 0, maxBonds: 0, electronsNeeded: 0, isMetal: false, lonePairs: 0 }; }
    function getRadius(z) { return COVALENT_RADII[z] || 0.77; }

    // Atom visual radius scaled by covalent radius (Pauling Ch. 7)
    function atomRadius(z) {
        const r = getRadius(z);
        return Math.max(14, Math.min(32, BASE_RADIUS * (r / 0.77)));
    }

    function getElementColor(z) {
        const el = ELEMENTS_BY_Z[z];
        if (!el) return '#888';
        const cat = ELEMENT_CATEGORIES[el.category];
        return cat ? cat.color : '#888';
    }

    function getElementInfo(z) {
        return ELEMENTS_BY_Z[z] || { symbol: '?', name: 'Unknown', mass: 0 };
    }

    // Bond type from ΔEN (Pauling Ch. 3)
    function determineBondType(z1, z2) {
        const delta = Math.abs(getEN(z1) - getEN(z2));
        if (delta > 1.7) return 'ionic';
        if (delta >= 0.4) return 'polar';
        return 'nonpolar';
    }

    // % Ionic character — Pauling Ch. 3-9 formula
    function ionicCharacter(z1, z2) {
        const delta = Math.abs(getEN(z1) - getEN(z2));
        return Math.round(100 * (1 - Math.exp(-0.25 * delta * delta)));
    }

    // Bond energy lookup (Pauling Table 3-4)
    function getBondEnergy(z1, z2, order) {
        const a = Math.min(z1, z2), b = Math.max(z1, z2);
        const key = `${a}-${b}-${order}`;
        if (BOND_ENERGIES[key]) return BOND_ENERGIES[key];
        // Try single bond as fallback
        const fallback = `${a}-${b}-1`;
        if (BOND_ENERGIES[fallback]) return BOND_ENERGIES[fallback] * order * 0.8;
        return 80 * order; // rough estimate
    }

    // Bond order from electrons needed
    function calculateBondOrder(z1, z2) {
        const p1 = getProps(z1), p2 = getProps(z2);
        if (p1.isMetal || p2.isMetal) return 1;
        return Math.min(p1.electronsNeeded, p2.electronsNeeded, 3);
    }

    function getAvailableBonds(atom) {
        const props = getProps(atom.z);
        const used = atom.bonds.reduce((s, b) => s + b.order, 0);
        return Math.max(0, props.maxBonds - used);
    }

    function canBond(z1, z2) {
        const p1 = getProps(z1), p2 = getProps(z2);
        if (p1.maxBonds === 0 || p2.maxBonds === 0) return false;
        if (p1.isMetal && p2.isMetal) return false;
        return true;
    }

    // VSEPR shape for a central atom
    function getMolecularShape(atom) {
        const props = getProps(atom.z);
        const bondCount = atom.bonds.length;
        const lp = props.lonePairs || 0;
        const steric = bondCount + lp;
        const key = `${steric}-${lp}`;
        return MOLECULAR_SHAPES[key] || null;
    }

    // ─── Build Palette ───
    function buildPalette() {
        const list = document.getElementById('palette-list');
        list.innerHTML = '';
        const searchVal = (document.getElementById('palette-search').value || '').toLowerCase();

        LAB_ELEMENTS.forEach(z => {
            const el = getElementInfo(z);
            if (searchVal && !el.name.toLowerCase().includes(searchVal) && !el.symbol.toLowerCase().includes(searchVal)) return;

            const item = document.createElement('div');
            item.className = 'palette-item';
            item.draggable = true;
            item.dataset.z = z;

            const color = getElementColor(z);
            const props = getProps(z);
            const en = getEN(z);
            const r = getRadius(z);

            item.innerHTML = `
                <div class="pi-symbol" style="color:${color}; background:${color}15; border-color:${color}40">
                    <span>${el.symbol}</span>
                    <span class="pi-z">${z}</span>
                </div>
                <div class="pi-info">
                    <div class="pi-name">${el.name}</div>
                    <div class="pi-stats">
                        <span title="Max bonds">⚡${props.maxBonds}</span>
                        <span title="Electronegativity">EN ${en.toFixed(1)}</span>
                        <span title="Covalent radius">r ${r.toFixed(2)}Å</span>
                    </div>
                </div>
            `;

            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', z);
                e.dataTransfer.effectAllowed = 'copy';
            });

            item.addEventListener('click', () => {
                const cw = W / devicePixelRatio;
                const ch = H / devicePixelRatio;
                addAtom(z, cw / 2 + (Math.random() - 0.5) * 100, ch / 2 + (Math.random() - 0.5) * 100);
            });

            list.appendChild(item);
        });
    }

    document.getElementById('palette-search').addEventListener('input', buildPalette);
    buildPalette();

    // ─── Canvas Drop ───
    canvas.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const z = parseInt(e.dataTransfer.getData('text/plain'));
        if (!z) return;
        const rect = canvas.getBoundingClientRect();
        addAtom(z, e.clientX - rect.left, e.clientY - rect.top);
    });

    // ─── Add/Remove Atoms ───
    function addAtom(z, x, y) {
        saveUndo();
        const atom = { id: nextId++, z, x, y, bonds: [], charge: 0 };
        atoms.push(atom);
        trySmartBond(atom);
        updateBondInfo();
        render();
    }

    function addAtomSilent(z, x, y) {
        const atom = { id: nextId++, z, x, y, bonds: [], charge: 0 };
        atoms.push(atom);
        return atom;
    }

    function removeAtom(atom) {
        saveUndo();
        for (let i = bonds.length - 1; i >= 0; i--) {
            if (bonds[i].a === atom || bonds[i].b === atom) {
                const other = bonds[i].a === atom ? bonds[i].b : bonds[i].a;
                other.bonds = other.bonds.filter(b => b !== bonds[i]);
                bonds.splice(i, 1);
            }
        }
        atoms.splice(atoms.indexOf(atom), 1);
        updateBondInfo();
        render();
    }

    // ─── Smart Bond Engine ───
    function trySmartBond(newAtom) {
        let avail = getAvailableBonds(newAtom);
        if (avail <= 0) return;

        const candidates = [];
        for (const other of atoms) {
            if (other === newAtom) continue;
            if (getAvailableBonds(other) <= 0) continue;
            if (!canBond(newAtom.z, other.z)) continue;
            if (bonds.some(b => (b.a === newAtom && b.b === other) || (b.a === other && b.b === newAtom))) continue;

            const dx = other.x - newAtom.x, dy = other.y - newAtom.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < BOND_DIST) candidates.push({ atom: other, dist });
        }

        candidates.sort((a, b) => a.dist - b.dist);

        for (const c of candidates) {
            if (avail <= 0) break;
            const otherAvail = getAvailableBonds(c.atom);
            if (otherAvail <= 0) continue;

            const bondType = determineBondType(newAtom.z, c.atom.z);
            let order = calculateBondOrder(newAtom.z, c.atom.z);
            order = Math.min(order, avail, otherAvail);
            if (order <= 0) continue;

            const energy = getBondEnergy(newAtom.z, c.atom.z, order);
            const ionic = ionicCharacter(newAtom.z, c.atom.z);

            const bond = { a: newAtom, b: c.atom, order, type: bondType, energy, ionicPct: ionic };
            bonds.push(bond);
            newAtom.bonds.push(bond);
            c.atom.bonds.push(bond);
            avail -= order;

            if (bondType === 'ionic') {
                const p1 = getProps(newAtom.z), p2 = getProps(c.atom.z);
                if (p1.isMetal) {
                    newAtom.charge = p1.valence;
                    c.atom.charge = -p1.valence;
                } else {
                    c.atom.charge = p2.valence;
                    newAtom.charge = -p2.valence;
                }
            }
        }
    }

    // ─── Mouse Interaction ───
    function getAtomAt(x, y) {
        for (let i = atoms.length - 1; i >= 0; i--) {
            const a = atoms[i];
            const r = atomRadius(a.z);
            const dx = a.x - x, dy = a.y - y;
            if (dx * dx + dy * dy < r * r) return a;
        }
        return null;
    }

    canvas.addEventListener('mousedown', (e) => {
        if (reacting) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const atom = getAtomAt(x, y);

        if (e.button === 2 && atom) { e.preventDefault(); removeAtom(atom); return; }

        if (atom) {
            dragging = atom;
            dragOffX = atom.x - x;
            dragOffY = atom.y - y;
            canvas.style.cursor = 'grabbing';
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (reacting) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;

        if (dragging) {
            dragging.x = x + dragOffX;
            dragging.y = y + dragOffY;
            render();
        } else {
            const atom = getAtomAt(x, y);
            hoveredAtom = atom;
            canvas.style.cursor = atom ? 'grab' : 'crosshair';
            render();
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (reacting) return;
        if (dragging) {
            for (let i = bonds.length - 1; i >= 0; i--) {
                if (bonds[i].a === dragging || bonds[i].b === dragging) {
                    const other = bonds[i].a === dragging ? bonds[i].b : bonds[i].a;
                    other.bonds = other.bonds.filter(b => b !== bonds[i]);
                    dragging.bonds = dragging.bonds.filter(b => b !== bonds[i]);
                    other.charge = 0;
                    bonds.splice(i, 1);
                }
            }
            dragging.charge = 0;
            trySmartBond(dragging);
            dragging = null;
            canvas.style.cursor = 'crosshair';
            updateBondInfo();
            render();
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // ─── Undo ───
    function saveUndo() {
        undoStack.push({
            atoms: atoms.map(a => ({ id: a.id, z: a.z, x: a.x, y: a.y, charge: a.charge, bonds: [] })),
            bonds: bonds.map(b => ({ aId: b.a.id, bId: b.b.id, order: b.order, type: b.type, energy: b.energy, ionicPct: b.ionicPct }))
        });
        if (undoStack.length > 20) undoStack.shift();
    }

    document.getElementById('btn-undo').addEventListener('click', () => {
        if (undoStack.length === 0 || reacting) return;
        const state = undoStack.pop();
        atoms.length = 0; bonds.length = 0;
        state.atoms.forEach(a => atoms.push(a));
        state.bonds.forEach(b => {
            const a = atoms.find(at => at.id === b.aId);
            const bAt = atoms.find(at => at.id === b.bId);
            if (a && bAt) {
                const bond = { a, b: bAt, order: b.order, type: b.type, energy: b.energy, ionicPct: b.ionicPct };
                bonds.push(bond);
                a.bonds.push(bond);
                bAt.bonds.push(bond);
            }
        });
        updateBondInfo();
        render();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (reacting) return;
        saveUndo();
        atoms.length = 0; bonds.length = 0; particles.length = 0;
        activePreset = null;
        document.getElementById('equation-section').style.display = 'none';
        document.getElementById('balancer-section').style.display = 'none';
        document.getElementById('bond-info-section').style.display = 'none';
        document.getElementById('energy-overlay').style.display = 'none';
        render();
    });

    // ═══════════════════════════════════════════════════════════════
    // REACT! — Product-Aware Reaction with Enthalpy
    // ═══════════════════════════════════════════════════════════════

    document.getElementById('btn-react').addEventListener('click', () => {
        if (atoms.length < 2 || reacting) return;
        if (activePreset) {
            runPresetReaction();
        } else {
            saveUndo();
            bonds.length = 0;
            atoms.forEach(a => { a.bonds = []; a.charge = 0; });
            atoms.forEach(a => trySmartBond(a));
            updateBondInfo();
            render();
        }
    });

    function runPresetReaction() {
        reacting = true;
        saveUndo();
        const preset = activePreset;
        const cw = W / devicePixelRatio;
        const ch = H / devicePixelRatio;

        // Calculate enthalpy from bond energies
        const bondsBreaking = bonds.map(b => b.energy || getBondEnergy(b.a.z, b.b.z, b.order));
        const totalBroken = bondsBreaking.reduce((s, e) => s + e, 0);

        const startPositions = atoms.map(a => ({ x: a.x, y: a.y }));
        const productAtomGroups = [];
        const atomPool = {};
        atoms.forEach(a => { if (!atomPool[a.z]) atomPool[a.z] = []; atomPool[a.z].push(a); });

        let groupIdx = 0;
        for (const product of preset.products) {
            for (let pi = 0; pi < product.count; pi++) {
                const atomRefs = [];
                let valid = true;
                for (const z of product.atoms) {
                    if (!atomPool[z] || atomPool[z].length === 0) { valid = false; break; }
                    atomRefs.push(atomPool[z].shift());
                }
                if (valid) {
                    const cx = 120 + groupIdx * 160;
                    productAtomGroups.push({ atomRefs, blueprint: product, centerX: cx, centerY: ch / 2 });
                    groupIdx++;
                }
            }
        }

        // Calculate energy of formed bonds
        let totalFormed = 0;
        productAtomGroups.forEach(g => {
            g.blueprint.bonds.forEach(bDef => {
                const [ai, bi, order] = bDef;
                totalFormed += getBondEnergy(g.atomRefs[ai].z, g.atomRefs[bi].z, order);
            });
        });

        const deltaH = totalBroken - totalFormed;  // + = endothermic, - = exothermic
        const presetDH = preset.deltaH || -deltaH;

        // Phase timing
        const P1 = 600, P2 = 900, P3 = 600, P4 = 800;

        bonds.length = 0;
        atoms.forEach(a => { a.bonds = []; a.charge = 0; });

        const scatterPositions = atoms.map(a => ({
            x: a.x + (Math.random() - 0.5) * 80,
            y: a.y + (Math.random() - 0.5) * 80
        }));

        const targetPositions = new Map();
        productAtomGroups.forEach(group => {
            group.atomRefs.forEach((atom, i) => {
                const layout = group.blueprint.layout[i];
                targetPositions.set(atom.id, { x: group.centerX + layout.x, y: group.centerY + layout.y });
            });
        });
        atoms.forEach(a => { if (!targetPositions.has(a.id)) targetPositions.set(a.id, { x: a.x, y: a.y }); });

        let startTime = null;
        let bondsFormed = false;

        function animateStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const total = P1 + P2 + P3 + P4;

            const ease = t => t * t * (3 - 2 * t);

            if (elapsed < P1) {
                const t = ease(elapsed / P1);
                atoms.forEach((a, i) => {
                    a.x = startPositions[i].x + (scatterPositions[i].x - startPositions[i].x) * t;
                    a.y = startPositions[i].y + (scatterPositions[i].y - startPositions[i].y) * t;
                });
            } else if (elapsed < P1 + P2) {
                const t = ease((elapsed - P1) / P2);
                atoms.forEach((a, i) => {
                    const target = targetPositions.get(a.id);
                    a.x = scatterPositions[i].x + (target.x - scatterPositions[i].x) * t;
                    a.y = scatterPositions[i].y + (target.y - scatterPositions[i].y) * t;
                });
            } else if (elapsed < P1 + P2 + P3) {
                atoms.forEach(a => {
                    const target = targetPositions.get(a.id);
                    a.x = target.x; a.y = target.y;
                });

                if (!bondsFormed) {
                    bondsFormed = true;
                    productAtomGroups.forEach(group => {
                        const bp = group.blueprint;
                        bp.bonds.forEach((bDef, bi) => {
                            const [ai, bi2, order] = bDef;
                            const atomA = group.atomRefs[ai], atomB = group.atomRefs[bi2];
                            let bondType = (bp.bondTypes && bp.bondTypes[bi]) ? bp.bondTypes[bi] : determineBondType(atomA.z, atomB.z);
                            const energy = getBondEnergy(atomA.z, atomB.z, order);
                            const ionic = ionicCharacter(atomA.z, atomB.z);
                            const bond = { a: atomA, b: atomB, order, type: bondType, energy, ionicPct: ionic };
                            bonds.push(bond);
                            atomA.bonds.push(bond);
                            atomB.bonds.push(bond);

                            if (bondType === 'ionic') {
                                const p1 = getProps(atomA.z), p2 = getProps(atomB.z);
                                if (p1.isMetal) { atomA.charge = Math.min(p1.valence, order); atomB.charge = -Math.min(p1.valence, order); }
                                else if (p2.isMetal) { atomB.charge = Math.min(p2.valence, order); atomA.charge = -Math.min(p2.valence, order); }
                            }
                        });
                    });

                    // Spawn reaction particles
                    spawnReactionParticles(presetDH, cw / 2, ch / 2);
                }
            } else if (elapsed < total) {
                // Phase 4: show enthalpy
                const t = ease((elapsed - P1 - P2 - P3) / P4);
                showEnthalpy(presetDH, t);
            } else {
                reacting = false;
                showEnthalpy(presetDH, 1);
                updateBondInfo();
                render();
                return;
            }

            render();
            requestAnimationFrame(animateStep);
        }
        requestAnimationFrame(animateStep);
    }

    // ─── Enthalpy Display ───
    function showEnthalpy(deltaH, t) {
        const overlay = document.getElementById('energy-overlay');
        overlay.style.display = 'flex';

        const label = document.getElementById('energy-label');
        const fill = document.getElementById('energy-bar-fill');
        const typeEl = document.getElementById('energy-type');

        const val = Math.round(deltaH * t);
        label.textContent = `ΔH = ${val} kcal/mol`;

        const pct = Math.min(Math.abs(val) / 400 * 100, 100);
        fill.style.width = pct + '%';

        if (deltaH < 0) {
            fill.className = 'energy-bar-fill exothermic';
            typeEl.textContent = '🔥 Exothermic — Energy Released';
            typeEl.className = 'energy-type exo';
        } else {
            fill.className = 'energy-bar-fill endothermic';
            typeEl.textContent = '❄️ Endothermic — Energy Absorbed';
            typeEl.className = 'energy-type endo';
        }
    }

    // ─── Reaction Particles ───
    function spawnReactionParticles(deltaH, cx, cy) {
        const isExo = deltaH < 0;
        const count = Math.min(Math.abs(deltaH) / 5, 40);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push({
                x: cx + (Math.random() - 0.5) * 100,
                y: cy + (Math.random() - 0.5) * 100,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60 + Math.random() * 40,
                maxLife: 100,
                color: isExo
                    ? `hsl(${20 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`
                    : `hsl(${200 + Math.random() * 40}, 80%, ${60 + Math.random() * 30}%)`,
                size: 2 + Math.random() * 3
            });
        }
    }

    // ─── Bond Info Panel ───
    function updateBondInfo() {
        const section = document.getElementById('bond-info-section');
        const content = document.getElementById('bond-info-content');

        if (bonds.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        let html = '<div class="bond-info-grid">';

        // Deduplicate bond types
        const seen = new Set();
        bonds.forEach(b => {
            const el1 = getElementInfo(b.a.z), el2 = getElementInfo(b.b.z);
            const key = `${Math.min(b.a.z, b.b.z)}-${Math.max(b.a.z, b.b.z)}-${b.order}`;
            if (seen.has(key)) return;
            seen.add(key);

            const orderStr = b.order === 1 ? 'Single' : b.order === 2 ? 'Double' : 'Triple';
            const typeStr = b.type === 'ionic' ? 'Ionic' : b.type === 'polar' ? 'Polar Covalent' : 'Nonpolar Covalent';
            const typeClass = b.type === 'ionic' ? 'ionic' : b.type === 'polar' ? 'polar' : 'nonpolar';

            html += `
                <div class="bond-info-row">
                    <div class="bond-pair">${el1.symbol}${b.order > 1 ? '═'.repeat(b.order - 1) : '─'}${el2.symbol}</div>
                    <div class="bond-details">
                        <span class="bond-tag ${typeClass}">${typeStr}</span>
                        <span class="bond-tag order">${orderStr}</span>
                    </div>
                    <div class="bond-numbers">
                        <span title="Bond energy">⚡ ${Math.round(b.energy || 0)} kcal</span>
                        <span title="Ionic character">⊕ ${b.ionicPct || 0}%</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        // VSEPR info for central atoms
        atoms.forEach(a => {
            if (a.bonds.length >= 2) {
                const shape = getMolecularShape(a);
                if (shape) {
                    const el = getElementInfo(a.z);
                    html += `<div class="vsepr-label">📐 ${el.symbol}: ${shape.shape} (${shape.angle}°)</div>`;
                }
            }
        });

        content.innerHTML = html;
    }

    // ─── Load Preset ───
    function loadPreset(idx) {
        if (reacting) return;
        const preset = PRESET_REACTIONS[idx];
        activePreset = preset;
        atoms.length = 0; bonds.length = 0; particles.length = 0;
        undoStack.length = 0;

        const cw = W / devicePixelRatio;
        const ch = H / devicePixelRatio;
        let xOff = 80;
        const yCenter = ch / 2;

        for (const mol of preset.reactantMolecules) {
            for (let mi = 0; mi < mol.count; mi++) {
                const molAtoms = [];
                mol.atoms.forEach((z, ai) => {
                    const angle = mol.atoms.length > 1 ? (ai / mol.atoms.length) * Math.PI * 2 : 0;
                    const spread = mol.atoms.length > 1 ? 28 : 0;
                    const x = xOff + Math.cos(angle) * spread;
                    const y = yCenter + Math.sin(angle) * spread + (Math.random() - 0.5) * 30;
                    molAtoms.push(addAtomSilent(z, x, y));
                });

                if (mol.bonds) {
                    mol.bonds.forEach(bDef => {
                        const [ai, bi, order] = bDef;
                        const atomA = molAtoms[ai], atomB = molAtoms[bi];
                        const bondType = determineBondType(atomA.z, atomB.z);
                        const energy = getBondEnergy(atomA.z, atomB.z, order);
                        const ionic = ionicCharacter(atomA.z, atomB.z);
                        const bond = { a: atomA, b: atomB, order, type: bondType, energy, ionicPct: ionic };
                        bonds.push(bond);
                        atomA.bonds.push(bond);
                        atomB.bonds.push(bond);
                    });
                }
                xOff += 90;
            }
            xOff += 40;
        }

        // Show equation + metadata
        document.getElementById('equation-section').style.display = 'block';
        document.getElementById('eq-text').textContent = preset.equation;
        document.getElementById('eq-name').textContent = preset.name + ' — ' + preset.type;

        const dhEl = document.getElementById('eq-dh');
        dhEl.textContent = `ΔH = ${preset.deltaH} kcal/mol`;
        dhEl.className = 'equation-dh ' + (preset.deltaH < 0 ? 'exo' : 'endo');

        document.getElementById('eq-geometry').textContent = '📐 ' + (preset.geometry || '');
        document.getElementById('eq-hybrid').textContent = '🔬 ' + (preset.hybridization || '');

        document.getElementById('energy-overlay').style.display = 'none';

        buildBalancer(preset);
        updateBondInfo();
        render();
    }

    // ═══════════════════════════════════════════════════════════════
    // CANVAS RENDERING
    // ═══════════════════════════════════════════════════════════════

    function render() {
        const w = W / devicePixelRatio;
        const h = H / devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        // Grid dots
        ctx.fillStyle = 'rgba(99,102,241,0.03)';
        for (let gx = 0; gx < w; gx += 40) {
            for (let gy = 0; gy < h; gy += 40) {
                ctx.beginPath();
                ctx.arc(gx, gy, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ── Bonds ──
        bonds.forEach(bond => {
            const { a, b, order, type } = bond;
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return;
            const nx = -dy / dist, ny = dx / dist;

            ctx.lineCap = 'round';

            if (type === 'ionic') {
                // Ionic: animated dashed golden line
                ctx.setLineDash([4, 6]);
                ctx.strokeStyle = 'rgba(255,200,100,0.5)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Ionic % label
                ctx.font = '8px Inter, sans-serif';
                ctx.fillStyle = 'rgba(255,200,100,0.6)';
                ctx.textAlign = 'center';
                ctx.fillText(`${bond.ionicPct}% ionic`, (a.x + b.x) / 2, (a.y + b.y) / 2 - 10);
            } else {
                const bondColor = type === 'polar' ? 'rgba(100,170,255,0.7)' : 'rgba(148,163,184,0.6)';
                const glowColor = type === 'polar' ? 'rgba(80,140,241,0.12)' : 'rgba(99,102,241,0.1)';

                for (let i = 0; i < order; i++) {
                    const offset = (i - (order - 1) / 2) * 6;
                    const ax = a.x + nx * offset, ay = a.y + ny * offset;
                    const bx = b.x + nx * offset, by = b.y + ny * offset;

                    // Glow
                    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
                    ctx.strokeStyle = glowColor; ctx.lineWidth = 6; ctx.stroke();

                    // Line
                    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
                    ctx.strokeStyle = bondColor; ctx.lineWidth = 2; ctx.stroke();
                }

                // Polarity labels
                if (type === 'polar') {
                    const en_a = getEN(a.z), en_b = getEN(b.z);
                    ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    if (en_a > en_b) {
                        ctx.fillStyle = 'rgba(100,180,255,0.6)'; ctx.fillText('δ⁻', a.x + nx * 16, a.y + ny * 16);
                        ctx.fillStyle = 'rgba(255,150,100,0.6)'; ctx.fillText('δ⁺', b.x - nx * 16, b.y - ny * 16);
                    } else {
                        ctx.fillStyle = 'rgba(100,180,255,0.6)'; ctx.fillText('δ⁻', b.x + nx * 16, b.y + ny * 16);
                        ctx.fillStyle = 'rgba(255,150,100,0.6)'; ctx.fillText('δ⁺', a.x - nx * 16, a.y - ny * 16);
                    }

                    // % ionic on polar bonds
                    ctx.font = '7px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(148,163,184,0.5)';
                    ctx.fillText(`${bond.ionicPct}%`, (a.x + b.x) / 2, (a.y + b.y) / 2 - 10);
                }

                // Bond energy label (subtle)
                if (bond.energy && !reacting) {
                    ctx.font = '7px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(148,163,184,0.3)';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(bond.energy)}`, (a.x + b.x) / 2, (a.y + b.y) / 2 + 10);
                }
            }
        });

        // ── Atoms ──
        atoms.forEach(atom => {
            const el = getElementInfo(atom.z);
            const color = getElementColor(atom.z);
            const r = atomRadius(atom.z);
            const props = getProps(atom.z);
            const isHovered = hoveredAtom === atom;

            // Electron cloud (covalent radius visualization)
            const cloudR = r * 1.8;
            const cloud = ctx.createRadialGradient(atom.x, atom.y, r * 0.3, atom.x, atom.y, cloudR);
            cloud.addColorStop(0, color + '18');
            cloud.addColorStop(0.6, color + '08');
            cloud.addColorStop(1, 'transparent');
            ctx.fillStyle = cloud;
            ctx.beginPath(); ctx.arc(atom.x, atom.y, cloudR, 0, Math.PI * 2); ctx.fill();

            // Atom body
            ctx.beginPath();
            ctx.arc(atom.x, atom.y, r, 0, Math.PI * 2);
            ctx.fillStyle = color + (isHovered ? '35' : '18');
            ctx.fill();
            ctx.strokeStyle = color + (isHovered ? 'cc' : '88');
            ctx.lineWidth = isHovered ? 2.5 : 1.5;
            ctx.stroke();

            // Symbol
            ctx.fillStyle = color;
            ctx.font = `bold ${Math.max(11, r * 0.7)}px Inter, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(el.symbol, atom.x, atom.y - 1);

            // Atomic number
            ctx.fillStyle = 'rgba(148,163,184,0.35)';
            ctx.font = '8px Inter, sans-serif';
            ctx.fillText(atom.z, atom.x, atom.y + r * 0.55);

            // Lone pairs (Lewis dots)
            const usedBonds = atom.bonds.reduce((s, b) => s + b.order, 0);
            const lonePairCount = props.lonePairs || 0;
            if (lonePairCount > 0 && !props.isMetal) {
                const bondAngles = atom.bonds.map(b => {
                    const other = b.a === atom ? b.b : b.a;
                    return Math.atan2(other.y - atom.y, other.x - atom.x);
                });

                // Place lone pairs away from bonds
                for (let lp = 0; lp < lonePairCount; lp++) {
                    let angle;
                    if (bondAngles.length === 0) {
                        angle = (lp / lonePairCount) * Math.PI * 2;
                    } else {
                        // Find gap between bonds
                        const sorted = [...bondAngles].sort((a, b) => a - b);
                        let maxGap = 0, gapStart = 0;
                        for (let gi = 0; gi < sorted.length; gi++) {
                            const next = (gi + 1) % sorted.length;
                            let gap = sorted[next] - sorted[gi];
                            if (next === 0) gap += Math.PI * 2;
                            if (gap > maxGap) { maxGap = gap; gapStart = sorted[gi]; }
                        }
                        angle = gapStart + maxGap * (lp + 1) / (lonePairCount + 1);
                    }

                    const d1 = r + 6, d2 = r + 10;
                    const perpOff = 2;
                    const cx = Math.cos(angle), sy = Math.sin(angle);

                    ctx.fillStyle = color + '80';
                    ctx.beginPath();
                    ctx.arc(atom.x + cx * d1 - sy * perpOff, atom.y + sy * d1 + cx * perpOff, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(atom.x + cx * d2 + sy * perpOff, atom.y + sy * d2 - cx * perpOff, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Free bonding dots (available bonds)
            const freeBonds = Math.max(0, props.maxBonds - usedBonds);
            if (freeBonds > 0 && !props.isMetal) {
                for (let i = 0; i < freeBonds; i++) {
                    const angle = (i / Math.max(freeBonds, 1)) * Math.PI * 2 - Math.PI / 2;
                    // Check this position doesn't overlap with lone pairs
                    const ddx = Math.cos(angle) * (r + 8);
                    const ddy = Math.sin(angle) * (r + 8);
                    ctx.beginPath();
                    ctx.arc(atom.x + ddx, atom.y + ddy, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = color + '60';
                    ctx.fill();
                }
            }

            // Charge label
            if (atom.charge !== 0) {
                const chargeStr = atom.charge > 0
                    ? (atom.charge === 1 ? '⁺' : `${atom.charge}⁺`)
                    : (atom.charge === -1 ? '⁻' : `${Math.abs(atom.charge)}⁻`);
                ctx.fillStyle = atom.charge > 0 ? '#ff9966' : '#66bbff';
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.textAlign = 'left'; ctx.textBaseline = 'top';
                ctx.fillText(chargeStr, atom.x + r - 6, atom.y - r - 6);
            }

            // VSEPR shape label (on hover)
            if (isHovered && atom.bonds.length >= 2) {
                const shape = getMolecularShape(atom);
                if (shape) {
                    ctx.fillStyle = 'rgba(200,220,255,0.85)';
                    ctx.font = 'bold 10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${shape.shape} ${shape.angle}°`, atom.x, atom.y - r - 14);
                }
            }
        });

        // ── Drag hint lines ──
        if (dragging && !reacting) {
            const avail = getAvailableBonds(dragging);
            if (avail > 0) {
                for (const other of atoms) {
                    if (other === dragging || getAvailableBonds(other) <= 0 || !canBond(dragging.z, other.z)) continue;
                    const dx = other.x - dragging.x, dy = other.y - dragging.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < BOND_DIST * 1.5) {
                        const bondType = determineBondType(dragging.z, other.z);
                        ctx.setLineDash([4, 4]);
                        ctx.strokeStyle = bondType === 'ionic' ? 'rgba(255,200,100,0.25)' : 'rgba(99,102,241,0.25)';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(dragging.x, dragging.y); ctx.lineTo(other.x, other.y); ctx.stroke();
                        ctx.setLineDash([]);

                        ctx.font = '8px Inter, sans-serif';
                        ctx.fillStyle = 'rgba(148,163,184,0.5)';
                        ctx.textAlign = 'center';
                        ctx.fillText(bondType, (dragging.x + other.x) / 2, (dragging.y + other.y) / 2 - 8);
                    }
                }
            }
        }

        // ── Particles ──
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.02; // gravity
            p.life--;
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    // ─── Presets ───
    function buildPresets() {
        const list = document.getElementById('preset-list');
        PRESET_REACTIONS.forEach((preset, idx) => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            const dhClass = preset.deltaH < 0 ? 'exo' : 'endo';
            btn.innerHTML = `
                <div class="preset-top">
                    <span class="preset-name">${preset.name}</span>
                    <span class="preset-type">${preset.type}</span>
                </div>
                <div class="preset-bottom">
                    <span class="preset-dh ${dhClass}">${preset.deltaH > 0 ? '+' : ''}${preset.deltaH} kcal</span>
                </div>
            `;
            btn.addEventListener('click', () => loadPreset(idx));
            list.appendChild(btn);
        });
    }

    // ─── Equation Balancer ───
    function buildBalancer(preset) {
        const section = document.getElementById('balancer-section');
        section.style.display = 'block';

        const container = document.getElementById('balance-terms');
        container.innerHTML = '';

        const q = preset.balanceQuestion;
        const allTerms = [];

        Object.keys(q.reactants).forEach((formula, i) => {
            if (i > 0) {
                const op = document.createElement('span');
                op.className = 'balance-operator'; op.textContent = '+';
                container.appendChild(op);
            }
            const term = createBalanceTerm(formula);
            container.appendChild(term.el);
            allTerms.push(term);
        });

        const arrow = document.createElement('span');
        arrow.className = 'balance-arrow'; arrow.textContent = '→';
        container.appendChild(arrow);

        Object.keys(q.products).forEach((formula, i) => {
            if (i > 0) {
                const op = document.createElement('span');
                op.className = 'balance-operator'; op.textContent = '+';
                container.appendChild(op);
            }
            const term = createBalanceTerm(formula);
            container.appendChild(term.el);
            allTerms.push(term);
        });

        document.getElementById('btn-check').onclick = () => {
            const userAnswer = {};
            allTerms.forEach(t => { userAnswer[t.formula] = t.value; });
            const correct = Object.keys(q.answer).every(k => userAnswer[k] === q.answer[k]);
            const fb = document.getElementById('balance-feedback');
            fb.classList.remove('hidden', 'correct', 'incorrect');
            if (correct) {
                fb.classList.add('correct');
                fb.textContent = '✅ Perfectly Balanced!';
                score++;
            } else {
                fb.classList.add('incorrect');
                fb.textContent = '❌ Not quite — check atom counts!';
                score = Math.max(0, score - 1);
            }
            document.getElementById('score-num').textContent = score;
        };

        document.getElementById('balance-feedback').classList.add('hidden');
    }

    function createBalanceTerm(formula) {
        const term = { formula, value: 1, el: null };
        const div = document.createElement('div');
        div.className = 'balance-term';

        const minus = document.createElement('button');
        minus.className = 'coeff-btn'; minus.textContent = '−';
        const val = document.createElement('span');
        val.className = 'coeff-value'; val.textContent = '1';
        const plus = document.createElement('button');
        plus.className = 'coeff-btn'; plus.textContent = '+';
        const label = document.createElement('span');
        label.className = 'balance-formula'; label.textContent = formula;

        minus.addEventListener('click', () => { term.value = Math.max(1, term.value - 1); val.textContent = term.value; });
        plus.addEventListener('click', () => { term.value = Math.min(10, term.value + 1); val.textContent = term.value; });

        div.appendChild(minus); div.appendChild(val); div.appendChild(plus); div.appendChild(label);
        term.el = div;
        return term;
    }

    // ─── Init ───
    buildPresets();
    render();

    let time = 0;
    function animate() {
        time += 0.016;
        if (!reacting) {
            atoms.forEach(atom => {
                if (atom.bonds.length === 0 && atom !== dragging) {
                    atom.y += Math.sin(time * 2 + atom.id) * 0.12;
                }
            });
        }
        render();
        requestAnimationFrame(animate);
    }
    animate();

})();
