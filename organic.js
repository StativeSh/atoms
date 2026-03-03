// ChemVerse — Organic Molecule Builder
(function () {
    'use strict';

    const ATOM_DATA = {
        C: { color: '#94a3b8', r: 16, valence: 4, mass: 12.011 }, O: { color: '#ef4444', r: 14, valence: 2, mass: 15.999 },
        N: { color: '#3b82f6', r: 14, valence: 3, mass: 14.007 }, S: { color: '#eab308', r: 15, valence: 2, mass: 32.06 },
        Cl: { color: '#22c55e', r: 14, valence: 1, mass: 35.45 }, Br: { color: '#a855f7', r: 15, valence: 1, mass: 79.904 },
        F: { color: '#06b6d4', r: 12, valence: 1, mass: 18.998 }, H: { color: '#e2e8f0', r: 8, valence: 1, mass: 1.008 }
    };

    const CHAIN_NAMES = ['', 'meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];

    let atoms = [], bonds = [], selectedAtom = null, dragAtom = null, tool = 'C', bondOrder = 1;
    const canvas = document.getElementById('org-canvas'), ctx = canvas.getContext('2d');

    // ─── Tool Selectors ───
    document.querySelectorAll('.atom-btn').forEach(b => b.addEventListener('click', () => {
        tool = b.dataset.atom;
        document.querySelectorAll('.atom-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
    }));
    document.querySelectorAll('.bond-btn').forEach(b => b.addEventListener('click', () => {
        bondOrder = +b.dataset.bond;
        document.querySelectorAll('.bond-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
    }));

    // ─── Quick Builds ───
    document.querySelectorAll('.quick-btn').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.chain) buildChain(+b.dataset.chain);
        else if (b.dataset.preset) buildPreset(b.dataset.preset);
    }));
    document.getElementById('btn-clear').addEventListener('click', () => { atoms = []; bonds = []; selectedAtom = null; draw(); updateInfo(); });
    document.getElementById('btn-add-h').addEventListener('click', autoAddH);

    function buildChain(n) {
        atoms = []; bonds = [];
        for (let i = 0; i < n; i++) {
            atoms.push({ el: 'C', x: 150 + i * 80, y: 225 + (i % 2) * 30 });
            if (i > 0) bonds.push({ a: i - 1, b: i, order: 1 });
        }
        autoAddH(); draw(); updateInfo();
    }

    function buildPreset(name) {
        atoms = []; bonds = [];
        if (name === 'ethanol') {
            atoms.push({ el: 'C', x: 250, y: 225 }, { el: 'C', x: 370, y: 225 }, { el: 'O', x: 490, y: 225 }, { el: 'H', x: 540, y: 225 });
            bonds.push({ a: 0, b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 });
            autoAddH();
        } else if (name === 'acetone') {
            atoms.push({ el: 'C', x: 250, y: 225 }, { el: 'C', x: 400, y: 225 }, { el: 'C', x: 550, y: 225 }, { el: 'O', x: 400, y: 120 });
            bonds.push({ a: 0, b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 2 });
            autoAddH();
        } else if (name === 'acetic-acid') {
            atoms.push({ el: 'C', x: 250, y: 225 }, { el: 'C', x: 400, y: 225 }, { el: 'O', x: 400, y: 120 }, { el: 'O', x: 530, y: 225 }, { el: 'H', x: 600, y: 225 });
            bonds.push({ a: 0, b: 1, order: 1 }, { a: 1, b: 2, order: 2 }, { a: 1, b: 3, order: 1 }, { a: 3, b: 4, order: 1 });
            autoAddH();
        } else if (name === 'benzene') {
            const cx = 400, cy = 225, r = 80;
            for (let i = 0; i < 6; i++) {
                const a = Math.PI / 2 + i * Math.PI / 3;
                atoms.push({ el: 'C', x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
            }
            for (let i = 0; i < 6; i++) bonds.push({ a: i, b: (i + 1) % 6, order: i % 2 === 0 ? 2 : 1 });
            autoAddH();
        }
        draw(); updateInfo();
    }

    function autoAddH() {
        // Add implicit H to satisfy valence — iterate only over existing atoms
        const origLen = atoms.length;
        for (let i = 0; i < origLen; i++) {
            const atom = atoms[i];
            if (atom.el === 'H') continue; // don't add H to H
            const v = ATOM_DATA[atom.el].valence;
            let used = 0;
            bonds.forEach(b => { if (b.a === i || b.b === i) used += b.order; });
            const need = v - used;
            if (need <= 0) continue;
            for (let j = 0; j < need; j++) {
                const angle = (j / need) * Math.PI * 2 - Math.PI / 2;
                const dist = 35;
                atoms.push({ el: 'H', x: atom.x + dist * Math.cos(angle + j * 0.8), y: atom.y + dist * Math.sin(angle + j * 0.8) });
                bonds.push({ a: i, b: atoms.length - 1, order: 1 });
            }
        }
        draw(); updateInfo();
    }

    // ─── Canvas Interaction ───
    canvas.addEventListener('mousedown', e => {
        const { x, y } = canvasCoords(e);
        const hit = findAtom(x, y);
        if (hit !== null) {
            if (selectedAtom !== null && selectedAtom !== hit) {
                // Bond between selected and hit
                const existing = bonds.find(b => (b.a === selectedAtom && b.b === hit) || (b.a === hit && b.b === selectedAtom));
                if (existing) existing.order = Math.min(3, existing.order + 1);
                else bonds.push({ a: selectedAtom, b: hit, order: bondOrder });
                selectedAtom = null;
            } else {
                selectedAtom = hit; dragAtom = hit;
            }
        } else {
            // New atom
            atoms.push({ el: tool, x, y });
            if (selectedAtom !== null) {
                bonds.push({ a: selectedAtom, b: atoms.length - 1, order: bondOrder });
                selectedAtom = null;
            } else {
                selectedAtom = atoms.length - 1;
            }
        }
        draw(); updateInfo();
    });

    canvas.addEventListener('mousemove', e => {
        if (dragAtom === null) return;
        const { x, y } = canvasCoords(e);
        atoms[dragAtom].x = x; atoms[dragAtom].y = y;
        draw();
    });
    canvas.addEventListener('mouseup', () => { dragAtom = null; });

    function canvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
    }
    function findAtom(x, y) {
        for (let i = atoms.length - 1; i >= 0; i--) {
            const a = atoms[i], d = Math.sqrt((a.x - x) ** 2 + (a.y - y) ** 2);
            if (d < (ATOM_DATA[a.el].r + 5)) return i;
        }
        return null;
    }

    // ═══════════════════════════════════
    // Canvas Drawing
    // ═══════════════════════════════════
    function draw() {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, 'rgba(6,6,25,0.95)'); bg.addColorStop(1, 'rgba(15,15,45,0.95)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

        // Bonds
        bonds.forEach(b => {
            const aa = atoms[b.a], bb = atoms[b.b];
            const dx = bb.x - aa.x, dy = bb.y - aa.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len * 3, ny = dx / len * 3;
            ctx.strokeStyle = 'rgba(148,163,184,0.5)'; ctx.lineWidth = 2;
            if (b.order === 1) { ctx.beginPath(); ctx.moveTo(aa.x, aa.y); ctx.lineTo(bb.x, bb.y); ctx.stroke(); }
            else if (b.order === 2) {
                ctx.beginPath(); ctx.moveTo(aa.x + nx, aa.y + ny); ctx.lineTo(bb.x + nx, bb.y + ny); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(aa.x - nx, aa.y - ny); ctx.lineTo(bb.x - nx, bb.y - ny); ctx.stroke();
            } else if (b.order === 3) {
                ctx.beginPath(); ctx.moveTo(aa.x, aa.y); ctx.lineTo(bb.x, bb.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(aa.x + nx * 2, aa.y + ny * 2); ctx.lineTo(bb.x + nx * 2, bb.y + ny * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(aa.x - nx * 2, aa.y - ny * 2); ctx.lineTo(bb.x - nx * 2, bb.y - ny * 2); ctx.stroke();
            }
        });

        // Atoms
        atoms.forEach((a, i) => {
            const d = ATOM_DATA[a.el];
            ctx.beginPath(); ctx.arc(a.x, a.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = i === selectedAtom ? d.color + '88' : d.color + '33';
            ctx.fill();
            ctx.strokeStyle = i === selectedAtom ? '#fbbf24' : d.color;
            ctx.lineWidth = i === selectedAtom ? 2.5 : 1.5;
            ctx.stroke();
            ctx.fillStyle = d.color; ctx.font = `600 ${d.r > 12 ? 12 : 9}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(a.el, a.x, a.y);
        });

        if (atoms.length === 0) {
            ctx.fillStyle = 'rgba(148,163,184,0.3)'; ctx.font = '500 14px Outfit'; ctx.textAlign = 'center';
            ctx.fillText('Click to place atoms • Click two atoms to bond them', w / 2, h / 2);
        }
    }

    // ═══════════════════════════════════
    // Analysis: Formula, IUPAC, FG
    // ═══════════════════════════════════
    function updateInfo() {
        if (atoms.length === 0) {
            ['iupac-name', 'mol-formula2', 'mol-weight', 'dou'].forEach(id => document.getElementById(id).textContent = '—');
            document.getElementById('fg-detected').innerHTML = '<span style="color:rgba(148,163,184,0.4)">No molecule</span>';
            document.getElementById('mol-formula').textContent = '—'; document.getElementById('mol-mw').textContent = '—';
            return;
        }
        // Count elements
        const counts = {};
        atoms.forEach(a => counts[a.el] = (counts[a.el] || 0) + 1);
        // Hill notation: C first, H second, then alphabetical
        let formula = '';
        if (counts.C) { formula += 'C' + (counts.C > 1 ? counts.C : ''); delete counts.C; }
        if (counts.H) { formula += 'H' + (counts.H > 1 ? counts.H : ''); delete counts.H; }
        Object.keys(counts).sort().forEach(el => formula += el + (counts[el] > 1 ? counts[el] : ''));
        // MW
        let mw = 0; atoms.forEach(a => mw += ATOM_DATA[a.el].mass);
        document.getElementById('mol-formula2').textContent = formula;
        document.getElementById('mol-formula').textContent = 'Formula: ' + formula;
        document.getElementById('mol-weight').textContent = mw.toFixed(2) + ' g/mol';
        document.getElementById('mol-mw').textContent = 'MW: ' + mw.toFixed(1);

        // DoU
        const c2 = {};
        atoms.forEach(a => c2[a.el] = (c2[a.el] || 0) + 1);
        const nC = c2.C || 0, nH = (c2.H || 0), nN = (c2.N || 0), nHal = (c2.F || 0) + (c2.Cl || 0) + (c2.Br || 0);
        const dou = nC > 0 ? (2 * nC + 2 + nN - nH - nHal) / 2 : 0;
        document.getElementById('dou').textContent = dou >= 0 ? dou.toFixed(0) : '—';

        // IUPAC naming (simple alkanes/alkenes/alkynes/alcohols)
        document.getElementById('iupac-name').textContent = getIUPAC();

        // Functional group detection
        detectFG();
    }

    function getIUPAC() {
        const nC = atoms.filter(a => a.el === 'C').length;
        if (nC === 0 || nC > 10) return atoms.length > 0 ? 'Complex molecule' : '—';
        const base = CHAIN_NAMES[nC] || 'complex';
        const hasDouble = bonds.some(b => b.order === 2 && atoms[b.a].el === 'C' && atoms[b.b].el === 'C');
        const hasTriple = bonds.some(b => b.order === 3 && atoms[b.a].el === 'C' && atoms[b.b].el === 'C');
        const hasOH = atoms.some((a, i) => a.el === 'O' && bonds.some(b => (b.a === i || b.b === i) && b.order === 1 && atoms[b.a === i ? b.b : b.a].el === 'H'));
        const hasCO = bonds.some(b => b.order === 2 && ((atoms[b.a].el === 'C' && atoms[b.b].el === 'O') || (atoms[b.a].el === 'O' && atoms[b.b].el === 'C')));
        const hasNH = atoms.some(a => a.el === 'N');
        const hasCOOH = hasCO && hasOH;

        if (hasCOOH) return base + 'anoic acid';
        if (hasCO && !hasOH) {
            // Check if aldehyde or ketone
            const coIdx = bonds.findIndex(b => b.order === 2 && ((atoms[b.a].el === 'C' && atoms[b.b].el === 'O') || (atoms[b.a].el === 'O' && atoms[b.b].el === 'C')));
            if (coIdx >= 0) {
                const cIdx = atoms[bonds[coIdx].a].el === 'C' ? bonds[coIdx].a : bonds[coIdx].b;
                const cBonds = bonds.filter(b => (b.a === cIdx || b.b === cIdx) && b !== bonds[coIdx]);
                const hBonded = cBonds.some(b => atoms[b.a === cIdx ? b.b : b.a].el === 'H');
                return hBonded ? base + 'anal' : base + 'anone';
            }
        }
        if (hasOH) return base + 'anol';
        if (hasNH) return base + 'anamine';
        if (hasTriple) return base + 'yne';
        if (hasDouble) return base + 'ene';
        return base + 'ane';
    }

    function detectFG() {
        const fgs = [];
        const hasEl = (el) => atoms.some(a => a.el === el);
        const bondOfOrder = (o, e1, e2) => bonds.some(b => b.order === o && ((atoms[b.a].el === e1 && atoms[b.b].el === e2) || (atoms[b.a].el === e2 && atoms[b.b].el === e1)));

        if (bondOfOrder(2, 'C', 'O')) fgs.push({ name: 'Carbonyl (C=O)', color: '#f59e0b' });
        const hasOH = atoms.some((a, i) => a.el === 'O' && bonds.some(b => (b.a === i || b.b === i) && b.order === 1 && atoms[b.a === i ? b.b : b.a].el === 'H'));
        if (hasOH && bondOfOrder(2, 'C', 'O')) fgs.push({ name: 'Carboxylic Acid (-COOH)', color: '#ef4444' });
        else if (hasOH) fgs.push({ name: 'Hydroxyl (-OH)', color: '#ef4444' });
        if (bondOfOrder(2, 'C', 'C')) fgs.push({ name: 'Alkene (C=C)', color: '#22c55e' });
        if (bondOfOrder(3, 'C', 'C')) fgs.push({ name: 'Alkyne (C≡C)', color: '#06b6d4' });
        if (hasEl('N')) fgs.push({ name: 'Amine (-NH₂)', color: '#3b82f6' });
        if (hasEl('Cl')) fgs.push({ name: 'Chloro (-Cl)', color: '#22c55e' });
        if (hasEl('Br')) fgs.push({ name: 'Bromo (-Br)', color: '#a855f7' });
        if (hasEl('F')) fgs.push({ name: 'Fluoro (-F)', color: '#06b6d4' });
        if (hasEl('S')) fgs.push({ name: 'Thiol (-SH)', color: '#eab308' });
        if (bondOfOrder(3, 'C', 'N')) fgs.push({ name: 'Nitrile (C≡N)', color: '#8b5cf6' });

        const el = document.getElementById('fg-detected');
        if (fgs.length === 0) { el.innerHTML = '<span style="color:rgba(148,163,184,0.4)">None detected</span>'; return; }
        el.innerHTML = fgs.map(f => `<div class="fg-tag2" style="border-left-color:${f.color}">${f.name}</div>`).join('');
    }

    // ─── Init ───
    draw(); updateInfo();
    buildChain(3); // Start with propane
})();
