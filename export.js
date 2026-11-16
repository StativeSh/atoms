// ChemVerse — Export & Share Utility
const ChemExport = (function () {
    'use strict';

    let isExporting = false;

    function init() {
        // Add the export button to the navigation actions
        const nav = document.querySelector('.top-nav');
        if (nav && !document.getElementById('export-btn')) {
            const btn = document.createElement('a');
            btn.href = '#';
            btn.id = 'export-btn';
            btn.className = 'export-btn';
            btn.setAttribute('aria-label', 'Export image');
            btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13h10"/></svg><span>Export image</span>';
            btn.onclick = (e) => {
                e.preventDefault();
                exportView();
            };
            const host = nav.querySelector('.nav-actions') || nav;
            host.insertBefore(btn, host.firstChild);
        }

        // Overlay shown while the capture runs (button styles live in ui.css)
        if (!document.getElementById('chem-export-css')) {
            const style = document.createElement('style');
            style.id = 'chem-export-css';
            style.textContent = `
                .exporting-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(251, 251, 253, 0.72);
                    -webkit-backdrop-filter: blur(8px);
                    backdrop-filter: blur(8px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1D1D1F;
                    font-family: 'Inter Tight', 'Inter', sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    opacity: 0;
                    pointer-events: none;
                }
                .exporting-overlay.show {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async function exportView() {
        if (isExporting) return;
        isExporting = true;

        // Show overlay
        const overlay = document.createElement('div');
        overlay.className = 'exporting-overlay';
        overlay.textContent = 'Capturing view…';
        document.body.appendChild(overlay);

        // Force reflow
        void overlay.offsetWidth;
        overlay.classList.add('show');

        try {
            // Ensure html2canvas is loaded
            if (typeof html2canvas === 'undefined') {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', {
                    integrity: 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H',
                    crossOrigin: 'anonymous'
                });
            }

            // Hide UI elements we don't want in export
            const explainToggle = document.getElementById('explain-toggle');
            if (explainToggle) explainToggle.style.display = 'none';

            // Target the main container
            const target = document.querySelector('body') || document.documentElement;

            // Wait for next frame
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(target, {
                backgroundColor: '#FBFBFD',
                scale: 2, // High-res
                logging: false,
                ignoreElements: (el) => {
                    return el.classList.contains('exporting-overlay') || el.classList.contains('export-btn');
                }
            });

            // Restore hidden elements
            if (explainToggle) explainToggle.style.display = '';

            // Download
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            const pageName = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chemverse_export';
            a.download = `${pageName}_${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed. See console for details.");
        } finally {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
            isExporting = false;
        }
    }

    function loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            if (options.integrity) s.integrity = options.integrity;
            if (options.crossOrigin) s.crossOrigin = options.crossOrigin;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { exportView, init };
})();
