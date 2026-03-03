// ChemVerse — Export & Share Utility
const ChemExport = (function () {
    'use strict';

    let isExporting = false;

    function init() {
        // Add Export button to the navbar
        const nav = document.querySelector('.top-nav');
        if (nav && !document.getElementById('export-btn')) {
            const btn = document.createElement('a');
            btn.href = '#';
            btn.id = 'export-btn';
            btn.className = 'export-btn';
            btn.innerHTML = '📸 Export Image';
            btn.onclick = (e) => {
                e.preventDefault();
                exportView();
            };
            nav.appendChild(btn);
        }

        // Add CSS for export button and overlay
        if (!document.getElementById('chem-export-css')) {
            const style = document.createElement('style');
            style.id = 'chem-export-css';
            style.textContent = `
                .export-btn {
                    margin-left: auto;
                    color: #fff !important;
                    background: #4f46e5;
                    padding: 6px 12px !important;
                    border-radius: 6px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
                }
                .export-btn:hover {
                    background: #4338ca;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.6);
                }
                .exporting-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 15, 30, 0.8);
                    backdrop-filter: blur(4px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }
                .exporting-overlay.show {
                    opacity: 1;
                }
                .exporting-overlay span {
                    display: inline-block;
                    animation: pulse-dot 1.4s infinite ease-in-out both;
                }
                .exporting-overlay span:nth-child(1) { animation-delay: -0.32s; }
                .exporting-overlay span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes pulse-dot {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
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
        overlay.innerHTML = 'Capturing View<span>.</span><span>.</span><span>.</span>';
        document.body.appendChild(overlay);

        // Force reflow
        void overlay.offsetWidth;
        overlay.classList.add('show');

        try {
            // Ensure html2canvas is loaded
            if (typeof html2canvas === 'undefined') {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }

            // Hide UI elements we don't want in export
            const explainToggle = document.getElementById('explain-toggle');
            if (explainToggle) explainToggle.style.display = 'none';

            // Target the main container
            const target = document.querySelector('body') || document.documentElement;

            // Wait for next frame
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(target, {
                backgroundColor: '#0a0a0a',
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

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
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
