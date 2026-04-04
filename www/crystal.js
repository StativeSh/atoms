// ChemVerse — Crystal Structure Viewer
(function () {
    'use strict';

    const canvas = document.getElementById('crys-canvas');
    const ctx = canvas.getContext('2d');
    let w = canvas.width, h = canvas.height;

    // ─── 3D Engine ───
    let rotX = 0.3, rotY = -0.5, zoom = 1.2;
    let isDragging = false, lastX = 0, lastY = 0;
    let autoRotate = true;

    const COLORS = {
        A: '#fbbf24', B: '#3b82f6', C: '#ef4444', D: '#22c55e', E: '#a855f7'
    };

    const CRYSTALS = [
        {
            id: 'sc', name: 'Simple Cubic (SC)', lattice: 'Cubic', coord: '6', atoms: '1 (8 × 1/8)', packing: '52.4%',
            examples: 'Polonium (Po)', notes: 'Atoms sit only at the corners of the cube.',
            bonds: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]],
            nodes: [
                { id: 0, x: -1, y: -1, z: -1, r: 20, c: 'A', l: 'Corner' }, { id: 1, x: 1, y: -1, z: -1, r: 20, c: 'A', l: 'Corner' },
                { id: 2, x: 1, y: 1, z: -1, r: 20, c: 'A', l: 'Corner' }, { id: 3, x: -1, y: 1, z: -1, r: 20, c: 'A', l: 'Corner' },
                { id: 4, x: -1, y: -1, z: 1, r: 20, c: 'A', l: 'Corner' }, { id: 5, x: 1, y: -1, z: 1, r: 20, c: 'A', l: 'Corner' },
                { id: 6, x: 1, y: 1, z: 1, r: 20, c: 'A', l: 'Corner' }, { id: 7, x: -1, y: 1, z: 1, r: 20, c: 'A', l: 'Corner' }
            ]
        },
        {
            id: 'bcc', name: 'Body-Centered Cubic (BCC)', lattice: 'Cubic', coord: '8', atoms: '2 (8×1/8 + 1)', packing: '68.0%',
            examples: 'Iron (Fe), Tungsten (W), Sodium (Na)', notes: 'Atoms at corners + 1 in the very center. Not closely packed.',
            bonds: [[0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]],
            nodes: [
                { id: 0, x: -1, y: -1, z: -1, r: 15, c: 'A', l: 'Corner' }, { id: 1, x: 1, y: -1, z: -1, r: 15, c: 'A', l: 'Corner' },
                { id: 2, x: 1, y: 1, z: -1, r: 15, c: 'A', l: 'Corner' }, { id: 3, x: -1, y: 1, z: -1, r: 15, c: 'A', l: 'Corner' },
                { id: 4, x: -1, y: -1, z: 1, r: 15, c: 'A', l: 'Corner' }, { id: 5, x: 1, y: -1, z: 1, r: 15, c: 'A', l: 'Corner' },
                { id: 6, x: 1, y: 1, z: 1, r: 15, c: 'A', l: 'Corner' }, { id: 7, x: -1, y: 1, z: 1, r: 15, c: 'A', l: 'Corner' },
                { id: 8, x: 0, y: 0, z: 0, r: 20, c: 'B', l: 'Center' } // Center atom
            ]
        },
        {
            id: 'fcc', name: 'Face-Centered Cubic (FCC / CCP)', lattice: 'Cubic', coord: '12', atoms: '4 (8×1/8 + 6×1/2)', packing: '74.0%',
            examples: 'Copper (Cu), Silver (Ag), Gold (Au), Aluminum', notes: 'Atoms at corners + 1 on each of the 6 faces. Closest packing system.',
            bonds: [
                [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]
            ],
            nodes: [
                { id: 0, x: -1, y: -1, z: -1, r: 12, c: 'A' }, { id: 1, x: 1, y: -1, z: -1, r: 12, c: 'A' },
                { id: 2, x: 1, y: 1, z: -1, r: 12, c: 'A' }, { id: 3, x: -1, y: 1, z: -1, r: 12, c: 'A' },
                { id: 4, x: -1, y: -1, z: 1, r: 12, c: 'A' }, { id: 5, x: 1, y: -1, z: 1, r: 12, c: 'A' },
                { id: 6, x: 1, y: 1, z: 1, r: 12, c: 'A' }, { id: 7, x: -1, y: 1, z: 1, r: 12, c: 'A' },
                // Faces
                { id: 8, x: 0, y: 0, z: -1, r: 16, c: 'C', l: 'Face' }, { id: 9, x: 0, y: 0, z: 1, r: 16, c: 'C', l: 'Face' }, // Front/Back
                { id: 10, x: -1, y: 0, z: 0, r: 16, c: 'C', l: 'Face' }, { id: 11, x: 1, y: 0, z: 0, r: 16, c: 'C', l: 'Face' }, // Left/Right
                { id: 12, x: 0, y: -1, z: 0, r: 16, c: 'C', l: 'Face' }, { id: 13, x: 0, y: 1, z: 0, r: 16, c: 'C', l: 'Face' } // Top/Bottom
            ]
        },
        {
            id: 'diamond', name: 'Diamond / Zinc Blende', lattice: 'FCC derivative', coord: '4', atoms: '8 (corners + faces + 4 internal)', packing: '34.0%',
            examples: 'Diamond (C), Silicon (Si), GaAs, ZnS', notes: 'FCC lattice with 4 additional atoms in tetrahedral holes.',
            bonds: [
                // Cell outline
                [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
                // Tetrahedral bonds (approximate indices for visualization)
                [14, 0], [14, 10], [14, 12], [14, 8],  // Internal 1 bonds to corner and 3 faces
                [15, 2], [15, 11], [15, 13], [15, 8],
                [16, 5], [16, 11], [16, 12], [16, 9],
                [17, 7], [17, 10], [17, 13], [17, 9]
            ],
            nodes: [
                // FCC outline (0-13)
                { id: 0, x: -1, y: -1, z: -1, r: 10, c: 'A' }, { id: 1, x: 1, y: -1, z: -1, r: 10, c: 'A' }, { id: 2, x: 1, y: 1, z: -1, r: 10, c: 'A' }, { id: 3, x: -1, y: 1, z: -1, r: 10, c: 'A' },
                { id: 4, x: -1, y: -1, z: 1, r: 10, c: 'A' }, { id: 5, x: 1, y: -1, z: 1, r: 10, c: 'A' }, { id: 6, x: 1, y: 1, z: 1, r: 10, c: 'A' }, { id: 7, x: -1, y: 1, z: 1, r: 10, c: 'A' },
                { id: 8, x: 0, y: 0, z: -1, r: 10, c: 'C' }, { id: 9, x: 0, y: 0, z: 1, r: 10, c: 'C' }, { id: 10, x: -1, y: 0, z: 0, r: 10, c: 'C' }, { id: 11, x: 1, y: 0, z: 0, r: 10, c: 'C' },
                { id: 12, x: 0, y: -1, z: 0, r: 10, c: 'C' }, { id: 13, x: 0, y: 1, z: 0, r: 10, c: 'C' },
                // Internal tetrahedral sites
                { id: 14, x: -0.5, y: -0.5, z: -0.5, r: 15, c: 'D', l: 'Tetrahedral' },
                { id: 15, x: 0.5, y: 0.5, z: -0.5, r: 15, c: 'D', l: 'Tetrahedral' },
                { id: 16, x: 0.5, y: -0.5, z: 0.5, r: 15, c: 'D', l: 'Tetrahedral' },
                { id: 17, x: -0.5, y: 0.5, z: 0.5, r: 15, c: 'D', l: 'Tetrahedral' }
            ]
        },
        {
            id: 'hcp', name: 'Hexagonal Close-Packed (HCP)', lattice: 'Hexagonal', coord: '12', atoms: '6', packing: '74.0%',
            examples: 'Magnesium (Mg), Zinc (Zn), Titanium (Ti)', notes: 'ABA layer sequence. Top/bottom hexagons + 3 central atoms.',
            bonds: [
                // Top hex
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
                // Bottom hex
                [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7], [7, 13], [8, 13], [9, 13], [10, 13], [11, 13], [12, 13],
                // Verticals (cell edges)
                [0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12]
            ],
            nodes: [
                // Top hexagon + face center (z=-1)
                { x: Math.cos(0), y: Math.sin(0), z: -1.2, r: 12, c: 'A' }, { x: Math.cos(Math.PI / 3), y: Math.sin(Math.PI / 3), z: -1.2, r: 12, c: 'A' },
                { x: Math.cos(2 * Math.PI / 3), y: Math.sin(2 * Math.PI / 3), z: -1.2, r: 12, c: 'A' }, { x: Math.cos(Math.PI), y: Math.sin(Math.PI), z: -1.2, r: 12, c: 'A' },
                { x: Math.cos(4 * Math.PI / 3), y: Math.sin(4 * Math.PI / 3), z: -1.2, r: 12, c: 'A' }, { x: Math.cos(5 * Math.PI / 3), y: Math.sin(5 * Math.PI / 3), z: -1.2, r: 12, c: 'A' },
                { x: 0, y: 0, z: -1.2, r: 12, c: 'B', l: 'Top Face' },
                // Bottom hexagon + face center (z=1)
                { x: Math.cos(0), y: Math.sin(0), z: 1.2, r: 12, c: 'A' }, { x: Math.cos(Math.PI / 3), y: Math.sin(Math.PI / 3), z: 1.2, r: 12, c: 'A' },
                { x: Math.cos(2 * Math.PI / 3), y: Math.sin(2 * Math.PI / 3), z: 1.2, r: 12, c: 'A' }, { x: Math.cos(Math.PI), y: Math.sin(Math.PI), z: 1.2, r: 12, c: 'A' },
                { x: Math.cos(4 * Math.PI / 3), y: Math.sin(4 * Math.PI / 3), z: 1.2, r: 12, c: 'A' }, { x: Math.cos(5 * Math.PI / 3), y: Math.sin(5 * Math.PI / 3), z: 1.2, r: 12, c: 'A' },
                { x: 0, y: 0, z: 1.2, r: 12, c: 'B', l: 'Bottom Face' },
                // Mid plane (3 atoms)
                { x: 0.5 * Math.cos(Math.PI / 6), y: 0.5 * Math.sin(Math.PI / 6), z: 0, r: 16, c: 'E', l: 'B Layer' },
                { x: 0.5 * Math.cos(5 * Math.PI / 6), y: 0.5 * Math.sin(5 * Math.PI / 6), z: 0, r: 16, c: 'E', l: 'B Layer' },
                { x: 0.5 * Math.cos(9 * Math.PI / 6), y: 0.5 * Math.sin(9 * Math.PI / 6), z: 0, r: 16, c: 'E', l: 'B Layer' }
            ]
        }
    ];

    let activeCrys = CRYSTALS[1]; // default BCC

    // ─── UI Init ───
    const listEl = document.getElementById('crys-list');
    CRYSTALS.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'crys-btn' + (c.id === activeCrys.id ? ' active' : '');
        btn.innerHTML = `${c.name}<span class="crys-sub">${c.lattice} Structure</span>`;
        btn.onclick = () => {
            document.querySelectorAll('.crys-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCrys = c; updateInfo();
        };
        listEl.appendChild(btn);
    });

    // Controls
    const autoRotateCb = document.getElementById('auto-rotate');
    const zoomSlider = document.getElementById('zoom-slider');
    zoomSlider.oninput = () => zoom = parseFloat(zoomSlider.value);
    document.getElementById('show-bonds').onclick = () => draw();
    document.getElementById('show-labels').onclick = () => draw();
    document.getElementById('show-cell').onclick = () => draw();

    function updateInfo() {
        document.getElementById('crys-name').textContent = activeCrys.name;
        document.getElementById('crys-lattice').textContent = activeCrys.lattice;
        document.getElementById('crys-coord').textContent = activeCrys.coord;
        document.getElementById('crys-atoms').textContent = activeCrys.atoms;
        document.getElementById('crys-packing').textContent = activeCrys.packing;
        document.getElementById('crys-examples').textContent = activeCrys.examples;
        document.getElementById('crys-notes').textContent = activeCrys.notes;
        draw();
    }

    // ─── 3D Projection & Math ───
    function project(x, y, z) {
        // Rotate Y (yaw)
        let rx = x * Math.cos(rotY) - z * Math.sin(rotY);
        let rz = x * Math.sin(rotY) + z * Math.cos(rotY);
        // Rotate X (pitch)
        let ry = y * Math.cos(rotX) - rz * Math.sin(rotX);
        rz = y * Math.sin(rotX) + rz * Math.cos(rotX);

        // Scale and center
        const scale = 120 * zoom;
        return {
            x: w / 2 + rx * scale,
            y: h / 2 + ry * scale,
            z: rz, // for depth sorting
            rawR: 1 // reference radius
        };
    }

    // ─── Interaction ───
    canvas.addEventListener('mousedown', e => {
        isDragging = true;
        lastX = e.clientX; lastY = e.clientY;
        autoRotateCb.checked = false; // Turn off auto-rotate when manually dragged
    });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        rotY += dx * 0.01;
        rotX += dy * 0.01;
        lastX = e.clientX; lastY = e.clientY;
        draw();
    });
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        zoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.002));
        zoomSlider.value = zoom;
        draw();
    }, { passive: false });

    // ─── Rendering ───
    function draw() {
        ctx.clearRect(0, 0, w, h);
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, 'rgba(6,6,25,0.9)'); bg.addColorStop(1, 'rgba(15,15,35,0.95)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

        const showBonds = document.getElementById('show-bonds').checked;
        const showLabels = document.getElementById('show-labels').checked;
        const showCell = document.getElementById('show-cell').checked;

        // Calculate projected positions
        const points = activeCrys.nodes.map((n, i) => {
            const p = project(n.x, n.y, n.z);
            return { ...n, px: p.x, py: p.y, pz: p.z, idx: i };
        });

        // Draw unit cell box (cubic only)
        if (showCell && activeCrys.lattice.includes('Cubic')) {
            const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
            ctx.strokeStyle = 'rgba(99,102,241,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
            edges.forEach(e => {
                const p1 = project(activeCrys.nodes[e[0]].x, activeCrys.nodes[e[0]].y, activeCrys.nodes[e[0]].z);
                const p2 = project(activeCrys.nodes[e[1]].x, activeCrys.nodes[e[1]].y, activeCrys.nodes[e[1]].z);
                ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            });
            ctx.setLineDash([]);
        }

        // Draw bonds (depth sorted not strictly needed for lines, but good practice) //
        if (showBonds && activeCrys.bonds) {
            ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 2.5 * zoom;
            activeCrys.bonds.forEach(b => {
                const p1 = points[b[0]], p2 = points[b[1]];
                if (p1 && p2) {
                    ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
                }
            });
        }

        // Draw atoms sorted by depth (z)
        points.sort((a, b) => a.pz - b.pz); // Draw back to front

        points.forEach(p => {
            // Perspective scaling for radius
            const scale = 120 / (200 + p.pz); // simple perspective division
            const radius = p.r * zoom * (1 - p.pz * 0.1);

            // Draw shadow/glow
            ctx.beginPath(); ctx.arc(p.px, p.py, radius + 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();

            // Draw sphere gradient
            const grd = ctx.createRadialGradient(p.px - radius * 0.3, p.py - radius * 0.3, radius * 0.1, p.px, p.py, radius);
            grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.3, COLORS[p.c]); grd.addColorStop(1, '#000000');

            ctx.beginPath(); ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();

            // Label
            if (showLabels && p.l) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = '500 10px Inter'; ctx.textAlign = 'center';
                ctx.fillText(p.l, p.px, p.py - radius - 6);
            }
        });
    }

    function loop() {
        if (autoRotateCb.checked) {
            rotY += 0.005;
            draw();
        }
        requestAnimationFrame(loop);
    }

    // Init
    updateInfo();
    loop();

})();
