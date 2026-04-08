/** Radial scale factor — target visual radius in scene units for the peak lobe */
export function radialScale(n) {
    return 2.5 + (n - 1) * 2.0;
}

/**
 * Generalized Laguerre polynomial L_p^k(x) for radial nodes.
 * Returns the polynomial value which goes through zero at radial nodes.
 * Number of radial nodes = n - l - 1.
 */
export function laguerreL(p, k, x) {
    if (p === 0) return 1;
    if (p === 1) return 1 + k - x;
    let lPrev2 = 1;
    let lPrev1 = 1 + k - x;
    for (let i = 2; i <= p; i++) {
        const lCurr = ((2 * i - 1 + k - x) * lPrev1 - (i - 1 + k) * lPrev2) / i;
        lPrev2 = lPrev1;
        lPrev1 = lCurr;
    }
    return lPrev1;
}

/**
 * Hydrogen-like radial probability density: r² |R_nl(r)|²
 * Includes realistic nodes from the associated Laguerre polynomial.
 * @param {number} n - principal quantum number
 * @param {number} l - angular momentum quantum number
 * @param {number} rho - scaled radius (2r / na₀)
 * @returns {number} unnormalized probability density
 */
export function radialProbability(n, l, rho) {
    const lagP = n - l - 1;  // order of Laguerre polynomial = number of radial nodes
    const lagK = 2 * l + 1;
    const L = laguerreL(lagP, lagK, rho);
    // R_nl ∝ rho^l * L * exp(-rho/2)
    const Rnl = Math.pow(rho, l) * L * Math.exp(-rho / 2);
    // Probability ∝ r² |R|² ∝ rho² |R|² (since r = rho * na₀/2)
    return rho * rho * Rnl * Rnl;
}

/**
 * Sample a radial distance from the hydrogen-like radial distribution.
 * Uses rejection sampling with radial nodes properly included.
 */
export function sampleRadius(n, l) {
    const R = radialScale(n);
    // rhoMax: tight upper bound — cut the tail for compact shapes
    const rhoMax = 3 * n + 4;

    // Find approximate maximum of the probability for rejection sampling
    let probMax = 0;
    for (let i = 0; i <= 200; i++) {
        const rho = (i / 200) * rhoMax;
        const p = radialProbability(n, l, rho);
        if (p > probMax) probMax = p;
    }
    probMax *= 1.05; // safety margin

    // Rejection sampling — return both radius and density
    let rho;
    for (let attempt = 0; attempt < 500; attempt++) {
        rho = Math.random() * rhoMax;
        const prob = radialProbability(n, l, rho);
        if (Math.random() * probMax < prob) {
            // Convert rho to scene units
            const r_scene = rho * R / (2 * n);
            // Return normalized radial density (0–1)
            const radialDensity = prob / probMax;
            return { r: r_scene, radialDensity };
        }
    }
    // Fallback
    return { r: R * 0.5, radialDensity: 0.3 };
}
