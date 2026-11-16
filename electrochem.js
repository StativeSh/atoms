// ============================================
//  ChemVerse — Electrochemistry Cell Builder
//  Galvanic/Electrolytic cells with Nernst eq
// ============================================

(function () {
    'use strict';

    const canvas = document.getElementById('cell-canvas');
    const ctx = canvas.getContext('2d');

    let anodeIdx = 6;   // Zn
    let cathodeIdx = 12; // Cu
    let cellType = 'galvanic';
    let animFrame = null;
    let electrons = [];
    let ions = [];
    let time = 0;

    const SRP = STANDARD_REDUCTION_POTENTIALS;

    // ─── Populate Selects ───
    const anodeSel = document.getElementById('anode-select');
    const cathodeSel = document.getElementById('cathode-select');

    SRP.forEach((hc, i) => {
        const optA = document.createElement('option');
        optA.value = i;
        optA.textContent = `${hc.metal} / ${hc.ion}  (E° = ${hc.E0.toFixed(2)} V)`;
        anodeSel.appendChild(optA);

        const optC = document.createElement('option');
        optC.value = i;
        optC.textContent = `${hc.metal} / ${hc.ion}  (E° = ${hc.E0.toFixed(2)} V)`;
        cathodeSel.appendChild(optC);
    });

    anodeSel.value = anodeIdx;
    cathodeSel.value = cathodeIdx;

    anodeSel.addEventListener('change', () => { anodeIdx = +anodeSel.value; updateCell(); });
    cathodeSel.addEventListener('change', () => { cathodeIdx = +cathodeSel.value; updateCell(); });

    // ─── Cell Type Toggle ───
    document.getElementById('btn-galvanic').addEventListener('click', () => setCellType('galvanic'));
    document.getElementById('btn-electrolytic').addEventListener('click', () => setCellType('electrolytic'));

    function setCellType(type) {
        cellType = type;
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        updateCell();
    }

    // ─── Presets ───
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            anodeIdx = +btn.dataset.anode;
            cathodeIdx = +btn.dataset.cathode;
            anodeSel.value = anodeIdx;
            cathodeSel.value = cathodeIdx;
            updateCell();
        });
    });

    // ─── Nernst Controls ───
    const tempSlider = document.getElementById('nernst-temp');
    const anodeConcSlider = document.getElementById('nernst-anode-conc');
    const cathodeConcSlider = document.getElementById('nernst-cathode-conc');

    tempSlider.addEventListener('input', updateNernst);
    anodeConcSlider.addEventListener('input', updateNernst);
    cathodeConcSlider.addEventListener('input', updateNernst);

    // ─── Activity Series ───
    function buildActivitySeries() {
        const list = document.getElementById('series-list');
        list.innerHTML = '';
        const sorted = [...SRP].sort((a, b) => a.E0 - b.E0);
        sorted.forEach(hc => {
            const div = document.createElement('div');
            div.className = 'series-item';
            if (hc === SRP[anodeIdx] || hc === SRP[cathodeIdx]) {
                div.classList.add('highlight');
            }
            div.innerHTML = `<span class="si-metal">${hc.metal}</span><span class="si-e0">${hc.E0.toFixed(2)} V</span>`;
            list.appendChild(div);
        });
    }

    // ─── Update Cell ───
    function updateCell() {
        const anode = SRP[anodeIdx];
        const cathode = SRP[cathodeIdx];
        const Ecell = cathode.E0 - anode.E0;

        // Sidebar info
        document.getElementById('anode-eq').textContent = anode.equation;
        document.getElementById('anode-e0').textContent = `E° = ${anode.E0.toFixed(2)} V`;
        document.getElementById('cathode-eq').textContent = cathode.equation;
        document.getElementById('cathode-e0').textContent = `E° = ${cathode.E0.toFixed(2)} V`;

        // E°cell
        const ecellVal = document.getElementById('ecell-value');
        ecellVal.textContent = `${Ecell.toFixed(2)} V`;
        ecellVal.style.color = Ecell > 0 ? '#17784A' : Ecell < 0 ? '#BF1F2C' : '#6E6E73';

        const spontEl = document.getElementById('ecell-spont');
        if (cellType === 'galvanic') {
            spontEl.textContent = Ecell > 0 ? 'Spontaneous' : 'Non-spontaneous';
            spontEl.className = 'result-spontaneity ' + (Ecell > 0 ? 'spontaneous' : 'non-spontaneous');
        } else {
            spontEl.textContent = 'Requires external voltage';
            spontEl.className = 'result-spontaneity non-spontaneous';
        }

        // Props
        document.getElementById('prop-type').textContent = cellType === 'galvanic' ? 'Galvanic' : 'Electrolytic';
        document.getElementById('prop-anode').textContent = `${anode.metal} (oxidized)`;
        document.getElementById('prop-cathode').textContent = `${cathode.metal} (reduced)`;
        document.getElementById('prop-ecell').textContent = `${Ecell.toFixed(2)} V`;

        // Calculate n (LCM of electron counts)
        const n = lcm(anode.n, cathode.n);
        document.getElementById('prop-n').textContent = n;

        // ΔG° = -nFE°
        const F = 96.485; // kJ/(mol·V)
        const dG = -n * F * Ecell;
        document.getElementById('prop-dg').textContent = `${dG.toFixed(1)} kJ/mol`;

        // Overall reaction
        const aMult = n / anode.n;
        const cMult = n / cathode.n;
        const oxStr = aMult > 1 ? `${aMult}${anode.metal}` : anode.metal;
        const oxIon = aMult > 1 ? `${aMult}${anode.ion}` : anode.ion;
        const redIon = cMult > 1 ? `${cMult}${cathode.ion}` : cathode.ion;
        const redStr = cMult > 1 ? `${cMult}${cathode.metal}` : cathode.metal;
        document.getElementById('overall-eq').textContent =
            `${oxStr} + ${redIon} → ${oxIon} + ${redStr}`;

        buildActivitySeries();
        updateNernst();
        resetParticles();
    }

    function updateNernst() {
        const T = parseFloat(tempSlider.value);
        const anodeConc = Math.pow(10, parseFloat(anodeConcSlider.value));
        const cathodeConc = Math.pow(10, parseFloat(cathodeConcSlider.value));

        document.getElementById('nernst-temp-val').textContent = `${T} K`;
        document.getElementById('nernst-anode-val').textContent = `${anodeConc.toFixed(3)} M`;
        document.getElementById('nernst-cathode-val').textContent = `${cathodeConc.toFixed(3)} M`;

        const anode = SRP[anodeIdx];
        const cathode = SRP[cathodeIdx];
        const Ecell0 = cathode.E0 - anode.E0;
        const n = lcm(anode.n, cathode.n);

        // E = E° - (RT/nF) ln(Q)
        const R = 8.314; // J/(mol·K)
        const F = 96485; // C/mol
        const Q = anodeConc / cathodeConc; // simplified reaction quotient
        const E = Ecell0 - (R * T / (n * F)) * Math.log(Q);

        const nernstVal = document.getElementById('nernst-ecell');
        nernstVal.textContent = `${E.toFixed(4)} V`;
        nernstVal.style.color = E > 0 ? '#17784A' : '#BF1F2C';
    }

    function lcm(a, b) {
        return (a * b) / gcd(a, b);
    }

    function gcd(a, b) {
        while (b) { [a, b] = [b, a % b]; }
        return a;
    }

    // ═══════════════════════════════════════════════
    // Cell Animation Canvas
    // ═══════════════════════════════════════════════

    function resetParticles() {
        electrons = [];
        ions = [];
        // Create electrons (flow from anode to cathode via wire)
        for (let i = 0; i < 8; i++) {
            electrons.push({
                t: Math.random(),
                speed: 0.002 + Math.random() * 0.002,
            });
        }
        // Create ions (flow in solutions)
        for (let i = 0; i < 6; i++) {
            ions.push({
                x: 50 + Math.random() * 150,
                y: 250 + Math.random() * 150,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                side: 'anode',
                color: SRP[anodeIdx].color,
            });
            ions.push({
                x: 500 + Math.random() * 150,
                y: 250 + Math.random() * 150,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                side: 'cathode',
                color: SRP[cathodeIdx].color,
            });
        }
    }

    function drawCell() {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        time += 0.016;

        const anode = SRP[anodeIdx];
        const cathode = SRP[cathodeIdx];
        const Ecell = cathode.E0 - anode.E0;

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#FFFFFF');
        bg.addColorStop(1, '#F6F6F9');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // ─── Beakers ───
        const beakerW = 180, beakerH = 200;
        const anodeX = 80, cathodeX = w - 80 - beakerW;
        const beakerY = 200;

        // Anode beaker
        drawBeaker(anodeX, beakerY, beakerW, beakerH, 'transparent', anode.color + '26');
        // Cathode beaker
        drawBeaker(cathodeX, beakerY, beakerW, beakerH, 'transparent', cathode.color + '26');

        // Electrode rods
        const anodeRodX = anodeX + beakerW / 2;
        const cathodeRodX = cathodeX + beakerW / 2;

        // Anode electrode
        ctx.fillStyle = anode.metalColor;
        ctx.shadowColor = anode.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(anodeRodX - 8, beakerY - 30, 16, beakerH + 20);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(29, 29, 31, 0.40)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(anodeRodX - 8, beakerY - 30, 16, beakerH + 20);

        // Cathode electrode
        ctx.fillStyle = cathode.metalColor;
        ctx.shadowColor = cathode.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(cathodeRodX - 8, beakerY - 30, 16, beakerH + 20);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(29, 29, 31, 0.40)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(cathodeRodX - 8, beakerY - 30, 16, beakerH + 20);

        // ─── Wire (top) ───
        ctx.strokeStyle = 'rgba(29, 29, 31, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(anodeRodX, beakerY - 30);
        ctx.lineTo(anodeRodX, 60);
        ctx.lineTo(cathodeRodX, 60);
        ctx.lineTo(cathodeRodX, beakerY - 30);
        ctx.stroke();

        // Voltmeter / battery
        const midX = (anodeRodX + cathodeRodX) / 2;
        if (cellType === 'galvanic') {
            // Voltmeter
            ctx.beginPath();
            ctx.arc(midX, 60, 22, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#2F5BEA';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#2F5BEA';
            ctx.font = '700 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('V', midX, 55);
            ctx.font = '600 12px Inter, monospace';
            ctx.fillText(Ecell.toFixed(2), midX, 68);
        } else {
            // Battery
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#D92D3A';
            ctx.lineWidth = 2;
            ctx.fillRect(midX - 25, 42, 50, 36);
            ctx.strokeRect(midX - 25, 42, 50, 36);
            ctx.fillStyle = '#D92D3A';
            ctx.font = '700 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('DC', midX, 55);
            ctx.font = '600 14px Inter, sans-serif';
            ctx.fillText('Source', midX, 68);
        }

        // ─── Salt Bridge ───
        const sbY = beakerY + 40;
        const sbH = 30;
        ctx.fillStyle = 'rgba(29, 29, 31, 0.06)';
        ctx.strokeStyle = 'rgba(29, 29, 31, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(anodeX + beakerW - 5, sbY);
        ctx.lineTo(cathodeX + 5, sbY);
        ctx.lineTo(cathodeX + 5, sbY + sbH);
        ctx.lineTo(anodeX + beakerW - 5, sbY + sbH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Salt bridge label
        ctx.fillStyle = '#6E6E73';
        ctx.font = '500 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Salt Bridge (KCl/KNO₃)', midX, sbY + sbH / 2 + 3);

        // Salt bridge ion dots
        for (let i = 0; i < 8; i++) {
            const sx = anodeX + beakerW + 10 + (cathodeX - anodeX - beakerW - 10) * ((i + Math.sin(time * 2 + i)) / 9);
            const sy = sbY + 5 + Math.sin(time * 3 + i * 0.8) * 8;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? '#1E9E5A99' : '#D92D3A99';
            ctx.fill();
        }

        // ─── Electron Flow ───
        electrons.forEach(e => {
            e.t += e.speed;
            if (e.t > 1) e.t -= 1;

            let ex, ey;
            const wireLen = cathodeRodX - anodeRodX;
            const upLen = beakerY - 30 - 60;
            const totalLen = upLen + wireLen + upLen;

            const pos = e.t * totalLen;
            if (pos < upLen) {
                // Going up from anode
                ex = anodeRodX;
                ey = beakerY - 30 - pos;
            } else if (pos < upLen + wireLen) {
                // Across top
                ex = anodeRodX + (pos - upLen);
                ey = 60;
            } else {
                // Going down to cathode
                ex = cathodeRodX;
                ey = 60 + (pos - upLen - wireLen);
            }

            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#E8A400';
            ctx.fill();
            ctx.shadowColor = '#E8A400';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // ─── Ions in Solution ───
        ions.forEach(ion => {
            ion.x += ion.vx;
            ion.y += ion.vy;

            // Bounce in beaker
            const bx = ion.side === 'anode' ? anodeX + 10 : cathodeX + 10;
            const bw = beakerW - 20;
            if (ion.x < bx || ion.x > bx + bw) ion.vx *= -1;
            if (ion.y < beakerY + 30 || ion.y > beakerY + beakerH - 15) ion.vy *= -1;
            ion.x = Math.max(bx, Math.min(bx + bw, ion.x));
            ion.y = Math.max(beakerY + 30, Math.min(beakerY + beakerH - 15, ion.y));

            // Random drift
            ion.vx += (Math.random() - 0.5) * 0.05;
            ion.vy += (Math.random() - 0.5) * 0.05;
            ion.vx *= 0.99;
            ion.vy *= 0.99;

            ctx.beginPath();
            ctx.arc(ion.x, ion.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = ion.color + 'cc';
            ctx.fill();
        });

        // ─── Labels ───
        ctx.fillStyle = '#1D1D1F';
        ctx.font = '700 16px "Inter Tight", Inter, sans-serif';
        ctx.textAlign = 'center';

        // Anode label
        ctx.fillText('Anode (−)', anodeRodX, beakerY - 45);
        ctx.fillStyle = anode.color;
        ctx.font = '600 14px Inter, sans-serif';
        ctx.fillText(anode.metal, anodeRodX, beakerY - 68);
        ctx.fillStyle = '#6E6E73';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillText('Oxidation', anodeRodX, beakerY + beakerH + 20);

        // Cathode label
        ctx.fillStyle = '#1D1D1F';
        ctx.font = '700 16px "Inter Tight", Inter, sans-serif';
        ctx.fillText('Cathode (+)', cathodeRodX, beakerY - 45);
        ctx.fillStyle = cathode.color;
        ctx.font = '600 14px Inter, sans-serif';
        ctx.fillText(cathode.metal, cathodeRodX, beakerY - 68);
        ctx.fillStyle = '#6E6E73';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillText('Reduction', cathodeRodX, beakerY + beakerH + 20);

        // Electron flow arrow
        ctx.fillStyle = '#E8A400';
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillText('e⁻ →', midX, 45);

        // Solution labels
        ctx.fillStyle = anode.color + 'aa';
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillText(anode.ion + '(aq)', anodeRodX, beakerY + beakerH + 35);

        ctx.fillStyle = cathode.color + 'aa';
        ctx.fillText(cathode.ion + '(aq)', cathodeRodX, beakerY + beakerH + 35);

        // Title
        ctx.fillStyle = '#1D1D1F';
        ctx.font = '600 15px "Inter Tight", Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(cellType === 'galvanic' ? 'Galvanic cell' : 'Electrolytic cell', 24, 36);

        animFrame = requestAnimationFrame(drawCell);
    }

    function drawBeaker(x, y, w, h, bgColor, solColor) {
        // Solution
        ctx.fillStyle = solColor;
        ctx.fillRect(x, y + 30, w, h - 30);

        // Beaker outline
        ctx.strokeStyle = 'rgba(29, 29, 31, 0.30)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y);
        ctx.stroke();

        // Solution level line
        ctx.strokeStyle = 'rgba(29, 29, 31, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, y + 30);
        ctx.lineTo(x + w, y + 30);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // ─── Init ───
    updateCell();
    drawCell();

})();

    // ─── Explain Mode Hooks ───
    if (typeof ChemExplain !== 'undefined') {
        ChemExplain.register('.cell-result', 'Cell Potential (E°cell)', 'The standard electromotive force of the cell.<br><strong>E°cell > 0:</strong> Spontaneous (Galvanic).<br><strong>E°cell < 0:</strong> Non-spontaneous (Electrolytic).<br><span class="tt-formula">E°cell = E°cathode - E°anode</span>');
        ChemExplain.register('.nernst-section', 'Nernst Equation', 'Calculates the actual cell potential under non-standard conditions (different concentrations/temperature).<br><span class="tt-formula">E = E° - (RT/nF)ln(Q)</span>');
        ChemExplain.register('#cell-props .prop-item:nth-child(5)', 'Gibbs Free Energy (ΔG°)', 'The maximum reversible work that may be performed by the system.<br><strong>Negative:</strong> Spontaneous reaction.<br><span class="tt-formula">ΔG° = -nFE°</span>');
        ChemExplain.register('#cell-canvas', 'Electrochemical Cell', '<b>Anode (Left):</b> Oxidation occurs here. Electrons are lost and flow through the wire.<br><b>Cathode (Right):</b> Reduction occurs here. Electrons are gained.<br><b>Salt Bridge:</b> Maintains electrical neutrality by allowing ion flow.');
    }
