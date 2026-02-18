// ─── Aufbau Filling Order ────────────────────────────────────────
// Subshells in order of increasing energy (Aufbau principle)
// Each entry: { n, l, label, maxElectrons }
// l values: 0=s, 1=p, 2=d, 3=f
export const SUBSHELL_LABELS = ['s', 'p', 'd', 'f'];

export const AUFBAU_ORDER = [
    { n: 1, l: 0 },
    { n: 2, l: 0 },
    { n: 2, l: 1 },
    { n: 3, l: 0 },
    { n: 3, l: 1 },
    { n: 4, l: 0 },
    { n: 3, l: 2 },
    { n: 4, l: 1 },
    { n: 5, l: 0 },
    { n: 4, l: 2 },
    { n: 5, l: 1 },
    { n: 6, l: 0 },
    { n: 4, l: 3 },
    { n: 5, l: 2 },
    { n: 6, l: 1 },
    { n: 7, l: 0 },
    { n: 5, l: 3 },
    { n: 6, l: 2 },
    { n: 7, l: 1 },
].map(s => ({
    ...s,
    label: `${s.n}${SUBSHELL_LABELS[s.l]}`,
    maxElectrons: 2 * (2 * s.l + 1),  // 2(2l+1)
}));

/**
 * Compute the electron configuration for a given atomic number Z.
 * Returns array of { n, l, label, maxElectrons, electrons }
 */
export function getElectronConfiguration(Z) {
    let remaining = Z;
    const config = [];
    for (const sub of AUFBAU_ORDER) {
        if (remaining <= 0) break;
        const e = Math.min(remaining, sub.maxElectrons);
        config.push({ ...sub, electrons: e });
        remaining -= e;
    }
    return config;
}

/**
 * Return the electron configuration string, e.g. "1s² 2s² 2p²"
 */
export function configToString(config) {
    const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return config.map(sub => {
        const sup = String(sub.electrons).split('').map(d => superscripts[+d]).join('');
        return `${sub.label}${sup}`;
    }).join(' ');
}
