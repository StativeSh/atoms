// ChemVerse — Reaction Mechanism Animator
(function () {
    'use strict';

    // ─── Mechanism Database ───
    const MECHANISMS = [
        {
            name: 'SN2', type: 'Substitution', badge: 'substitution',
            summary: 'Bimolecular nucleophilic substitution. One-step concerted mechanism with backside attack and Walden inversion.',
            concepts: ['Backside attack', 'Walden inversion', 'Concerted (one step)', 'Rate = k[substrate][Nu⁻]', 'Favored by 1° substrates'],
            steps: [
                {
                    title: 'Nucleophile Approaches', desc: 'The nucleophile (OH⁻) approaches the electrophilic carbon from the backside, opposite to the leaving group (Br⁻).',
                    atoms: [{ x: 150, y: 225, label: 'HO⁻', color: '#ef4444', r: 18 }, { x: 450, y: 225, label: 'C', color: '#94a3b8', r: 16 }, { x: 600, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 450, y: 150, label: 'H', color: '#e2e8f0', r: 10 }, { x: 450, y: 300, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[1, 2, 1], [1, 3, 1], [1, 4, 1]], arrows: [{ from: [0], to: [1], color: '#ef4444', label: 'Nu⁻ attack' }]
                },
                {
                    title: 'Transition State', desc: 'A pentacoordinate transition state forms. The C-Br bond is partially broken while the C-OH bond is partially formed. The configuration is inverting.',
                    atoms: [{ x: 250, y: 225, label: 'HO', color: '#ef4444', r: 16 }, { x: 450, y: 225, label: 'C‡', color: '#fbbf24', r: 18 }, { x: 620, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 450, y: 140, label: 'H', color: '#e2e8f0', r: 10 }, { x: 450, y: 310, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[0, 1, 0.5], [1, 2, 0.5], [1, 3, 1], [1, 4, 1]], arrows: [], highlight: true
                },
                {
                    title: 'Product Formation', desc: 'The leaving group (Br⁻) departs. The configuration at carbon has inverted (Walden inversion). The alcohol product is formed.',
                    atoms: [{ x: 300, y: 225, label: 'HO', color: '#ef4444', r: 16 }, { x: 450, y: 225, label: 'C', color: '#94a3b8', r: 16 }, { x: 750, y: 225, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 450, y: 150, label: 'H', color: '#e2e8f0', r: 10 }, { x: 450, y: 300, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[0, 1, 1], [1, 3, 1], [1, 4, 1]], arrows: [{ from: [1], to: [2], color: '#f59e0b', label: 'LG departs' }]
                }
            ]
        },
        {
            name: 'SN1', type: 'Substitution', badge: 'substitution',
            summary: 'Unimolecular nucleophilic substitution. Two-step mechanism via carbocation intermediate. Racemization occurs.',
            concepts: ['Carbocation intermediate', 'Rate = k[substrate]', 'Racemization', 'Favored by 3° substrates', 'Two steps'],
            steps: [
                {
                    title: 'Ionization', desc: 'The C-Br bond breaks heterolytically. The leaving group (Br⁻) departs, forming a planar carbocation.',
                    atoms: [{ x: 400, y: 225, label: 'C', color: '#94a3b8', r: 16 }, { x: 600, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 350, y: 150, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 350, y: 300, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 450, y: 160, label: 'CH₃', color: '#22c55e', r: 14 }],
                    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], arrows: [{ from: [0], to: [1], color: '#f59e0b', label: 'LG departs' }]
                },
                {
                    title: 'Carbocation Formed', desc: 'A planar sp² carbocation intermediate is formed. It is stabilized by hyperconjugation from the methyl groups.',
                    atoms: [{ x: 400, y: 225, label: 'C⁺', color: '#fbbf24', r: 20 }, { x: 700, y: 225, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 320, y: 155, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 320, y: 295, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 480, y: 155, label: 'CH₃', color: '#22c55e', r: 14 }],
                    bonds: [[0, 2, 1], [0, 3, 1], [0, 4, 1]], arrows: [], highlight: true
                },
                {
                    title: 'Nucleophilic Attack', desc: 'Water (nucleophile) attacks the carbocation from either face, leading to racemization.',
                    atoms: [{ x: 400, y: 225, label: 'C', color: '#94a3b8', r: 16 }, { x: 700, y: 225, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 320, y: 155, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 320, y: 295, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 480, y: 155, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 150, y: 225, label: 'H₂O', color: '#3b82f6', r: 16 }],
                    bonds: [[0, 2, 1], [0, 3, 1], [0, 4, 1]], arrows: [{ from: [5], to: [0], color: '#3b82f6', label: 'Nu attack' }]
                },
                {
                    title: 'Product (Racemic)', desc: 'After deprotonation, the alcohol product is formed. Since attack occurs from both faces, a racemic mixture results.',
                    atoms: [{ x: 400, y: 225, label: 'C', color: '#94a3b8', r: 16 }, { x: 250, y: 225, label: 'OH', color: '#ef4444', r: 16 }, { x: 320, y: 155, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 320, y: 295, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 480, y: 155, label: 'CH₃', color: '#22c55e', r: 14 }],
                    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], arrows: []
                }
            ]
        },
        {
            name: 'E2', type: 'Elimination', badge: 'elimination',
            summary: 'Bimolecular elimination. One-step concerted mechanism requiring anti-periplanar geometry.',
            concepts: ['Anti-periplanar geometry', 'Concerted', 'Rate = k[substrate][base]', 'Strong base required', 'Zaitsev\'s rule'],
            steps: [
                {
                    title: 'Base Approaches β-H', desc: 'A strong base (OH⁻) approaches the β-hydrogen. The C-H, C=C, and C-LG bonds all change simultaneously.',
                    atoms: [{ x: 100, y: 200, label: 'OH⁻', color: '#ef4444', r: 16 }, { x: 300, y: 175, label: 'Hβ', color: '#e2e8f0', r: 10 }, { x: 400, y: 225, label: 'Cβ', color: '#94a3b8', r: 14 }, { x: 550, y: 225, label: 'Cα', color: '#94a3b8', r: 14 }, { x: 700, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 400, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 550, y: 310, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[1, 2, 1], [2, 3, 1], [3, 4, 1], [2, 5, 1], [3, 6, 1]], arrows: [{ from: [0], to: [1], color: '#ef4444', label: 'Base abstracts H' }]
                },
                {
                    title: 'Concerted Transition State', desc: 'All bond changes occur simultaneously: C-H breaking, C=C forming, C-Br breaking. Anti-periplanar geometry is essential.',
                    atoms: [{ x: 150, y: 200, label: 'HO-H', color: '#ef4444', r: 18 }, { x: 400, y: 225, label: 'C‡', color: '#fbbf24', r: 16 }, { x: 550, y: 225, label: 'C‡', color: '#fbbf24', r: 16 }, { x: 700, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 400, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 550, y: 310, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[1, 2, 1.5], [2, 3, 0.5], [1, 4, 1], [2, 5, 1]], arrows: [], highlight: true
                },
                {
                    title: 'Alkene Product', desc: 'The alkene is formed by elimination of HBr. The double bond forms between Cα and Cβ. Zaitsev product is major.',
                    atoms: [{ x: 100, y: 200, label: 'H₂O', color: '#3b82f6', r: 14 }, { x: 400, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 550, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 750, y: 225, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 400, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 550, y: 310, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[1, 2, 2], [1, 4, 1], [2, 5, 1]], arrows: []
                }
            ]
        },
        {
            name: 'E1', type: 'Elimination', badge: 'elimination',
            summary: 'Unimolecular elimination. Two-step mechanism via carbocation, then base removes β-H to form alkene.',
            concepts: ['Carbocation intermediate', 'Rate = k[substrate]', 'Zaitsev product', 'Weak base sufficient', 'Two steps'],
            steps: [
                {
                    title: 'Ionization', desc: 'The leaving group departs, forming a carbocation intermediate (same as SN1 first step).',
                    atoms: [{ x: 400, y: 225, label: 'C', color: '#94a3b8', r: 16 }, { x: 600, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 300, y: 175, label: 'Hβ', color: '#e2e8f0', r: 10 }, { x: 300, y: 225, label: 'Cβ', color: '#94a3b8', r: 14 }, { x: 400, y: 310, label: 'CH₃', color: '#22c55e', r: 14 }],
                    bonds: [[0, 1, 1], [3, 0, 1], [3, 2, 1], [0, 4, 1]], arrows: [{ from: [0], to: [1], color: '#f59e0b', label: 'LG departs' }]
                },
                {
                    title: 'Carbocation', desc: 'Planar sp² carbocation formed. A weak base can now remove a β-hydrogen.',
                    atoms: [{ x: 400, y: 225, label: 'C⁺', color: '#fbbf24', r: 20 }, { x: 700, y: 225, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 280, y: 175, label: 'Hβ', color: '#e2e8f0', r: 10 }, { x: 300, y: 225, label: 'Cβ', color: '#94a3b8', r: 14 }, { x: 400, y: 310, label: 'CH₃', color: '#22c55e', r: 14 }],
                    bonds: [[3, 0, 1], [3, 2, 1], [0, 4, 1]], arrows: [], highlight: true
                },
                {
                    title: 'Deprotonation', desc: 'A base removes the β-hydrogen. Electron pair forms the C=C double bond.',
                    atoms: [{ x: 400, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 700, y: 225, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 120, y: 175, label: 'B-Hβ', color: '#3b82f6', r: 16 }, { x: 300, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 400, y: 310, label: 'CH₃', color: '#22c55e', r: 14 }],
                    bonds: [[3, 0, 2], [0, 4, 1]], arrows: []
                }
            ]
        },
        {
            name: 'Electrophilic Addition', type: 'Addition', badge: 'addition',
            summary: 'Addition of HBr to an alkene. Two steps: protonation forms carbocation, then bromide attacks.',
            concepts: ['Markovnikov\'s rule', 'Carbocation intermediate', 'Regioselectivity', 'Anti addition possible'],
            steps: [
                {
                    title: 'Alkene + HBr', desc: 'The π electrons of the alkene attack the electrophilic H of HBr.',
                    atoms: [{ x: 300, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 450, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 600, y: 200, label: 'H', color: '#e2e8f0', r: 10 }, { x: 700, y: 200, label: 'Br', color: '#f59e0b', r: 16 }, { x: 300, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 300, y: 150, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 450, y: 310, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[0, 1, 2], [2, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1]], arrows: [{ from: [0, 1], to: [2], color: '#6366f1', label: 'π attack on H' }]
                },
                {
                    title: 'Carbocation + Br⁻', desc: 'Protonation follows Markovnikov\'s rule — H adds to the less substituted carbon, giving the more stable carbocation.',
                    atoms: [{ x: 300, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 450, y: 225, label: 'C⁺', color: '#fbbf24', r: 18 }, { x: 700, y: 200, label: 'Br⁻', color: '#f59e0b', r: 18 }, { x: 300, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 300, y: 150, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 450, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 450, y: 150, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[0, 1, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1]], arrows: [{ from: [2], to: [1], color: '#f59e0b', label: 'Br⁻ attacks C⁺' }], highlight: true
                },
                {
                    title: 'Product', desc: 'Bromide adds to the carbocation. The Markovnikov product is formed (Br on more substituted carbon).',
                    atoms: [{ x: 300, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 450, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 550, y: 225, label: 'Br', color: '#f59e0b', r: 16 }, { x: 300, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 300, y: 150, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 450, y: 310, label: 'H', color: '#e2e8f0', r: 10 }, { x: 450, y: 150, label: 'H', color: '#e2e8f0', r: 10 }],
                    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1]], arrows: []
                }
            ]
        },
        {
            name: 'Esterification', type: 'Acyl Substitution', badge: 'acyl',
            summary: 'Fischer esterification: acid-catalyzed reaction of a carboxylic acid with an alcohol to form an ester + water.',
            concepts: ['Acid catalysis', 'Tetrahedral intermediate', 'Nucleophilic acyl substitution', 'Equilibrium reaction', 'Le Chatelier'],
            steps: [
                {
                    title: 'Protonation of C=O', desc: 'The acid catalyst protonates the carbonyl oxygen, activating it for nucleophilic attack.',
                    atoms: [{ x: 350, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 350, y: 140, label: 'O', color: '#ef4444', r: 14 }, { x: 250, y: 225, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 450, y: 225, label: 'OH', color: '#ef4444', r: 14 }, { x: 200, y: 140, label: 'H⁺', color: '#fbbf24', r: 10 }],
                    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], arrows: [{ from: [4], to: [1], color: '#fbbf24', label: 'H⁺ protonates O' }]
                },
                {
                    title: 'Nucleophilic Attack', desc: 'The alcohol oxygen attacks the activated carbonyl carbon, forming a tetrahedral intermediate.',
                    atoms: [{ x: 350, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 350, y: 140, label: 'OH⁺', color: '#fbbf24', r: 14 }, { x: 250, y: 225, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 450, y: 225, label: 'OH', color: '#ef4444', r: 14 }, { x: 600, y: 225, label: 'CH₃OH', color: '#3b82f6', r: 18 }],
                    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], arrows: [{ from: [4], to: [0], color: '#3b82f6', label: 'ROH attacks C' }], highlight: true
                },
                {
                    title: 'Water Loss', desc: 'The tetrahedral intermediate loses water, and the proton is returned to reform the acid catalyst.',
                    atoms: [{ x: 350, y: 225, label: 'C', color: '#94a3b8', r: 14 }, { x: 350, y: 140, label: 'O', color: '#ef4444', r: 14 }, { x: 250, y: 225, label: 'CH₃', color: '#22c55e', r: 14 }, { x: 480, y: 225, label: 'O-CH₃', color: '#3b82f6', r: 18 }, { x: 650, y: 300, label: 'H₂O', color: '#3b82f6', r: 14 }],
                    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]], arrows: [{ from: [0], to: [4], color: '#ef4444', label: 'H₂O leaves' }]
                }
            ]
        }
    ];

    // ─── State ───
    let activeMech = null, currentStep = 0, playing = false, playInterval = null, speed = 1, animProgress = 0;
    const canvas = document.getElementById('mech-canvas'), ctx = canvas.getContext('2d');

    // ─── Build Mechanism List ───
    const mechList = document.getElementById('mech-list');
    MECHANISMS.forEach((m, i) => {
        const btn = document.createElement('button');
        btn.className = 'mech-btn';
        btn.innerHTML = `<span class="mech-btn-name">${m.name}</span><span class="mech-btn-type">${m.type}</span><span class="mech-btn-badge badge-${m.badge}">${m.type}</span>`;
        btn.addEventListener('click', () => selectMech(i));
        mechList.appendChild(btn);
    });

    // ─── Controls ───
    document.getElementById('btn-prev').addEventListener('click', prevStep);
    document.getElementById('btn-next').addEventListener('click', nextStep);
    document.getElementById('btn-play').addEventListener('click', togglePlay);
    document.getElementById('speed-slider').addEventListener('input', e => {
        speed = parseFloat(e.target.value);
        document.getElementById('speed-label').textContent = speed + '×';
    });

    function selectMech(idx) {
        activeMech = idx; currentStep = 0; stopPlay();
        const m = MECHANISMS[idx];
        document.querySelectorAll('.mech-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
        document.getElementById('mech-title').textContent = m.name;
        document.getElementById('mech-type').textContent = m.type;
        document.getElementById('mech-summary-text').textContent = m.summary;
        const concepts = document.getElementById('mech-concepts');
        concepts.innerHTML = '';
        m.concepts.forEach(c => { const t = document.createElement('div'); t.className = 'concept-tag'; t.textContent = c; concepts.appendChild(t); });
        updateStepUI(); drawStep();
    }

    function prevStep() { if (activeMech === null) return; currentStep = Math.max(0, currentStep - 1); updateStepUI(); drawStep(); }
    function nextStep() { if (activeMech === null) return; const m = MECHANISMS[activeMech]; currentStep = Math.min(m.steps.length - 1, currentStep + 1); updateStepUI(); drawStep(); }

    function togglePlay() {
        if (playing) { stopPlay(); return; }
        playing = true;
        document.getElementById('btn-play').textContent = '⏸'; document.getElementById('btn-play').classList.add('playing');
        playInterval = setInterval(() => {
            const m = MECHANISMS[activeMech];
            if (currentStep < m.steps.length - 1) { currentStep++; updateStepUI(); drawStep(); }
            else stopPlay();
        }, 2500 / speed);
    }

    function stopPlay() {
        playing = false; clearInterval(playInterval);
        document.getElementById('btn-play').textContent = '▶'; document.getElementById('btn-play').classList.remove('playing');
    }

    function updateStepUI() {
        const m = MECHANISMS[activeMech], s = m.steps[currentStep];
        document.getElementById('step-current').textContent = currentStep + 1;
        document.getElementById('step-total').textContent = m.steps.length;
        document.getElementById('step-name').textContent = `Step ${currentStep + 1}: ${s.title}`;
        document.getElementById('step-desc').textContent = s.desc;
    }

    // ═══════════════════════════════════════════════
    // Canvas Drawing
    // ═══════════════════════════════════════════════
    function drawStep() {
        if (activeMech === null) return;
        const m = MECHANISMS[activeMech], s = m.steps[currentStep];
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, 'rgba(6, 6, 25, 0.95)'); bg.addColorStop(1, 'rgba(15, 15, 45, 0.95)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

        // Highlight glow for transition states
        if (s.highlight) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.03)'; ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
            ctx.strokeRect(20, 20, w - 40, h - 40); ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.4)'; ctx.font = '600 10px Outfit'; ctx.textAlign = 'right';
            ctx.fillText('‡ TRANSITION STATE', w - 30, 38);
        }

        // Draw bonds
        s.bonds.forEach(([a, b, order]) => {
            const aa = s.atoms[a], bb = s.atoms[b];
            if (order === 0.5) { ctx.setLineDash([6, 4]); ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'; ctx.lineWidth = 2; }
            else if (order === 1.5) { ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'; ctx.lineWidth = 3; }
            else { ctx.setLineDash([]); ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'; ctx.lineWidth = 2; }
            if (order === 2) {
                const dx = bb.x - aa.x, dy = bb.y - aa.y, len = Math.sqrt(dx * dx + dy * dy);
                const nx = -dy / len * 3, ny = dx / len * 3;
                ctx.beginPath(); ctx.moveTo(aa.x + nx, aa.y + ny); ctx.lineTo(bb.x + nx, bb.y + ny); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(aa.x - nx, aa.y - ny); ctx.lineTo(bb.x - nx, bb.y - ny); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(aa.x, aa.y); ctx.lineTo(bb.x, bb.y); ctx.stroke();
            }
            ctx.setLineDash([]);
        });

        // Draw curved arrows
        s.arrows.forEach(ar => {
            const fromAtom = s.atoms[ar.from[0]], toAtom = s.atoms[ar.to[0]];
            const midX = (fromAtom.x + toAtom.x) / 2, midY = (fromAtom.y + toAtom.y) / 2 - 50;
            ctx.strokeStyle = ar.color; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(fromAtom.x, fromAtom.y - fromAtom.r);
            ctx.quadraticCurveTo(midX, midY, toAtom.x, toAtom.y - toAtom.r); ctx.stroke();
            // Arrowhead
            const angle = Math.atan2(toAtom.y - toAtom.r - midY, toAtom.x - midX);
            ctx.beginPath();
            ctx.moveTo(toAtom.x, toAtom.y - toAtom.r);
            ctx.lineTo(toAtom.x - 10 * Math.cos(angle - 0.4), toAtom.y - toAtom.r - 10 * Math.sin(angle - 0.4));
            ctx.lineTo(toAtom.x - 10 * Math.cos(angle + 0.4), toAtom.y - toAtom.r - 10 * Math.sin(angle + 0.4));
            ctx.closePath(); ctx.fillStyle = ar.color; ctx.fill();
            // Label
            ctx.fillStyle = ar.color; ctx.font = '500 10px Inter'; ctx.textAlign = 'center';
            ctx.fillText(ar.label, midX, midY - 8);
        });

        // Draw atoms
        s.atoms.forEach(a => {
            ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = a.color + '33'; ctx.fill();
            ctx.strokeStyle = a.color; ctx.lineWidth = 2; ctx.stroke();
            if (s.highlight && a.label.includes('‡')) { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0; }
            ctx.fillStyle = a.color; ctx.font = `600 ${a.r > 14 ? 12 : 10}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(a.label, a.x, a.y);
        });

        // Step label
        ctx.fillStyle = '#e2e8f0'; ctx.font = '600 12px Outfit'; ctx.textAlign = 'left';
        ctx.fillText(`Step ${currentStep + 1}: ${s.title}`, 20, h - 16);
        ctx.fillStyle = 'rgba(148,163,184,0.4)'; ctx.font = '400 10px Inter'; ctx.textAlign = 'right';
        ctx.fillText(m.name + ' Mechanism', w - 20, h - 16);
    }

    // ─── Init ───
    ctx.fillStyle = 'rgba(6, 6, 25, 0.95)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'; ctx.font = '500 16px Outfit'; ctx.textAlign = 'center';
    ctx.fillText('Select a mechanism to view its animation', canvas.width / 2, canvas.height / 2);
    selectMech(0);
})();
