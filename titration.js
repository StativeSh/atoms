// ChemVerse — pH Titration Simulator
(function () {
    'use strict';

    // Acid/base data: Ka or Kb for weak species
    const SPECIES = {
        'hcl': { name: 'HCl', type: 'strong-acid', Ka: 1e7 },
        'acetic': { name: 'CH₃COOH', type: 'weak-acid', Ka: 1.8e-5, pKa: 4.74 },
        'naoh-a': { name: 'NaOH', type: 'strong-base', Kb: 1e7 },
        'nh3': { name: 'NH₃', type: 'weak-base', Kb: 1.8e-5, pKb: 4.74 },
        'naoh': { name: 'NaOH', type: 'strong-base', Kb: 1e7 },
        'hcl-t': { name: 'HCl', type: 'strong-acid', Ka: 1e7 }
    };

    const INDICATORS = {
        'phenolphthalein': { low: 8.2, high: 10.0, colorBelow: 'rgba(255,255,255,0.1)', colorAbove: 'rgba(255,20,147,0.5)' },
        'methyl-orange': { low: 3.1, high: 4.4, colorBelow: 'rgba(255,50,50,0.5)', colorAbove: 'rgba(255,200,0,0.5)' },
        'bromothymol': { low: 6.0, high: 7.6, colorBelow: 'rgba(255,200,0,0.5)', colorAbove: 'rgba(0,100,255,0.5)' },
        'universal': { low: 0, high: 14, colorBelow: '', colorAbove: '' }
    };

    let dataPoints = [], volAdded = 0;
    const flaskCanvas = document.getElementById('flask-canvas'), fctx = flaskCanvas.getContext('2d');
    const phCanvas = document.getElementById('ph-canvas'), pctx = phCanvas.getContext('2d');

    // ─── Controls ───
    const anSel = document.getElementById('analyte-select');
    const tiSel = document.getElementById('titrant-select');
    const anConcSlider = document.getElementById('analyte-conc');
    const anVolSlider = document.getElementById('analyte-vol');
    const tiConcSlider = document.getElementById('titrant-conc');
    const indSel = document.getElementById('indicator-select');

    [anSel, tiSel, anConcSlider, anVolSlider, tiConcSlider, indSel].forEach(el => el.addEventListener('input', reset));
    document.getElementById('btn-reset').addEventListener('click', reset);
    document.getElementById('btn-add-drop').addEventListener('click', () => addTitrant(0.05));
    document.getElementById('btn-add-01').addEventListener('click', () => addTitrant(0.1));
    document.getElementById('btn-add-1').addEventListener('click', () => addTitrant(1));
    document.getElementById('btn-add-5').addEventListener('click', () => addTitrant(5));

    function getAnalyte() { return SPECIES[anSel.value]; }
    function getTitrant() { return SPECIES[tiSel.value]; }
    function getCa() { return Math.pow(10, parseFloat(anConcSlider.value)); }
    function getVa() { return parseFloat(anVolSlider.value); }
    function getCt() { return Math.pow(10, parseFloat(tiConcSlider.value)); }

    function reset() {
        volAdded = 0; dataPoints = [];
        document.getElementById('analyte-conc-val').textContent = getCa().toFixed(3) + ' M';
        document.getElementById('analyte-vol-val').textContent = getVa() + ' mL';
        document.getElementById('titrant-conc-val').textContent = getCt().toFixed(3) + ' M';
        updateAnalysis(); updatePH(); drawFlask(); drawCurve();
    }

    // ─── pH Calculation ───
    function calcPH(vt) {
        const Ca = getCa(), Va = getVa(), Ct = getCt();
        const molesA = Ca * Va / 1000;
        const molesT = Ct * vt / 1000;
        const totalV = (Va + vt) / 1000;
        const analyte = getAnalyte(), titrant = getTitrant();
        const isAcidBase = analyte.type.includes('acid') && titrant.type.includes('base');

        if (isAcidBase) {
            // Titrating acid with base
            if (analyte.type === 'strong-acid') {
                if (molesT < molesA) { const excess = (molesA - molesT) / totalV; return -Math.log10(excess); }
                if (Math.abs(molesT - molesA) < 1e-10) return 7;
                const excess = (molesT - molesA) / totalV; return 14 + Math.log10(excess);
            } else {
                // Weak acid + strong base
                const Ka = analyte.Ka;
                if (molesT < molesA * 0.001) { const H = Math.sqrt(Ka * Ca); return -Math.log10(H); }
                if (molesT < molesA) {
                    const ratio = (molesA - molesT) / molesT;
                    return analyte.pKa + Math.log10(1 / ratio); // Henderson-Hasselbalch
                }
                if (Math.abs(molesT - molesA) < 1e-10) {
                    const Cb = molesA / totalV;
                    const Kb = 1e-14 / Ka;
                    const OH = Math.sqrt(Kb * Cb);
                    return 14 + Math.log10(OH);
                }
                const excess = (molesT - molesA) / totalV;
                return 14 + Math.log10(excess);
            }
        } else {
            // Titrating base with acid
            if (analyte.type === 'strong-base') {
                if (molesT < molesA) { const excess = (molesA - molesT) / totalV; return 14 + Math.log10(excess); }
                if (Math.abs(molesT - molesA) < 1e-10) return 7;
                const excess = (molesT - molesA) / totalV; return -Math.log10(excess);
            } else {
                // Weak base + strong acid
                const Kb = analyte.Kb;
                if (molesT < molesA * 0.001) { const OH = Math.sqrt(Kb * getCa()); return 14 + Math.log10(OH); }
                if (molesT < molesA) {
                    const ratio = molesT / (molesA - molesT);
                    return 14 - analyte.pKb - Math.log10(ratio);
                }
                if (Math.abs(molesT - molesA) < 1e-10) {
                    const Ca2 = molesA / totalV;
                    const Ka = 1e-14 / Kb;
                    const H = Math.sqrt(Ka * Ca2);
                    return -Math.log10(H);
                }
                const excess = (molesT - molesA) / totalV; return -Math.log10(excess);
            }
        }
    }

    function addTitrant(vol) {
        const maxVol = getVa() * 3;
        for (let v = 0; v < vol; v += 0.05) {
            volAdded = Math.min(volAdded + 0.05, maxVol);
            const ph = Math.max(0, Math.min(14, calcPH(volAdded)));
            dataPoints.push({ v: volAdded, ph });
        }
        updatePH(); drawFlask(); drawCurve();
    }

    function updatePH() {
        const ph = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].ph : calcPH(0);
        document.getElementById('ph-val').textContent = ph.toFixed(2);
        document.getElementById('vol-added').textContent = volAdded.toFixed(1) + ' mL';
        // pH needle
        const needle = document.getElementById('ph-needle');
        needle.style.left = (ph / 14 * 100) + '%';
        // Color
        const phVal = document.getElementById('ph-val');
        phVal.style.color = ph < 4 ? '#ef4444' : ph < 6 ? '#f97316' : ph < 8 ? '#22c55e' : ph < 10 ? '#3b82f6' : '#8b5cf6';
    }

    function updateAnalysis() {
        const Ca = getCa(), Va = getVa(), Ct = getCt(), analyte = getAnalyte(), titrant = getTitrant();
        const eqVol = Ca * Va / Ct;
        document.getElementById('eq-point').textContent = eqVol.toFixed(1) + ' mL';
        document.getElementById('half-eq').textContent = (eqVol / 2).toFixed(1) + ' mL';

        const isAB = analyte.type.includes('acid') && titrant.type.includes('base');
        document.getElementById('rxn-type').textContent = isAB ?
            (analyte.type === 'strong-acid' ? 'Strong Acid + Strong Base' : 'Weak Acid + Strong Base') :
            (analyte.type === 'strong-base' ? 'Strong Base + Strong Acid' : 'Weak Base + Strong Acid');

        const eqPH = calcPH(eqVol);
        document.getElementById('eq-ph').textContent = eqPH.toFixed(2);
        document.getElementById('pka-val').textContent = analyte.pKa ? 'pKa = ' + analyte.pKa : analyte.pKb ? 'pKb = ' + analyte.pKb : 'N/A (strong)';
        document.getElementById('buffer-region').textContent = analyte.pKa ? `pH ${(analyte.pKa - 1).toFixed(1)}–${(+analyte.pKa + 1).toFixed(1)}` :
            analyte.pKb ? `pH ${(14 - analyte.pKb - 1).toFixed(1)}–${(14 - +analyte.pKb + 1).toFixed(1)}` : 'None';
    }

    // ═══════════════════════════════
    // Flask Drawing
    // ═══════════════════════════════
    function drawFlask() {
        const w = flaskCanvas.width, h = flaskCanvas.height;
        fctx.clearRect(0, 0, w, h);
        fctx.fillStyle = 'rgba(6,6,25,0.9)'; fctx.fillRect(0, 0, w, h);

        // Erlenmeyer flask shape
        const cx = w / 2, top = 80, neck = 30, bodyTop = 160, bodyBot = h - 30, bodyW = 120;
        fctx.strokeStyle = 'rgba(148,163,184,0.3)'; fctx.lineWidth = 2;
        fctx.beginPath();
        fctx.moveTo(cx - neck, top); fctx.lineTo(cx - neck, bodyTop - 20);
        fctx.lineTo(cx - bodyW, bodyBot); fctx.lineTo(cx + bodyW, bodyBot);
        fctx.lineTo(cx + neck, bodyTop - 20); fctx.lineTo(cx + neck, top);
        fctx.stroke();

        // Solution level
        const fillFrac = Math.min(1, (getVa() + volAdded) / (getVa() * 3));
        const solH = (bodyBot - bodyTop) * fillFrac;
        const solY = bodyBot - solH;
        const solColor = getSolutionColor();

        if (fillFrac > 0) {
            const leW = bodyW * (1 - (bodyBot - solY) / (bodyBot - bodyTop + 20) * 0.7);
            const riW = leW;
            fctx.fillStyle = solColor;
            fctx.beginPath();
            fctx.moveTo(cx - bodyW, bodyBot);
            fctx.lineTo(cx + bodyW, bodyBot);
            fctx.lineTo(cx + leW, solY);
            fctx.lineTo(cx - riW, solY);
            fctx.closePath(); fctx.fill();
        }

        // Burette tip
        fctx.fillStyle = 'rgba(148,163,184,0.4)';
        fctx.fillRect(cx - 3, 10, 6, top - 10);

        // Drops
        if (volAdded > 0) {
            const dropY = top + 10 + (Date.now() / 40 % 40);
            fctx.beginPath(); fctx.arc(cx, dropY, 3, 0, Math.PI * 2);
            fctx.fillStyle = '#a5b4fc88'; fctx.fill();
        }

        // Labels
        fctx.fillStyle = '#e2e8f0'; fctx.font = '600 11px Outfit'; fctx.textAlign = 'center';
        fctx.fillText('Burette', cx, 8);
        fctx.fillStyle = 'rgba(148,163,184,0.4)'; fctx.font = '400 9px Inter';
        fctx.fillText(getAnalyte().name, cx, bodyBot + 18);
    }

    function getSolutionColor() {
        const ph = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].ph : calcPH(0);
        const ind = indSel.value;
        if (ind === 'universal') {
            const hue = (ph / 14) * 270;
            return `hsla(${hue}, 70%, 50%, 0.5)`;
        }
        const info = INDICATORS[ind];
        if (ph < info.low) return info.colorBelow;
        if (ph > info.high) return info.colorAbove;
        return 'rgba(200,180,150,0.3)';
    }

    // ═══════════════════════════════
    // pH Curve Drawing
    // ═══════════════════════════════
    function drawCurve() {
        const w = phCanvas.width, h = phCanvas.height;
        pctx.clearRect(0, 0, w, h);
        pctx.fillStyle = 'rgba(6,6,25,0.9)'; pctx.fillRect(0, 0, w, h);

        const pad = { l: 45, r: 15, t: 20, b: 35 };
        const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;
        const maxV = getVa() * 2.5;

        // Grid
        pctx.strokeStyle = 'rgba(99,102,241,0.08)'; pctx.lineWidth = 1;
        for (let p = 0; p <= 14; p += 2) {
            const y = pad.t + gh - (p / 14) * gh;
            pctx.beginPath(); pctx.moveTo(pad.l, y); pctx.lineTo(w - pad.r, y); pctx.stroke();
            pctx.fillStyle = 'rgba(148,163,184,0.3)'; pctx.font = '400 9px Inter'; pctx.textAlign = 'right';
            pctx.fillText(p, pad.l - 5, y + 3);
        }
        for (let v = 0; v <= maxV; v += 5) {
            const x = pad.l + (v / maxV) * gw;
            pctx.beginPath(); pctx.moveTo(x, pad.t); pctx.lineTo(x, h - pad.b); pctx.stroke();
            if (v % 10 === 0) { pctx.fillStyle = 'rgba(148,163,184,0.3)'; pctx.font = '400 9px Inter'; pctx.textAlign = 'center'; pctx.fillText(v, x, h - pad.b + 12); }
        }

        // Axes
        pctx.strokeStyle = 'rgba(148,163,184,0.3)'; pctx.lineWidth = 1;
        pctx.beginPath(); pctx.moveTo(pad.l, pad.t); pctx.lineTo(pad.l, h - pad.b); pctx.lineTo(w - pad.r, h - pad.b); pctx.stroke();

        // Labels
        pctx.fillStyle = 'rgba(148,163,184,0.4)'; pctx.font = '500 10px Outfit'; pctx.textAlign = 'center';
        pctx.fillText('Volume of Titrant (mL)', w / 2, h - 4);
        pctx.save(); pctx.translate(12, h / 2); pctx.rotate(-Math.PI / 2); pctx.fillText('pH', 0, 0); pctx.restore();

        // Equivalence point line
        const eqVol = getCa() * getVa() / getCt();
        const eqX = pad.l + (eqVol / maxV) * gw;
        pctx.strokeStyle = 'rgba(251,191,36,0.3)'; pctx.setLineDash([4, 4]); pctx.lineWidth = 1;
        pctx.beginPath(); pctx.moveTo(eqX, pad.t); pctx.lineTo(eqX, h - pad.b); pctx.stroke();
        pctx.setLineDash([]); pctx.fillStyle = 'rgba(251,191,36,0.5)'; pctx.font = '500 8px Inter';
        pctx.fillText('Eq.Pt', eqX, pad.t - 5);

        // pH=7 line
        const y7 = pad.t + gh - (7 / 14) * gh;
        pctx.strokeStyle = 'rgba(34,197,94,0.15)'; pctx.setLineDash([2, 3]);
        pctx.beginPath(); pctx.moveTo(pad.l, y7); pctx.lineTo(w - pad.r, y7); pctx.stroke();
        pctx.setLineDash([]);

        // Plot data
        if (dataPoints.length > 1) {
            pctx.beginPath();
            dataPoints.forEach((dp, i) => {
                const x = pad.l + (dp.v / maxV) * gw;
                const y = pad.t + gh - (dp.ph / 14) * gh;
                if (i === 0) pctx.moveTo(x, y); else pctx.lineTo(x, y);
            });
            pctx.strokeStyle = '#a5b4fc'; pctx.lineWidth = 2; pctx.stroke();

            // Current point
            const last = dataPoints[dataPoints.length - 1];
            const lx = pad.l + (last.v / maxV) * gw;
            const ly = pad.t + gh - (last.ph / 14) * gh;
            pctx.beginPath(); pctx.arc(lx, ly, 4, 0, Math.PI * 2);
            pctx.fillStyle = '#fbbf24'; pctx.fill();
        }
    }

    // ─── Init ───
    reset();
    const initPH = calcPH(0);
    dataPoints.push({ v: 0, ph: initPH });
    updatePH(); drawFlask(); drawCurve();
})();

    // ─── Explain Mode Hooks ───
    if (window.ChemExplain) {
        ChemExplain.register('#titr-canvas', 'Titration Curve', 'Shows the change in pH as titrant is added.<br>The steepest part of the curve represents rapid pH change near the equivalence point.');
        ChemExplain.register('#titr-flask', 'Erlenmeyer Flask', 'Contains the <b>Analyte</b> (solution of unknown concentration) and an indicator that changes color at a specific pH range.');
        ChemExplain.register('.info-card:nth-child(2)', 'Equivalence Point', 'The point where the amount of added titrant is stoichiometrically equal to the amount of analyte.<br>pH = 7 for strong-strong, >7 for weak acid-strong base, <7 for strong acid-weak base.');
        ChemExplain.register('.info-card:nth-child(3)', 'Buffer Region', 'A region where the solution resists changes in pH, occurring before the equivalence point in weak acid/base titrations.<br><span class="tt-formula">pH = pKa + log([A-]/[HA])</span>');
    }
