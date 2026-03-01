// ============================================
//  ChemVerse — Reaction Lab Engine v2
//  Chemistry-accurate bonding with EN, bond types,
//  octet rule, and product-aware reactions
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
    const atoms = [];       // { id, z, x, y, bonds: [], charge: 0 }
    const bonds = [];       // { a, b, order, type: 'nonpolar'|'polar'|'ionic' }
    let nextId = 1;
    let dragging = null;
    let dragOffX = 0, dragOffY = 0;
    let undoStack = [];
    let activePreset = null;
    let score = 0;
    let reacting = false;

    const ATOM_RADIUS = 24;
    const BOND_DIST = 72;

    // ─── Chemistry Helpers ───

    function getEN(z) {
        return ELECTRONEGATIVITY[z] || 1.5;
    }

    function getProps(z) {
        return ELEMENT_PROPERTIES[z] || { valence: 0, maxBonds: 0, electronsNeeded: 0, isMetal: false };
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

    // Determine bond type from electronegativity difference
    function determineBondType(z1, z2) {
        const en1 = getEN(z1);
        const en2 = getEN(z2);
        const delta = Math.abs(en1 - en2);
        if (delta > 1.7) return 'ionic';
        if (delta >= 0.4) return 'polar';
        return 'nonpolar';
    }

    // Calculate proper bond order for two atoms
    function calculateBondOrder(z1, z2) {
        const p1 = getProps(z1);
        const p2 = getProps(z2);

        // Metals donate electrons → ionic, single bond equivalent
        if (p1.isMetal || p2.isMetal) return 1;

        // Both nonmetals: bond order = min(electrons needed by each)
        // But cap at each atom's remaining capacity
        return Math.min(p1.electronsNeeded, p2.electronsNeeded, 3);
    }

    // Get remaining bonding capacity for an atom
    function getAvailableBonds(atom) {
        const props = getProps(atom.z);
        const currentBonds = atom.bonds.reduce((sum, b) => sum + b.order, 0);
        return Math.max(0, props.maxBonds - currentBonds);
    }

    // Can two elements bond?
    function canBond(z1, z2) {
        const p1 = getProps(z1);
        const p2 = getProps(z2);

        // Noble gases can't bond (maxBonds = 0)
        if (p1.maxBonds === 0 || p2.maxBonds === 0) return false;

        // Two metals generally don't form molecular bonds
        if (p1.isMetal && p2.isMetal) return false;

        return true;
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

            item.innerHTML = `
                <div class="pi-symbol" style="color:${color}; background:${color}15; border-color:${color}40">${el.symbol}</div>
                <div class="pi-info">
                    <div class="pi-name">${el.name}</div>
                    <div class="pi-valence">Bonds: ${props.maxBonds} · EN: ${en.toFixed(1)}</div>
                </div>
            `;

            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', z);
                e.dataTransfer.effectAllowed = 'copy';
            });

            item.addEventListener('click', () => {
                addAtom(z, W / devicePixelRatio / 2 + (Math.random() - 0.5) * 100,
                    H / devicePixelRatio / 2 + (Math.random() - 0.5) * 100);
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
        render();
    }

    // ─── Smart Bond Engine ───
    // Uses electronegativity, bond type, and proper bond orders
    function trySmartBond(newAtom) {
        const avail = getAvailableBonds(newAtom);
        if (avail <= 0) return;

        // Find all atoms within range, sorted by distance
        const candidates = [];
        for (const other of atoms) {
            if (other === newAtom) continue;
            if (getAvailableBonds(other) <= 0) continue;
            if (!canBond(newAtom.z, other.z)) continue;
            if (bonds.some(b => (b.a === newAtom && b.b === other) || (b.a === other && b.b === newAtom))) continue;

            const dx = other.x - newAtom.x;
            const dy = other.y - newAtom.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < BOND_DIST) candidates.push({ atom: other, dist });
        }

        candidates.sort((a, b) => a.dist - b.dist);

        let remaining = avail;
        for (const c of candidates) {
            if (remaining <= 0) break;
            const otherAvail = getAvailableBonds(c.atom);
            if (otherAvail <= 0) continue;

            const bondType = determineBondType(newAtom.z, c.atom.z);
            let order = calculateBondOrder(newAtom.z, c.atom.z);
            order = Math.min(order, remaining, otherAvail);
            if (order <= 0) continue;

            const bond = { a: newAtom, b: c.atom, order, type: bondType };
            bonds.push(bond);
            newAtom.bonds.push(bond);
            c.atom.bonds.push(bond);
            remaining -= order;

            // Set charges for ionic bonds
            if (bondType === 'ionic') {
                const p1 = getProps(newAtom.z);
                const p2 = getProps(c.atom.z);
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
            const dx = a.x - x;
            const dy = a.y - y;
            if (dx * dx + dy * dy < ATOM_RADIUS * ATOM_RADIUS) return a;
        }
        return null;
    }

    canvas.addEventListener('mousedown', (e) => {
        if (reacting) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const atom = getAtomAt(x, y);

        if (e.button === 2 && atom) {
            e.preventDefault();
            removeAtom(atom);
            return;
        }

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
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (dragging) {
            dragging.x = x + dragOffX;
            dragging.y = y + dragOffY;
            render();
        } else {
            const atom = getAtomAt(x, y);
            canvas.style.cursor = atom ? 'grab' : 'crosshair';
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (reacting) return;
        if (dragging) {
            // Remove bonds and rebond with chemistry rules
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
            render();
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // ─── Undo ───
    function saveUndo() {
        undoStack.push({
            atoms: atoms.map(a => ({ id: a.id, z: a.z, x: a.x, y: a.y, charge: a.charge, bonds: [] })),
            bonds: bonds.map(b => ({ aId: b.a.id, bId: b.b.id, order: b.order, type: b.type }))
        });
        if (undoStack.length > 20) undoStack.shift();
    }

    document.getElementById('btn-undo').addEventListener('click', () => {
        if (undoStack.length === 0 || reacting) return;
        const state = undoStack.pop();
        atoms.length = 0;
        bonds.length = 0;
        state.atoms.forEach(a => atoms.push(a));
        state.bonds.forEach(b => {
            const a = atoms.find(at => at.id === b.aId);
            const bAt = atoms.find(at => at.id === b.bId);
            if (a && bAt) {
                const bond = { a, b: bAt, order: b.order, type: b.type };
                bonds.push(bond);
                a.bonds.push(bond);
                bAt.bonds.push(bond);
            }
        });
        render();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (reacting) return;
        saveUndo();
        atoms.length = 0;
        bonds.length = 0;
        activePreset = null;
        document.getElementById('equation-section').style.display = 'none';
        document.getElementById('balancer-section').style.display = 'none';
        render();
    });

    // ═══════════════════════════════════════════════════════════════
    // REACT! — Product-Aware Reaction Animation
    // ═══════════════════════════════════════════════════════════════

    document.getElementById('btn-react').addEventListener('click', () => {
        if (atoms.length < 2 || reacting) return;
        if (activePreset) {
            runPresetReaction();
        } else {
            // Free-form: just try smart bonding for all atoms
            saveUndo();
            bonds.length = 0;
            atoms.forEach(a => { a.bonds = []; a.charge = 0; });
            atoms.forEach(a => trySmartBond(a));
            render();
        }
    });

    function runPresetReaction() {
        reacting = true;
        saveUndo();

        const preset = activePreset;
        const cw = W / devicePixelRatio;
        const ch = H / devicePixelRatio;

        // Phase 1: Break all existing bonds (animate separation)
        const phase1Duration = 600; // ms
        const phase2Duration = 800;
        const phase3Duration = 600;

        // Collect all current atom positions
        const startPositions = atoms.map(a => ({ x: a.x, y: a.y }));

        // Calculate target product molecules
        const productAtomGroups = []; // array of { atomRefs, blueprint, centerX, centerY }

        // Gather atoms by element type
        const atomPool = {};
        atoms.forEach(a => {
            if (!atomPool[a.z]) atomPool[a.z] = [];
            atomPool[a.z].push(a);
        });

        // Assign atoms to product molecules
        let groupX = 100;
        const groupY = ch / 2;
        const groupSpacing = 140;

        for (const product of preset.products) {
            for (let pi = 0; pi < product.count; pi++) {
                const atomRefs = [];
                let valid = true;

                for (const z of product.atoms) {
                    if (!atomPool[z] || atomPool[z].length === 0) { valid = false; break; }
                    atomRefs.push(atomPool[z].shift());
                }

                if (valid) {
                    productAtomGroups.push({
                        atomRefs,
                        blueprint: product,
                        centerX: groupX + (pi + productAtomGroups.length) * groupSpacing,
                        centerY: groupY
                    });
                }
            }
        }

        // Phase 1: Clear bonds and scatter apart slightly
        bonds.length = 0;
        atoms.forEach(a => { a.bonds = []; a.charge = 0; });

        const scatterPositions = atoms.map(a => ({
            x: a.x + (Math.random() - 0.5) * 60,
            y: a.y + (Math.random() - 0.5) * 60
        }));

        // Calculate final positions from blueprints
        const targetPositions = new Map();
        productAtomGroups.forEach(group => {
            group.atomRefs.forEach((atom, i) => {
                const layout = group.blueprint.layout[i];
                targetPositions.set(atom.id, {
                    x: group.centerX + layout.x,
                    y: group.centerY + layout.y
                });
            });
        });

        // For any atoms not assigned to a product, just leave them
        atoms.forEach(a => {
            if (!targetPositions.has(a.id)) {
                targetPositions.set(a.id, { x: a.x, y: a.y });
            }
        });

        let startTime = null;

        function animateStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const totalDuration = phase1Duration + phase2Duration + phase3Duration;

            if (elapsed < phase1Duration) {
                // Phase 1: scatter
                const t = elapsed / phase1Duration;
                const ease = t * t * (3 - 2 * t); // smoothstep
                atoms.forEach((a, i) => {
                    a.x = startPositions[i].x + (scatterPositions[i].x - startPositions[i].x) * ease;
                    a.y = startPositions[i].y + (scatterPositions[i].y - startPositions[i].y) * ease;
                });
            } else if (elapsed < phase1Duration + phase2Duration) {
                // Phase 2: move to product positions
                const t = (elapsed - phase1Duration) / phase2Duration;
                const ease = t * t * (3 - 2 * t);
                atoms.forEach((a, i) => {
                    const target = targetPositions.get(a.id);
                    a.x = scatterPositions[i].x + (target.x - scatterPositions[i].x) * ease;
                    a.y = scatterPositions[i].y + (target.y - scatterPositions[i].y) * ease;
                });
            } else if (elapsed < totalDuration) {
                // Phase 3: form bonds
                const t = (elapsed - phase1Duration - phase2Duration) / phase3Duration;

                // Snap to final positions
                atoms.forEach(a => {
                    const target = targetPositions.get(a.id);
                    a.x = target.x;
                    a.y = target.y;
                });

                // Form product bonds (do once)
                if (bonds.length === 0) {
                    productAtomGroups.forEach(group => {
                        const bp = group.blueprint;
                        bp.bonds.forEach((bDef, bi) => {
                            const [ai, bi2, order] = bDef;
                            const atomA = group.atomRefs[ai];
                            const atomB = group.atomRefs[bi2];

                            let bondType;
                            if (bp.bondTypes && bp.bondTypes[bi]) {
                                bondType = bp.bondTypes[bi];
                            } else {
                                bondType = determineBondType(atomA.z, atomB.z);
                            }

                            const bond = { a: atomA, b: atomB, order, type: bondType };
                            bonds.push(bond);
                            atomA.bonds.push(bond);
                            atomB.bonds.push(bond);

                            // Set ionic charges
                            if (bondType === 'ionic') {
                                const p1 = getProps(atomA.z);
                                const p2 = getProps(atomB.z);
                                if (p1.isMetal) {
                                    atomA.charge = Math.min(p1.valence, order);
                                    atomB.charge = -Math.min(p1.valence, order);
                                } else if (p2.isMetal) {
                                    atomB.charge = Math.min(p2.valence, order);
                                    atomA.charge = -Math.min(p2.valence, order);
                                }
                            }
                        });
                    });
                }
            } else {
                reacting = false;
                render();
                return;
            }

            render();
            requestAnimationFrame(animateStep);
        }

        requestAnimationFrame(animateStep);
    }

    // ─── Load Preset with Proper Reactant Molecules ───
    function loadPreset(idx) {
        if (reacting) return;
        const preset = PRESET_REACTIONS[idx];
        activePreset = preset;

        atoms.length = 0;
        bonds.length = 0;
        undoStack.length = 0;

        const cw = W / devicePixelRatio;
        const ch = H / devicePixelRatio;

        // Place reactant molecules with correct internal bonds
        let xOff = 80;
        const yCenter = ch / 2;

        for (const mol of preset.reactantMolecules) {
            for (let mi = 0; mi < mol.count; mi++) {
                const molAtoms = [];

                // Create atoms for this molecule
                mol.atoms.forEach((z, ai) => {
                    // Spread atoms within molecule
                    const angle = mol.atoms.length > 1 ? (ai / mol.atoms.length) * Math.PI * 2 : 0;
                    const spread = mol.atoms.length > 1 ? 28 : 0;
                    const x = xOff + Math.cos(angle) * spread;
                    const y = yCenter + Math.sin(angle) * spread + (Math.random() - 0.5) * 40;
                    const atom = addAtomSilent(z, x, y);
                    molAtoms.push(atom);
                });

                // Create bonds within molecule
                if (mol.bonds) {
                    mol.bonds.forEach(bDef => {
                        const [ai, bi, order] = bDef;
                        const atomA = molAtoms[ai];
                        const atomB = molAtoms[bi];
                        const bondType = determineBondType(atomA.z, atomB.z);
                        const bond = { a: atomA, b: atomB, order, type: bondType };
                        bonds.push(bond);
                        atomA.bonds.push(bond);
                        atomB.bonds.push(bond);
                    });
                }

                xOff += 90;
            }
            xOff += 40; // gap between different molecule types
        }

        // Show equation
        document.getElementById('equation-section').style.display = 'block';
        document.getElementById('eq-text').textContent = preset.equation;
        document.getElementById('eq-name').textContent = preset.name + ' — ' + preset.type;

        buildBalancer(preset);
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
        ctx.fillStyle = 'rgba(99,102,241,0.04)';
        for (let gx = 0; gx < w; gx += 40) {
            for (let gy = 0; gy < h; gy += 40) {
                ctx.beginPath();
                ctx.arc(gx, gy, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Bonds
        bonds.forEach(bond => {
            const { a, b, order, type } = bond;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return;
            const nx = -dy / dist;
            const ny = dx / dist;

            ctx.lineCap = 'round';

            if (type === 'ionic') {
                // Ionic: dashed line with charge indicators
                ctx.setLineDash([3, 5]);
                ctx.strokeStyle = 'rgba(255,200,100,0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                // Covalent bonds
                const bondColor = type === 'polar'
                    ? 'rgba(120,180,255,0.6)'   // polar = blue tint
                    : 'rgba(148,163,184,0.6)';  // nonpolar = gray

                const glowColor = type === 'polar'
                    ? 'rgba(99,140,241,0.15)'
                    : 'rgba(99,102,241,0.15)';

                for (let i = 0; i < order; i++) {
                    const offset = (i - (order - 1) / 2) * 6;
                    ctx.beginPath();
                    ctx.moveTo(a.x + nx * offset, a.y + ny * offset);
                    ctx.lineTo(b.x + nx * offset, b.y + ny * offset);

                    ctx.strokeStyle = glowColor;
                    ctx.lineWidth = 6;
                    ctx.stroke();

                    ctx.strokeStyle = bondColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Polar bond: show δ+ and δ-
                if (type === 'polar') {
                    const en_a = getEN(a.z);
                    const en_b = getEN(b.z);
                    const midX = (a.x + b.x) / 2;
                    const midY = (a.y + b.y) / 2;

                    ctx.font = '10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    if (en_a > en_b) {
                        ctx.fillStyle = 'rgba(100,180,255,0.7)';
                        ctx.fillText('δ⁻', a.x + nx * 14, a.y + ny * 14);
                        ctx.fillStyle = 'rgba(255,150,100,0.7)';
                        ctx.fillText('δ⁺', b.x - nx * 14, b.y - ny * 14);
                    } else {
                        ctx.fillStyle = 'rgba(100,180,255,0.7)';
                        ctx.fillText('δ⁻', b.x + nx * 14, b.y + ny * 14);
                        ctx.fillStyle = 'rgba(255,150,100,0.7)';
                        ctx.fillText('δ⁺', a.x - nx * 14, a.y - ny * 14);
                    }
                }
            }
        });

        // Atoms
        atoms.forEach(atom => {
            const el = getElementInfo(atom.z);
            const color = getElementColor(atom.z);
            const props = getProps(atom.z);

            // Outer glow
            const grd = ctx.createRadialGradient(atom.x, atom.y, ATOM_RADIUS * 0.5, atom.x, atom.y, ATOM_RADIUS * 1.5);
            grd.addColorStop(0, color + '30');
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(atom.x, atom.y, ATOM_RADIUS * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Atom circle
            ctx.beginPath();
            ctx.arc(atom.x, atom.y, ATOM_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = color + '20';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Symbol
            ctx.fillStyle = color;
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.symbol, atom.x, atom.y - 2);

            // Lone pair / free electron dots
            const usedBonds = atom.bonds.reduce((s, b) => s + b.order, 0);
            const freeDots = Math.max(0, props.maxBonds - usedBonds);
            const dotR = 3;
            for (let i = 0; i < freeDots; i++) {
                const angle = (i / Math.max(freeDots, 1)) * Math.PI * 2 - Math.PI / 2;
                const ddx = Math.cos(angle) * (ATOM_RADIUS + 8);
                const ddy = Math.sin(angle) * (ATOM_RADIUS + 8);
                ctx.beginPath();
                ctx.arc(atom.x + ddx, atom.y + ddy, dotR, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }

            // Charge label for ionic bonds
            if (atom.charge !== 0) {
                const chargeStr = atom.charge > 0
                    ? (atom.charge === 1 ? '⁺' : `${atom.charge}⁺`)
                    : (atom.charge === -1 ? '⁻' : `${Math.abs(atom.charge)}⁻`);
                ctx.fillStyle = atom.charge > 0 ? '#ff9966' : '#66bbff';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(chargeStr, atom.x + ATOM_RADIUS - 4, atom.y - ATOM_RADIUS - 4);
            }

            // Atomic number
            ctx.fillStyle = 'rgba(148,163,184,0.4)';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(atom.z, atom.x, atom.y + 13);
        });

        // Drag hint lines
        if (dragging && !reacting) {
            const avail = getAvailableBonds(dragging);
            if (avail > 0) {
                for (const other of atoms) {
                    if (other === dragging) continue;
                    if (getAvailableBonds(other) <= 0) continue;
                    if (!canBond(dragging.z, other.z)) continue;
                    const dx = other.x - dragging.x;
                    const dy = other.y - dragging.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < BOND_DIST * 1.5) {
                        const bondType = determineBondType(dragging.z, other.z);
                        ctx.setLineDash([4, 4]);
                        ctx.strokeStyle = bondType === 'ionic'
                            ? 'rgba(255,200,100,0.3)'
                            : 'rgba(99,102,241,0.3)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(dragging.x, dragging.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Show predicted bond type
                        const midX = (dragging.x + other.x) / 2;
                        const midY = (dragging.y + other.y) / 2;
                        ctx.font = '9px Inter, sans-serif';
                        ctx.fillStyle = 'rgba(148,163,184,0.6)';
                        ctx.textAlign = 'center';
                        ctx.fillText(bondType, midX, midY - 8);
                    }
                }
            }
        }
    }

    // ─── Presets ───
    function buildPresets() {
        const list = document.getElementById('preset-list');
        PRESET_REACTIONS.forEach((preset, idx) => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.innerHTML = `
                <span>${preset.name}</span>
                <span class="preset-type">${preset.type}</span>
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
                op.className = 'balance-operator';
                op.textContent = '+';
                container.appendChild(op);
            }
            const term = createBalanceTerm(formula);
            container.appendChild(term.el);
            allTerms.push(term);
        });

        const arrow = document.createElement('span');
        arrow.className = 'balance-arrow';
        arrow.textContent = '→';
        container.appendChild(arrow);

        Object.keys(q.products).forEach((formula, i) => {
            if (i > 0) {
                const op = document.createElement('span');
                op.className = 'balance-operator';
                op.textContent = '+';
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
                fb.textContent = '❌ Not quite — check the atom counts!';
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
        minus.className = 'coeff-btn';
        minus.textContent = '−';

        const val = document.createElement('span');
        val.className = 'coeff-value';
        val.textContent = '1';

        const plus = document.createElement('button');
        plus.className = 'coeff-btn';
        plus.textContent = '+';

        const label = document.createElement('span');
        label.className = 'balance-formula';
        label.textContent = formula;

        minus.addEventListener('click', () => {
            term.value = Math.max(1, term.value - 1);
            val.textContent = term.value;
        });
        plus.addEventListener('click', () => {
            term.value = Math.min(10, term.value + 1);
            val.textContent = term.value;
        });

        div.appendChild(minus);
        div.appendChild(val);
        div.appendChild(plus);
        div.appendChild(label);
        term.el = div;

        return term;
    }

    // ─── Init ───
    buildPresets();
    render();

    // Gentle idle animation
    let time = 0;
    function animate() {
        time += 0.016;
        if (!reacting) {
            atoms.forEach(atom => {
                if (atom.bonds.length === 0 && atom !== dragging) {
                    atom.y += Math.sin(time * 2 + atom.id) * 0.15;
                }
            });
        }
        render();
        requestAnimationFrame(animate);
    }
    animate();

})();
