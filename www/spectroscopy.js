// ============================================
//  ChemVerse — Spectroscopy Simulator
//  IR functional group database + UV-Vis λmax
// ============================================

(function () {
    'use strict';

    // ─── IR Functional Group Database ───
    // Each entry: { group, range:[low, high] cm⁻¹, peak cm⁻¹, strength, shape, description }
    const IR_DATABASE = [
        { group: 'O-H (alcohol)', range: [3200, 3600], peak: 3400, strength: 'strong', shape: 'broad', desc: 'Alcohol O-H stretch', color: '#ef4444' },
        { group: 'O-H (acid)', range: [2500, 3300], peak: 2900, strength: 'strong', shape: 'broad', desc: 'Carboxylic acid O-H stretch', color: '#dc2626' },
        { group: 'N-H', range: [3300, 3500], peak: 3400, strength: 'medium', shape: 'medium', desc: 'Amine N-H stretch', color: '#3b82f6' },
        { group: 'C-H (sp³)', range: [2850, 2960], peak: 2920, strength: 'strong', shape: 'sharp', desc: 'Alkane C-H stretch', color: '#22c55e' },
        { group: 'C-H (sp²)', range: [3020, 3100], peak: 3060, strength: 'medium', shape: 'sharp', desc: 'Alkene/Arene C-H stretch', color: '#10b981' },
        { group: 'C-H (sp)', range: [3260, 3330], peak: 3300, strength: 'strong', shape: 'sharp', desc: 'Alkyne C-H stretch', color: '#059669' },
        { group: 'C≡C', range: [2100, 2260], peak: 2150, strength: 'weak', shape: 'sharp', desc: 'Alkyne C≡C stretch', color: '#8b5cf6' },
        { group: 'C≡N', range: [2200, 2260], peak: 2230, strength: 'medium', shape: 'sharp', desc: 'Nitrile C≡N stretch', color: '#a855f7' },
        { group: 'C=O (ketone)', range: [1705, 1725], peak: 1715, strength: 'strong', shape: 'sharp', desc: 'Ketone carbonyl stretch', color: '#f59e0b' },
        { group: 'C=O (aldehyde)', range: [1720, 1740], peak: 1730, strength: 'strong', shape: 'sharp', desc: 'Aldehyde carbonyl stretch', color: '#d97706' },
        { group: 'C=O (acid)', range: [1700, 1725], peak: 1712, strength: 'strong', shape: 'sharp', desc: 'Carboxylic acid carbonyl', color: '#ea580c' },
        { group: 'C=O (ester)', range: [1735, 1750], peak: 1740, strength: 'strong', shape: 'sharp', desc: 'Ester carbonyl stretch', color: '#e11d48' },
        { group: 'C=O (amide)', range: [1630, 1690], peak: 1660, strength: 'strong', shape: 'sharp', desc: 'Amide carbonyl stretch', color: '#be123c' },
        { group: 'C=C', range: [1620, 1680], peak: 1650, strength: 'medium', shape: 'sharp', desc: 'Alkene C=C stretch', color: '#06b6d4' },
        { group: 'C=C (aromatic)', range: [1450, 1600], peak: 1500, strength: 'medium', shape: 'sharp', desc: 'Aromatic C=C stretch', color: '#0891b2' },
        { group: 'C-O', range: [1000, 1260], peak: 1100, strength: 'strong', shape: 'sharp', desc: 'C-O stretch (ether/alcohol)', color: '#14b8a6' },
        { group: 'C-N', range: [1020, 1250], peak: 1150, strength: 'medium', shape: 'sharp', desc: 'C-N stretch', color: '#6366f1' },
        { group: 'N-O', range: [1515, 1560], peak: 1540, strength: 'strong', shape: 'sharp', desc: 'Nitro asymmetric stretch', color: '#ec4899' },
        { group: 'C-Cl', range: [600, 800], peak: 725, strength: 'strong', shape: 'sharp', desc: 'C-Cl stretch', color: '#f97316' },
        { group: 'C-Br', range: [500, 680], peak: 600, strength: 'strong', shape: 'sharp', desc: 'C-Br stretch', color: '#ef4444' },
    ];

    // ─── Preset Molecules ───
    const MOLECULES = [
        {
            name: 'Ethanol',
            formula: 'C₂H₅OH',
            groups: ['O-H (alcohol)', 'C-H (sp³)', 'C-O'],
            uvLambda: null,
            uvDesc: 'No significant UV absorption',
            structure: 'CH₃-CH₂-OH',
        },
        {
            name: 'Acetic Acid',
            formula: 'CH₃COOH',
            groups: ['O-H (acid)', 'C-H (sp³)', 'C=O (acid)', 'C-O'],
            uvLambda: 204,
            uvDesc: 'n→π* transition of C=O',
            structure: 'CH₃-C(=O)-OH',
        },
        {
            name: 'Acetone',
            formula: '(CH₃)₂CO',
            groups: ['C-H (sp³)', 'C=O (ketone)'],
            uvLambda: 279,
            uvDesc: 'n→π* transition of C=O',
            structure: 'CH₃-C(=O)-CH₃',
        },
        {
            name: 'Benzene',
            formula: 'C₆H₆',
            groups: ['C-H (sp²)', 'C=C (aromatic)'],
            uvLambda: 254,
            uvDesc: 'π→π* transition of aromatic ring',
            structure: 'Aromatic ring',
        },
        {
            name: 'Acetaldehyde',
            formula: 'CH₃CHO',
            groups: ['C-H (sp³)', 'C-H (sp²)', 'C=O (aldehyde)'],
            uvLambda: 293,
            uvDesc: 'n→π* transition of C=O',
            structure: 'CH₃-C(=O)-H',
        },
        {
            name: 'Ethyl Acetate',
            formula: 'CH₃COOC₂H₅',
            groups: ['C-H (sp³)', 'C=O (ester)', 'C-O'],
            uvLambda: 211,
            uvDesc: 'n→π* transition of ester C=O',
            structure: 'CH₃-C(=O)-O-CH₂-CH₃',
        },
        {
            name: 'Aniline',
            formula: 'C₆H₅NH₂',
            groups: ['N-H', 'C-H (sp²)', 'C=C (aromatic)', 'C-N'],
            uvLambda: 280,
            uvDesc: 'π→π* with n→π* from NH₂ conjugation',
            structure: 'C₆H₅-NH₂',
        },
        {
            name: '1-Hexyne',
            formula: 'C₆H₁₀',
            groups: ['C-H (sp³)', 'C-H (sp)', 'C≡C'],
            uvLambda: null,
            uvDesc: 'Very weak absorption ~170 nm (vacuum UV)',
            structure: 'HC≡C-CH₂-CH₂-CH₂-CH₃',
        },
        {
            name: 'Acetonitrile',
            formula: 'CH₃CN',
            groups: ['C-H (sp³)', 'C≡N'],
            uvLambda: null,
            uvDesc: 'Transparent in UV-Vis range (common solvent)',
            structure: 'CH₃-C≡N',
        },
        {
            name: 'Chloroform',
            formula: 'CHCl₃',
            groups: ['C-H (sp³)', 'C-Cl'],
            uvLambda: 245,
            uvDesc: 'n→σ* transition of C-Cl',
            structure: 'H-CCl₃',
        },
        {
            name: 'Acetamide',
            formula: 'CH₃CONH₂',
            groups: ['N-H', 'C-H (sp³)', 'C=O (amide)', 'C-N'],
            uvLambda: 220,
            uvDesc: 'n→π* transition of amide C=O',
            structure: 'CH₃-C(=O)-NH₂',
        },
        {
            name: '1,3-Butadiene',
            formula: 'C₄H₆',
            groups: ['C-H (sp²)', 'C=C'],
            uvLambda: 217,
            uvDesc: 'π→π* of conjugated diene',
            structure: 'CH₂=CH-CH=CH₂',
        },
    ];

    // ─── State ───
    let activeMol = null;
    let activeMode = 'ir'; // 'ir' or 'uv'
    let hoveredPeak = null;

    const canvas = document.getElementById('spectrum-canvas');
    const ctx = canvas.getContext('2d');

    // ─── Build Molecule List ───
    const molList = document.getElementById('molecule-list');
    MOLECULES.forEach((mol, i) => {
        const btn = document.createElement('button');
        btn.className = 'mol-btn';
        btn.innerHTML = `${mol.name}<span class="mol-formula">${mol.formula}</span>`;
        btn.addEventListener('click', () => selectMolecule(i));
        molList.appendChild(btn);
    });

    // ─── Mode Toggles ───
    document.getElementById('btn-ir').addEventListener('click', () => setMode('ir'));
    document.getElementById('btn-uv').addEventListener('click', () => setMode('uv'));

    function setMode(mode) {
        activeMode = mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        if (activeMol !== null) drawSpectrum();
    }

    // ─── Select Molecule ───
    function selectMolecule(idx) {
        activeMol = idx;
        const mol = MOLECULES[idx];

        // Highlight active button
        document.querySelectorAll('.mol-btn').forEach((b, i) => {
            b.classList.toggle('active', i === idx);
        });

        // Update header
        document.getElementById('spec-title').textContent = mol.name;
        document.getElementById('spec-formula').textContent = mol.formula;

        // Populate functional groups
        const fgList = document.getElementById('fg-list');
        fgList.innerHTML = '';
        const peaks = getActivePeaks(mol);
        peaks.forEach(p => {
            const tag = document.createElement('div');
            tag.className = 'fg-tag';
            tag.style.borderLeftColor = p.color;
            tag.innerHTML = `<span>${p.group}</span><span class="fg-range">${p.range[0]}–${p.range[1]} cm⁻¹</span>`;
            fgList.appendChild(tag);
        });

        drawSpectrum();
        buildPeakTable(peaks);
    }

    function getActivePeaks(mol) {
        return IR_DATABASE.filter(entry => mol.groups.includes(entry.group));
    }

    // ═══════════════════════════════════════════════
    // IR Spectrum Drawing
    // ═══════════════════════════════════════════════

    function drawSpectrum() {
        if (activeMol === null) return;
        const mol = MOLECULES[activeMol];

        if (activeMode === 'ir') {
            drawIRSpectrum(mol);
        } else {
            drawUVSpectrum(mol);
        }
    }

    function drawIRSpectrum(mol) {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const pad = { top: 30, right: 30, bottom: 40, left: 55 };
        const plotW = w - pad.left - pad.right;
        const plotH = h - pad.top - pad.bottom;

        // IR convention: x-axis is wavenumber 4000→400 (reversed!)
        const xMin = 400, xMax = 4000;
        const xOf = (wn) => pad.left + plotW * (1 - (wn - xMin) / (xMax - xMin));
        const yOf = (t) => pad.top + plotH * (1 - t); // t=1 is 100% transmittance (top)

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, 'rgba(6, 6, 25, 0.9)');
        bgGrad.addColorStop(1, 'rgba(15, 15, 45, 0.9)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.lineWidth = 0.5;
        for (let wn = 500; wn <= 4000; wn += 500) {
            const x = xOf(wn);
            ctx.beginPath();
            ctx.moveTo(x, pad.top);
            ctx.lineTo(x, h - pad.bottom);
            ctx.stroke();
        }
        for (let t = 0; t <= 1; t += 0.2) {
            const y = yOf(t);
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, h - pad.bottom);
        ctx.lineTo(w - pad.right, h - pad.bottom);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '500 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        for (let wn = 500; wn <= 4000; wn += 500) {
            ctx.fillText(wn, xOf(wn), h - pad.bottom + 16);
        }
        ctx.fillText('Wavenumber (cm⁻¹)', w / 2, h - 4);

        ctx.textAlign = 'right';
        for (let t = 0; t <= 100; t += 20) {
            ctx.fillText(t + '%', pad.left - 6, yOf(t / 100) + 3);
        }

        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('% Transmittance', 0, 0);
        ctx.restore();

        // Build transmittance curve
        const peaks = getActivePeaks(mol);
        const points = [];
        for (let wn = xMin; wn <= xMax; wn += 2) {
            let T = 1.0; // full transmittance
            peaks.forEach(p => {
                // Gaussian absorption dip
                const center = p.peak;
                const sigma = (p.shape === 'broad') ? 150 : (p.shape === 'medium' ? 80 : 40);
                const depth = (p.strength === 'strong') ? 0.85 : (p.strength === 'medium' ? 0.55 : 0.3);
                const gauss = depth * Math.exp(-0.5 * Math.pow((wn - center) / sigma, 2));
                T -= gauss;
            });
            T = Math.max(0.02, T);
            points.push({ wn, T });
        }

        // Draw baseline noise
        ctx.beginPath();
        ctx.moveTo(xOf(points[0].wn), yOf(points[0].T + (Math.random() - 0.5) * 0.01));
        for (let i = 1; i < points.length; i++) {
            const noise = (Math.random() - 0.5) * 0.008;
            ctx.lineTo(xOf(points[i].wn), yOf(points[i].T + noise));
        }

        const lineGrad = ctx.createLinearGradient(pad.left, 0, w - pad.right, 0);
        lineGrad.addColorStop(0, '#6366f1');
        lineGrad.addColorStop(0.5, '#a855f7');
        lineGrad.addColorStop(1, '#ec4899');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fill under curve
        ctx.lineTo(xOf(xMin), yOf(0));
        ctx.lineTo(xOf(xMax), yOf(0));
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
        fillGrad.addColorStop(0, 'rgba(99, 102, 241, 0.02)');
        fillGrad.addColorStop(1, 'rgba(99, 102, 241, 0.08)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Peak markers
        peaks.forEach(p => {
            const x = xOf(p.peak);
            const depth = (p.strength === 'strong') ? 0.85 : (p.strength === 'medium' ? 0.55 : 0.3);
            const y = yOf(1 - depth);

            // Marker line
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = p.color + '88';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - 20);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = p.color;
            ctx.font = '600 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.group, x, y - 24);
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.font = '400 8px Inter, sans-serif';
            ctx.fillText(p.peak + ' cm⁻¹', x, y - 14);

            // Dot at peak
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Title
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 12px Outfit, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('IR Spectrum — ' + mol.name, pad.left + 5, pad.top - 10);
    }

    // ═══════════════════════════════════════════════
    // UV-Vis Spectrum Drawing
    // ═══════════════════════════════════════════════

    function drawUVSpectrum(mol) {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const pad = { top: 30, right: 30, bottom: 40, left: 55 };
        const plotW = w - pad.left - pad.right;
        const plotH = h - pad.top - pad.bottom;

        const xMin = 190, xMax = 800;
        const xOf = (nm) => pad.left + plotW * ((nm - xMin) / (xMax - xMin));
        const yOf = (a) => pad.top + plotH * (1 - a);

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, 'rgba(6, 6, 25, 0.9)');
        bgGrad.addColorStop(1, 'rgba(15, 15, 45, 0.9)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw visible spectrum band at bottom
        for (let nm = 380; nm <= 780; nm++) {
            ctx.fillStyle = wavelengthToColor(nm);
            const x = xOf(nm);
            ctx.fillRect(x, h - pad.bottom - 20, plotW / (xMax - xMin), 20);
        }

        // Grid
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.lineWidth = 0.5;
        for (let nm = 200; nm <= 800; nm += 100) {
            const x = xOf(nm);
            ctx.beginPath();
            ctx.moveTo(x, pad.top);
            ctx.lineTo(x, h - pad.bottom - 20);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, h - pad.bottom);
        ctx.lineTo(w - pad.right, h - pad.bottom);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '500 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        for (let nm = 200; nm <= 800; nm += 100) {
            ctx.fillText(nm + ' nm', xOf(nm), h - pad.bottom + 16);
        }
        ctx.fillText('Wavelength (nm)', w / 2, h - 4);

        ctx.textAlign = 'right';
        ctx.fillText('Abs', pad.left - 6, pad.top + 3);
        ctx.fillText('0', pad.left - 6, h - pad.bottom - 22);

        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Absorbance', 0, 0);
        ctx.restore();

        // Draw UV-Vis absorption curve
        if (mol.uvLambda) {
            const points = [];
            const sigma = 25;
            for (let nm = xMin; nm <= xMax; nm++) {
                const gauss = Math.exp(-0.5 * Math.pow((nm - mol.uvLambda) / sigma, 2));
                const noise = (Math.random() - 0.5) * 0.005;
                points.push({ nm, abs: gauss + noise * 0.5 });
            }

            ctx.beginPath();
            ctx.moveTo(xOf(points[0].nm), yOf(Math.max(0, points[0].abs)));
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(xOf(points[i].nm), yOf(Math.max(0, points[i].abs)));
            }

            const lineGrad = ctx.createLinearGradient(pad.left, 0, w - pad.right, 0);
            lineGrad.addColorStop(0, '#818cf8');
            lineGrad.addColorStop(0.5, '#c084fc');
            lineGrad.addColorStop(1, '#f472b6');
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Fill under
            ctx.lineTo(xOf(xMax), yOf(0));
            ctx.lineTo(xOf(xMin), yOf(0));
            ctx.closePath();
            const fillGrad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
            fillGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
            fillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.02)');
            ctx.fillStyle = fillGrad;
            ctx.fill();

            // λmax marker
            const lx = xOf(mol.uvLambda);
            const ly = yOf(1);

            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = '#c084fc88';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx, h - pad.bottom - 20);
            ctx.stroke();
            ctx.setLineDash([]);

            // λmax label
            ctx.fillStyle = '#c084fc';
            ctx.font = '700 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('λmax = ' + mol.uvLambda + ' nm', lx, ly - 10);

            // Dot
            ctx.beginPath();
            ctx.arc(lx, ly, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#c084fc';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else {
            // No significant UV absorption
            ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.font = '500 14px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No significant UV-Vis absorption', w / 2, h / 2 - 20);
            ctx.font = '400 11px Inter, sans-serif';
            ctx.fillText(mol.uvDesc || '', w / 2, h / 2 + 5);
        }

        // Title
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 12px Outfit, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('UV-Vis Spectrum — ' + mol.name, pad.left + 5, pad.top - 10);

        // Update UV info in peak table
        updateUVInfo(mol);
    }

    // Convert wavelength (380-780nm) to visible color
    function wavelengthToColor(nm) {
        let r = 0, g = 0, b = 0;
        if (nm >= 380 && nm < 440) {
            r = -(nm - 440) / (440 - 380); b = 1;
        } else if (nm >= 440 && nm < 490) {
            g = (nm - 440) / (490 - 440); b = 1;
        } else if (nm >= 490 && nm < 510) {
            g = 1; b = -(nm - 510) / (510 - 490);
        } else if (nm >= 510 && nm < 580) {
            r = (nm - 510) / (580 - 510); g = 1;
        } else if (nm >= 580 && nm < 645) {
            r = 1; g = -(nm - 645) / (645 - 580);
        } else if (nm >= 645 && nm <= 780) {
            r = 1;
        }
        // Intensity correction at edges
        let factor = 0.3;
        if (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / (420 - 380);
        else if (nm >= 420 && nm <= 700) factor = 1;
        else if (nm > 700 && nm <= 780) factor = 0.3 + 0.7 * (780 - nm) / (780 - 700);
        return `rgba(${Math.round(r * 255 * factor)}, ${Math.round(g * 255 * factor)}, ${Math.round(b * 255 * factor)}, 0.6)`;
    }

    // ─── Peak Table ───
    function buildPeakTable(peaks) {
        const table = document.getElementById('peak-table');
        table.innerHTML = '';

        if (activeMode === 'uv') {
            updateUVInfo(MOLECULES[activeMol]);
            return;
        }

        peaks.forEach(p => {
            const row = document.createElement('div');
            row.className = 'peak-row';
            row.innerHTML = `
                <div>
                    <span class="peak-wavenumber">${p.peak} cm⁻¹</span>
                    <span class="peak-strength ${p.strength}">${p.strength}</span>
                </div>
                <span class="peak-assignment">${p.group}</span>
                <span class="peak-desc">${p.desc}</span>
            `;
            row.addEventListener('mouseenter', () => highlightPeak(p));
            row.addEventListener('mouseleave', () => { hoveredPeak = null; drawSpectrum(); });
            table.appendChild(row);
        });
    }

    function updateUVInfo(mol) {
        const table = document.getElementById('peak-table');
        table.innerHTML = '';

        if (mol.uvLambda) {
            table.innerHTML = `
                <div class="uv-info">
                    <div class="uv-label">λmax</div>
                    <div class="uv-lambda">${mol.uvLambda} nm</div>
                    <div class="peak-desc" style="margin-top:6px">${mol.uvDesc}</div>
                </div>
                <div class="peak-row" style="margin-top:6px">
                    <span class="peak-assignment">Transition Type</span>
                    <span class="peak-desc">${mol.uvDesc}</span>
                </div>
                <div class="peak-row">
                    <span class="peak-assignment">Structure</span>
                    <span class="peak-desc">${mol.structure}</span>
                </div>
            `;
        } else {
            table.innerHTML = `
                <div class="uv-info">
                    <div class="uv-label">λmax</div>
                    <div class="uv-lambda" style="color: rgba(148,163,184,0.4)">—</div>
                    <div class="peak-desc" style="margin-top:6px">${mol.uvDesc || 'No significant absorption'}</div>
                </div>
            `;
        }
    }

    function highlightPeak(p) {
        hoveredPeak = p;
        drawSpectrum();

        // Draw highlight
        const pad = { top: 30, right: 30, bottom: 40, left: 55 };
        const plotW = canvas.width - pad.left - pad.right;
        const xMin = 400, xMax = 4000;
        const xOf = (wn) => pad.left + plotW * (1 - (wn - xMin) / (xMax - xMin));

        const x = xOf(p.peak);
        ctx.fillStyle = p.color + '22';
        ctx.fillRect(xOf(p.range[1]), pad.top, xOf(p.range[0]) - xOf(p.range[1]), canvas.height - pad.top - pad.bottom);

        // Update info panel
        document.getElementById('peak-info').innerHTML = `
            <div class="peak-detail">
                <strong>${p.group}</strong> at <strong>${p.peak} cm⁻¹</strong><br>
                ${p.desc} • Range: ${p.range[0]}–${p.range[1]} cm⁻¹ • Strength: ${p.strength}
            </div>
        `;
    }

    // ─── Canvas Mouse Interaction ───
    canvas.addEventListener('mousemove', (e) => {
        if (activeMol === null || activeMode !== 'ir') return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;

        const pad = { left: 55, right: 30 };
        const plotW = canvas.width - pad.left - pad.right;
        const xMin = 400, xMax = 4000;
        const wn = xMin + (xMax - xMin) * (1 - (mx - pad.left) / plotW);

        if (wn < xMin || wn > xMax) return;

        const mol = MOLECULES[activeMol];
        const peaks = getActivePeaks(mol);
        const nearest = peaks.reduce((best, p) => {
            const dist = Math.abs(p.peak - wn);
            return dist < best.dist ? { p, dist } : best;
        }, { p: null, dist: 100 });

        if (nearest.p) {
            document.getElementById('peak-info').innerHTML = `
                <div class="peak-detail">
                    <strong>${nearest.p.group}</strong> at <strong>${nearest.p.peak} cm⁻¹</strong> •
                    ${nearest.p.desc} • ${nearest.p.strength}
                </div>
            `;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        document.getElementById('peak-info').innerHTML = '<p class="peak-hint">Click or hover over peaks for details</p>';
    });

    // ─── Init ───
    // Draw empty canvas
    ctx.fillStyle = 'rgba(6, 6, 25, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.font = '500 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Select a molecule to view its spectrum', canvas.width / 2, canvas.height / 2);

    // Auto-select first molecule
    selectMolecule(0);

})();
