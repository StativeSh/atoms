// ChemVerse — Explain Mode Utility
const ChemExplain = (function () {
    'use strict';

    let isActive = false;
    let tooltipEl = null;
    let toggleBtn = null;
    const items = new Map(); // element -> { title, content }

    function init() {
        if (document.getElementById('explain-toggle')) return;

        // Inject CSS if not present
        if (!document.querySelector('link[href*="explain.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'explain.css';
            document.head.appendChild(link);
        }

        // Create toggle button
        toggleBtn = document.createElement('div');
        toggleBtn.id = 'explain-toggle';
        toggleBtn.className = 'explain-toggle';
        toggleBtn.innerHTML = '💡';
        toggleBtn.title = 'Toggle Explain Mode';
        document.body.appendChild(toggleBtn);

        // Create tooltip element
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chem-tooltip';
        tooltipEl.className = 'chem-tooltip';
        document.body.appendChild(tooltipEl);

        // Bind events
        toggleBtn.addEventListener('click', toggle);

        // Setup global mouse move to track hover over explainable elements
        document.addEventListener('mousemove', handleMouseMove);
    }

    function toggle() {
        isActive = !isActive;
        if (isActive) {
            toggleBtn.classList.add('active');
            document.body.classList.add('explain-mode-active');
        } else {
            toggleBtn.classList.remove('active');
            document.body.classList.remove('explain-mode-active');
            hideTooltip();
        }
    }

    function register(selectorOrEl, title, content) {
        const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
        if (!el) return;

        el.classList.add('explainable');
        items.set(el, { title, content });
    }

    function handleMouseMove(e) {
        if (!isActive) return;

        // Check if hovering an explainable element
        let target = e.target;
        let found = null;

        while (target && target !== document.body) {
            if (items.has(target)) {
                found = target;
                break;
            }
            target = target.parentElement;
        }

        if (found) {
            showTooltip(found, e.clientX, e.clientY);
        } else {
            hideTooltip();
        }
    }

    function showTooltip(el, x, y) {
        const data = items.get(el);
        if (!data) return;

        tooltipEl.innerHTML = `<h4>💡 ${data.title}</h4>${data.content}`;

        // Positioning
        const pad = +15;
        let top = y + pad;
        let left = x + pad;

        // Prevent off-screen
        tooltipEl.classList.add('visible'); // make block to measure
        const rect = tooltipEl.getBoundingClientRect();

        if (left + rect.width > window.innerWidth) {
            left = x - rect.width - pad;
        }
        if (top + rect.height > window.innerHeight) {
            top = y - rect.height - pad;
        }

        tooltipEl.style.transform = `translate(${left}px, ${top}px)`;
    }

    function hideTooltip() {
        tooltipEl.classList.remove('visible');
    }

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { register, toggle, init };
})();
