// ============================================
//  ChemVerse — Periodic Table Interactive Logic
// ============================================

(function () {
    'use strict';

    const grid = document.getElementById('periodic-grid');
    const hoverCard = document.getElementById('hover-card');
    const searchInput = document.getElementById('element-search');
    const legendContainer = document.getElementById('category-legend');

    let activeCategory = null; // for category filter

    // ─── Build Category Legend ───
    function buildLegend() {
        // "All" button
        const allBtn = document.createElement('div');
        allBtn.className = 'legend-item active';
        allBtn.innerHTML = '<span class="legend-dot" style="background: var(--accent-gradient)"></span> All';
        allBtn.addEventListener('click', () => {
            activeCategory = null;
            document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('active'));
            allBtn.classList.add('active');
            applyFilters();
        });
        legendContainer.appendChild(allBtn);

        Object.entries(ELEMENT_CATEGORIES).forEach(([key, cat]) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.style.color = cat.color;
            item.innerHTML = `<span class="legend-dot" style="background: ${cat.color}"></span> ${cat.label}`;
            item.addEventListener('click', () => {
                activeCategory = activeCategory === key ? null : key;
                document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('active'));
                if (activeCategory) {
                    item.classList.add('active');
                } else {
                    allBtn.classList.add('active');
                }
                applyFilters();
            });
            legendContainer.appendChild(item);
        });
    }

    // ─── Build Periodic Table Grid ───
    function buildGrid() {
        // Standard periodic table: 7 main rows + gap + 2 f-block rows
        // Rows 1–7 = periods, Row 8 = lanthanides, Row 9 = actinides
        // We also need a gap row between row 7 and row 8

        // Create a slot map: row -> col -> element
        const slotMap = {};
        ALL_ELEMENTS.forEach(el => {
            if (!slotMap[el.row]) slotMap[el.row] = {};
            slotMap[el.row][el.col] = el;
        });

        // We also need lanthanide/actinide placeholder tiles at row 6 col 3 and row 7 col 3
        const displayRows = [1, 2, 3, 4, 5, 6, 7];
        const fBlockRows = [8, 9]; // lanthanides, actinides

        // Main grid rows
        displayRows.forEach(row => {
            for (let col = 1; col <= 18; col++) {
                const el = slotMap[row] && slotMap[row][col];

                if (el) {
                    grid.appendChild(createTile(el));
                } else if (row === 6 && col === 3) {
                    // Lanthanide placeholder
                    const placeholder = document.createElement('div');
                    placeholder.className = 'element-tile';
                    placeholder.style.setProperty('--tile-color', ELEMENT_CATEGORIES['lanthanide'].color);
                    placeholder.style.setProperty('--tile-glow', ELEMENT_CATEGORIES['lanthanide'].glow);
                    placeholder.innerHTML = `
                        <span class="tile-z" style="visibility:hidden">0</span>
                        <span class="tile-symbol" style="font-size:10px">57-71</span>
                        <span class="tile-name" style="font-size:6px">Lanthanides</span>
                    `;
                    placeholder.style.cursor = 'default';
                    grid.appendChild(placeholder);
                } else if (row === 7 && col === 3) {
                    // Actinide placeholder
                    const placeholder = document.createElement('div');
                    placeholder.className = 'element-tile';
                    placeholder.style.setProperty('--tile-color', ELEMENT_CATEGORIES['actinide'].color);
                    placeholder.style.setProperty('--tile-glow', ELEMENT_CATEGORIES['actinide'].glow);
                    placeholder.innerHTML = `
                        <span class="tile-z" style="visibility:hidden">0</span>
                        <span class="tile-symbol" style="font-size:10px">89-103</span>
                        <span class="tile-name" style="font-size:6px">Actinides</span>
                    `;
                    placeholder.style.cursor = 'default';
                    grid.appendChild(placeholder);
                } else {
                    // Empty cell
                    const spacer = document.createElement('div');
                    grid.appendChild(spacer);
                }
            }
        });

        // Gap separator
        const separator = document.createElement('div');
        separator.className = 'la-ac-separator';
        grid.appendChild(separator);

        // F-block rows (lanthanides & actinides)
        fBlockRows.forEach(row => {
            const labels = { 8: 'La', 9: 'Ac' };
            // Label cell spanning cols 1-2
            const label = document.createElement('div');
            label.className = 'la-ac-label';
            label.style.gridColumn = '1 / 3';
            label.textContent = row === 8 ? 'Lanthanides' : 'Actinides';
            grid.appendChild(label);

            for (let col = 3; col <= 17; col++) {
                const el = slotMap[row] && slotMap[row][col];
                if (el) {
                    grid.appendChild(createTile(el));
                } else {
                    const spacer = document.createElement('div');
                    grid.appendChild(spacer);
                }
            }

            // Pad remaining col (18)
            const pad = document.createElement('div');
            grid.appendChild(pad);
        });
    }

    function createTile(el) {
        const cat = ELEMENT_CATEGORIES[el.category] || ELEMENT_CATEGORIES['unknown'];
        const canView = el.z <= MAX_VIEWABLE_Z;

        const tile = document.createElement('a');
        tile.className = 'element-tile';
        tile.dataset.z = el.z;
        tile.dataset.symbol = el.symbol;
        tile.dataset.name = el.name;
        tile.dataset.category = el.category;
        tile.style.setProperty('--tile-color', cat.color);
        tile.style.setProperty('--tile-glow', cat.glow);

        if (canView) {
            tile.href = `viewer.html?z=${el.z}`;
        }

        tile.innerHTML = `
            <span class="tile-z">${el.z}</span>
            <span class="tile-symbol">${el.symbol}</span>
            <span class="tile-name">${el.name}</span>
            <span class="tile-mass">${typeof el.mass === 'number' ? el.mass.toFixed(el.mass % 1 === 0 ? 0 : 2) : el.mass}</span>
        `;

        // Hover card
        tile.addEventListener('mouseenter', (e) => showHoverCard(el, e));
        tile.addEventListener('mousemove', (e) => moveHoverCard(e));
        tile.addEventListener('mouseleave', hideHoverCard);

        return tile;
    }

    // ─── Hover Card ───
    function showHoverCard(el, e) {
        const cat = ELEMENT_CATEGORIES[el.category] || ELEMENT_CATEGORIES['unknown'];
        const canView = el.z <= MAX_VIEWABLE_Z;

        document.getElementById('hc-symbol').textContent = el.symbol;
        document.getElementById('hc-symbol').style.color = cat.color;
        document.getElementById('hc-name').textContent = el.name;

        document.getElementById('hc-details').innerHTML = `
            Atomic Number: <strong>${el.z}</strong><br>
            Atomic Mass: <strong>${el.mass}</strong> u<br>
            Neutrons: <strong>${el.neutrons}</strong>
        `;

        const badge = document.getElementById('hc-badge');
        badge.textContent = cat.label;
        badge.style.background = cat.glow;
        badge.style.color = cat.color;

        const cta = document.getElementById('hc-cta');
        cta.textContent = canView ? 'Click to view 3D orbitals →' : 'Orbital view coming soon';
        cta.style.opacity = canView ? 1 : 0.4;

        hoverCard.classList.add('visible');
        moveHoverCard(e);
    }

    function moveHoverCard(e) {
        const pad = 20;
        let x = e.clientX + pad;
        let y = e.clientY - 20;

        // Keep card on screen
        const cardRect = hoverCard.getBoundingClientRect();
        if (x + cardRect.width > window.innerWidth - 10) {
            x = e.clientX - cardRect.width - pad;
        }
        if (y + cardRect.height > window.innerHeight - 10) {
            y = window.innerHeight - cardRect.height - 10;
        }
        if (y < 10) y = 10;

        hoverCard.style.left = x + 'px';
        hoverCard.style.top = y + 'px';
    }

    function hideHoverCard() {
        hoverCard.classList.remove('visible');
    }

    // ─── Search & Filtering ───
    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const tiles = document.querySelectorAll('.element-tile[data-z]');

        tiles.forEach(tile => {
            const z = parseInt(tile.dataset.z);
            const symbol = tile.dataset.symbol.toLowerCase();
            const name = tile.dataset.name.toLowerCase();
            const category = tile.dataset.category;

            let matchSearch = true;
            if (query) {
                matchSearch = symbol.includes(query) ||
                    name.includes(query) ||
                    z.toString() === query;
            }

            let matchCategory = true;
            if (activeCategory) {
                matchCategory = category === activeCategory;
            }

            if (matchSearch && matchCategory) {
                tile.classList.remove('dimmed');
            } else {
                tile.classList.add('dimmed');
            }
        });
    }

    searchInput.addEventListener('input', applyFilters);

    // Keyboard shortcut: '/' to focus search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.blur();
            activeCategory = null;
            document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('active'));
            document.querySelector('.legend-item').classList.add('active');
            applyFilters();
        }
    });

    // ─── Initialize ───
    buildLegend();
    buildGrid();
})();
