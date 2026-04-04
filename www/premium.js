// ChemVerse — Premium Aesthetic Engine
const ChemPremium = (function () {
    'use strict';

    let isActive = false;
    let particleCanvas, particleCtx, particles = [];
    let animFrame;

    // ─── Particle System ───
    class Particle {
        constructor(w, h) {
            this.reset(w, h);
            this.y = Math.random() * h; // start anywhere on init
        }
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = h + 10;
            this.speed = 0.2 + Math.random() * 0.8;
            this.radius = 1 + Math.random() * 2;
            this.opacity = 0.1 + Math.random() * 0.4;
            this.drift = (Math.random() - 0.5) * 0.3;
            // Color: mix of indigo, violet, pink
            const colors = [
                [99, 102, 241],  // indigo
                [139, 92, 246],  // violet
                [168, 85, 247],  // purple
                [236, 72, 153],  // pink
                [165, 180, 252], // light indigo
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update(w, h) {
            this.y -= this.speed;
            this.x += this.drift;
            if (this.y < -10) this.reset(w, h);
            if (this.x < -10 || this.x > w + 10) this.reset(w, h);
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particleCanvas = document.createElement('canvas');
        particleCanvas.id = 'premium-particles';
        document.body.prepend(particleCanvas);
        particleCtx = particleCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        if (!particleCanvas) return;
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        // Reinit particles
        const count = Math.floor((window.innerWidth * window.innerHeight) / 8000);
        particles = [];
        for (let i = 0; i < Math.min(count, 120); i++) {
            particles.push(new Particle(particleCanvas.width, particleCanvas.height));
        }
    }

    function animateParticles() {
        if (!isActive) return;
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        // Draw connection lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    particleCtx.beginPath();
                    particleCtx.moveTo(particles[i].x, particles[i].y);
                    particleCtx.lineTo(particles[j].x, particles[j].y);
                    const alpha = (1 - dist / 100) * 0.08;
                    particleCtx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
                    particleCtx.lineWidth = 0.5;
                    particleCtx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update(particleCanvas.width, particleCanvas.height);
            p.draw(particleCtx);
        });

        animFrame = requestAnimationFrame(animateParticles);
    }

    // ─── Floating Orbs ───
    function createOrbs() {
        if (document.querySelector('.floating-orb')) return;
        for (let i = 1; i <= 3; i++) {
            const orb = document.createElement('div');
            orb.className = `floating-orb orb-${i}`;
            document.body.appendChild(orb);
        }
    }

    function removeOrbs() {
        document.querySelectorAll('.floating-orb').forEach(o => o.remove());
    }

    // ─── Page Transition ───
    function createTransitionOverlay() {
        if (document.getElementById('page-transition')) return;
        const overlay = document.createElement('div');
        overlay.id = 'page-transition';
        document.body.appendChild(overlay);
    }

    function interceptLinks() {
        document.addEventListener('click', (e) => {
            if (!isActive) return;
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript')) return;

            e.preventDefault();
            const overlay = document.getElementById('page-transition');
            if (overlay) {
                overlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            } else {
                window.location.href = href;
            }
        });
    }

    // ─── Toggle Button ───
    function createToggle() {
        if (document.getElementById('premium-toggle')) return;
        const btn = document.createElement('button');
        btn.id = 'premium-toggle';
        btn.innerHTML = '<span class="toggle-icon">✨</span> Try Premium Design';
        btn.onclick = toggle;
        document.body.appendChild(btn);
    }

    // ─── Core Toggle ───
    function toggle() {
        isActive = !isActive;
        const btn = document.getElementById('premium-toggle');

        if (isActive) {
            document.body.classList.add('premium-mode');
            btn.classList.add('active');
            btn.innerHTML = '<span class="toggle-icon">✨</span> Premium Active';
            createOrbs();
            animateParticles();
            localStorage.setItem('chemverse-premium', '1');

            // Re-trigger card entrance animations
            document.querySelectorAll('.module-card, .info-card, .org-info-card, .crystal-btn, .mech-step').forEach(el => {
                el.style.animation = 'none';
                void el.offsetWidth; // force reflow
                el.style.animation = '';
            });
        } else {
            document.body.classList.remove('premium-mode');
            btn.classList.remove('active');
            btn.innerHTML = '<span class="toggle-icon">✨</span> Try Premium Design';
            removeOrbs();
            cancelAnimationFrame(animFrame);
            if (particleCtx) particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            localStorage.removeItem('chemverse-premium');
        }
    }

    // ─── Init ───
    function init() {
        // Inject CSS
        if (!document.querySelector('link[href*="premium.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'premium.css';
            document.head.appendChild(link);
        }

        initParticles();
        createTransitionOverlay();
        createToggle();
        interceptLinks();

        // Restore state
        if (localStorage.getItem('chemverse-premium') === '1') {
            // Small delay to let CSS load
            setTimeout(() => toggle(), 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { toggle, isActive: () => isActive };
})();
