export const ELEMENTS = {};
export const ELEMENT_LIST = [
    { z: 1, symbol: 'H', name: 'Hydrogen', neutrons: 0 },
    { z: 2, symbol: 'He', name: 'Helium', neutrons: 2 },
    { z: 3, symbol: 'Li', name: 'Lithium', neutrons: 4 },
    { z: 4, symbol: 'Be', name: 'Beryllium', neutrons: 5 },
    { z: 5, symbol: 'B', name: 'Boron', neutrons: 6 },
    { z: 6, symbol: 'C', name: 'Carbon', neutrons: 6 },
    { z: 7, symbol: 'N', name: 'Nitrogen', neutrons: 7 },
    { z: 8, symbol: 'O', name: 'Oxygen', neutrons: 8 },
    { z: 9, symbol: 'F', name: 'Fluorine', neutrons: 10 },
    { z: 10, symbol: 'Ne', name: 'Neon', neutrons: 10 },
    { z: 11, symbol: 'Na', name: 'Sodium', neutrons: 12 },
    { z: 12, symbol: 'Mg', name: 'Magnesium', neutrons: 12 },
    { z: 13, symbol: 'Al', name: 'Aluminum', neutrons: 14 },
    { z: 14, symbol: 'Si', name: 'Silicon', neutrons: 14 },
    { z: 15, symbol: 'P', name: 'Phosphorus', neutrons: 16 },
    { z: 16, symbol: 'S', name: 'Sulfur', neutrons: 16 },
    { z: 17, symbol: 'Cl', name: 'Chlorine', neutrons: 18 },
    { z: 18, symbol: 'Ar', name: 'Argon', neutrons: 22 },
    { z: 19, symbol: 'K', name: 'Potassium', neutrons: 20 },
    { z: 20, symbol: 'Ca', name: 'Calcium', neutrons: 20 },
    { z: 21, symbol: 'Sc', name: 'Scandium', neutrons: 24 },
    { z: 22, symbol: 'Ti', name: 'Titanium', neutrons: 26 },
    { z: 23, symbol: 'V', name: 'Vanadium', neutrons: 28 },
    { z: 24, symbol: 'Cr', name: 'Chromium', neutrons: 28 },
    { z: 25, symbol: 'Mn', name: 'Manganese', neutrons: 30 },
    { z: 26, symbol: 'Fe', name: 'Iron', neutrons: 30 },
    { z: 27, symbol: 'Co', name: 'Cobalt', neutrons: 32 },
    { z: 28, symbol: 'Ni', name: 'Nickel', neutrons: 31 },
    { z: 29, symbol: 'Cu', name: 'Copper', neutrons: 35 },
    { z: 30, symbol: 'Zn', name: 'Zinc', neutrons: 35 },
    { z: 31, symbol: 'Ga', name: 'Gallium', neutrons: 39 },
    { z: 32, symbol: 'Ge', name: 'Germanium', neutrons: 41 },
    { z: 33, symbol: 'As', name: 'Arsenic', neutrons: 42 },
    { z: 34, symbol: 'Se', name: 'Selenium', neutrons: 45 },
    { z: 35, symbol: 'Br', name: 'Bromine', neutrons: 45 },
    { z: 36, symbol: 'Kr', name: 'Krypton', neutrons: 48 },
];
ELEMENT_LIST.forEach(el => { ELEMENTS[el.z] = el; });

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
