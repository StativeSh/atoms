// ChemVerse — shared navigation (light UI). Injects a glass pill nav into .top-nav
(function () {
    'use strict';

    const GROUPS = [
        {
            name: 'Fundamentals', links: [
                ['periodic-table', 'Periodic Table'],
                ['viewer', 'Atomic Orbitals'],
                ['spectroscopy', 'Spectroscopy'],
            ]
        },
        {
            name: 'Build & React', links: [
                ['organic', 'Organic Builder'],
                ['mol3d', '3D Molecular Viewer'],
                ['reaction-lab', 'Reaction Lab'],
            ]
        },
        {
            name: 'Simulations', links: [
                ['titration', 'Titration Simulator'],
                ['electrochem', 'Electrochemistry'],
                ['mechanisms', 'Reaction Mechanisms'],
                ['crystal', 'Crystal Structures'],
            ]
        },
    ];

    const LOGO = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
        '<circle cx="16" cy="16" r="2.4" fill="currentColor" stroke="none"/>' +
        '<ellipse cx="16" cy="16" rx="13" ry="5.2"/>' +
        '<ellipse cx="16" cy="16" rx="13" ry="5.2" transform="rotate(60 16 16)"/>' +
        '<ellipse cx="16" cy="16" rx="13" ry="5.2" transform="rotate(120 16 16)"/></svg>';
    const CHEVRON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';

    function currentPage() {
        const p = window.location.pathname.split('/').pop().replace('.html', '');
        return p || 'index';
    }

    function build(topNav) {
        const page = currentPage();
        let pageName = '';
        const cols = GROUPS.map(g => {
            const links = g.links.map(([id, label]) => {
                const active = id === page;
                if (active) pageName = label;
                return '<a href="' + id + '.html"' + (active ? ' class="active" aria-current="page"' : '') + '>' + label + '</a>';
            }).join('');
            return '<div class="nav-col"><span class="kicker">' + g.name + '</span>' + links + '</div>';
        }).join('');

        topNav.setAttribute('aria-label', 'Primary');
        topNav.innerHTML =
            '<a class="brand" href="index.html">' + LOGO + 'ChemVerse</a>' +
            (pageName ? '<span class="page-name">' + pageName + '</span>' : '') +
            '<div class="nav-actions">' +
            '<div class="nav-menu">' +
            '<button class="nav-trigger" type="button" aria-haspopup="true" aria-expanded="false">Tools' + CHEVRON + '</button>' +
            '<div class="nav-panel glass">' + cols + '</div>' +
            '</div>' +
            '<a class="nav-solid" href="index.html">Home</a>' +
            '</div>';

        const menu = topNav.querySelector('.nav-menu');
        const trigger = topNav.querySelector('.nav-trigger');
        const setOpen = (open) => { menu.classList.toggle('open', open); menu.classList.toggle('suppress', !open && menu.matches(':hover')); trigger.setAttribute('aria-expanded', String(open)); };
        menu.addEventListener('mouseleave', () => menu.classList.remove('suppress'));
        trigger.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
        document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setOpen(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); trigger.focus(); } });
    }

    function init() {
        let topNav = document.querySelector('.top-nav');
        if (!topNav) {
            topNav = document.createElement('nav');
            topNav.className = 'top-nav';
            document.body.insertBefore(topNav, document.body.firstChild);
        }
        build(topNav);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
