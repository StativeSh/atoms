// ChemVerse — Navigation Overhaul
(function () {
    'use strict';

    const navContent = `
        <a href="index.html" class="logo" style="text-decoration:none;color:inherit;">⚛️ CHEMVERSE</a>
        
        <div class="dropdown">
            <button class="dropbtn">📚 Fundamentals ▾</button>
            <div class="dropdown-content">
                <a href="periodic-table.html" data-page="periodic-table">🧪 Periodic Table</a>
                <a href="spectroscopy.html" data-page="spectroscopy">📊 Spectroscopy</a>
            </div>
        </div>

        <div class="dropdown">
            <button class="dropbtn">🏗 Build & React ▾</button>
            <div class="dropdown-content">
                <a href="organic.html" data-page="organic">⚗️ Organic Builder</a>
                <a href="reaction-lab.html" data-page="reaction-lab">⚡️ Reaction Lab</a>
            </div>
        </div>

        <div class="dropdown">
            <button class="dropbtn">🔬 Simulations ▾</button>
            <div class="dropdown-content">
                <a href="titration.html" data-page="titration">⚗️ Titration</a>
                <a href="electrochem.html" data-page="electrochem">🔋 Electrochemistry</a>
                <a href="mechanisms.html" data-page="mechanisms">🧬 Mechanisms</a>
                <a href="crystal.html" data-page="crystal">💎 Crystals</a>
            </div>
        </div>
    `;

    function initNav() {
        const topNav = document.querySelector('.top-nav');
        if (!topNav) return;

        // Save export button if it was already injected
        const exportBtn = document.getElementById('export-btn');

        // Replace content
        topNav.innerHTML = navContent;

        // Restore export button
        if (exportBtn) {
            topNav.appendChild(exportBtn);
        }

        // Highlight active link
        let currentPath = window.location.pathname.split('/').pop().replace('.html', '');
        if (!currentPath || currentPath === '') currentPath = 'index';

        const links = topNav.querySelectorAll('.dropdown-content a');
        links.forEach(link => {
            if (link.dataset.page === currentPath) {
                link.classList.add('active');
                const parentBtn = link.closest('.dropdown').querySelector('.dropbtn');
                if (parentBtn) parentBtn.classList.add('active');
            }
        });
    }

    // Inject CSS
    function injectCSS() {
        if (!document.querySelector('link[href*="nav.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'nav.css';
            document.head.appendChild(link);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectCSS();
            initNav();
        });
    } else {
        injectCSS();
        initNav();
    }
})();
