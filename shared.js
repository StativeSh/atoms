// ============================================
//  ChemVerse — Shared Element Data & Utilities
//  All 118 elements with periodic table positions
// ============================================

const ELEMENT_CATEGORIES = {
    'alkali-metal': { label: 'Alkali Metal', color: '#ff6b6b', glow: 'rgba(255,107,107,0.3)' },
    'alkaline-earth': { label: 'Alkaline Earth', color: '#ffa94d', glow: 'rgba(255,169,77,0.3)' },
    'transition-metal': { label: 'Transition Metal', color: '#4dabf7', glow: 'rgba(77,171,247,0.3)' },
    'post-transition': { label: 'Post-Transition', color: '#69db7c', glow: 'rgba(105,219,124,0.3)' },
    'metalloid': { label: 'Metalloid', color: '#845ef7', glow: 'rgba(132,94,247,0.3)' },
    'nonmetal': { label: 'Reactive Nonmetal', color: '#ffd43b', glow: 'rgba(255,212,59,0.3)' },
    'halogen': { label: 'Halogen', color: '#38d9a9', glow: 'rgba(56,217,169,0.3)' },
    'noble-gas': { label: 'Noble Gas', color: '#74c0fc', glow: 'rgba(116,192,252,0.3)' },
    'lanthanide': { label: 'Lanthanide', color: '#f783ac', glow: 'rgba(247,131,172,0.3)' },
    'actinide': { label: 'Actinide', color: '#da77f2', glow: 'rgba(218,119,242,0.3)' },
    'unknown': { label: 'Unknown', color: '#868e96', glow: 'rgba(134,142,150,0.3)' },
};

// Full 118-element dataset
// row/col = periodic table grid position (1-indexed)
// row 8/9 = lanthanide/actinide rows displayed separately
const ALL_ELEMENTS = [
    // ─── Period 1 ───
    { z: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', row: 1, col: 1, neutrons: 0 },
    { z: 2, symbol: 'He', name: 'Helium', mass: 4.003, category: 'noble-gas', row: 1, col: 18, neutrons: 2 },
    // ─── Period 2 ───
    { z: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, category: 'alkali-metal', row: 2, col: 1, neutrons: 4 },
    { z: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, category: 'alkaline-earth', row: 2, col: 2, neutrons: 5 },
    { z: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', row: 2, col: 13, neutrons: 6 },
    { z: 6, symbol: 'C', name: 'Carbon', mass: 12.01, category: 'nonmetal', row: 2, col: 14, neutrons: 6 },
    { z: 7, symbol: 'N', name: 'Nitrogen', mass: 14.01, category: 'nonmetal', row: 2, col: 15, neutrons: 7 },
    { z: 8, symbol: 'O', name: 'Oxygen', mass: 16.00, category: 'nonmetal', row: 2, col: 16, neutrons: 8 },
    { z: 9, symbol: 'F', name: 'Fluorine', mass: 19.00, category: 'halogen', row: 2, col: 17, neutrons: 10 },
    { z: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, category: 'noble-gas', row: 2, col: 18, neutrons: 10 },
    // ─── Period 3 ───
    { z: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, category: 'alkali-metal', row: 3, col: 1, neutrons: 12 },
    { z: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.31, category: 'alkaline-earth', row: 3, col: 2, neutrons: 12 },
    { z: 13, symbol: 'Al', name: 'Aluminium', mass: 26.98, category: 'post-transition', row: 3, col: 13, neutrons: 14 },
    { z: 14, symbol: 'Si', name: 'Silicon', mass: 28.09, category: 'metalloid', row: 3, col: 14, neutrons: 14 },
    { z: 15, symbol: 'P', name: 'Phosphorus', mass: 30.97, category: 'nonmetal', row: 3, col: 15, neutrons: 16 },
    { z: 16, symbol: 'S', name: 'Sulfur', mass: 32.07, category: 'nonmetal', row: 3, col: 16, neutrons: 16 },
    { z: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', row: 3, col: 17, neutrons: 18 },
    { z: 18, symbol: 'Ar', name: 'Argon', mass: 39.95, category: 'noble-gas', row: 3, col: 18, neutrons: 22 },
    // ─── Period 4 ───
    { z: 19, symbol: 'K', name: 'Potassium', mass: 39.10, category: 'alkali-metal', row: 4, col: 1, neutrons: 20 },
    { z: 20, symbol: 'Ca', name: 'Calcium', mass: 40.08, category: 'alkaline-earth', row: 4, col: 2, neutrons: 20 },
    { z: 21, symbol: 'Sc', name: 'Scandium', mass: 44.96, category: 'transition-metal', row: 4, col: 3, neutrons: 24 },
    { z: 22, symbol: 'Ti', name: 'Titanium', mass: 47.87, category: 'transition-metal', row: 4, col: 4, neutrons: 26 },
    { z: 23, symbol: 'V', name: 'Vanadium', mass: 50.94, category: 'transition-metal', row: 4, col: 5, neutrons: 28 },
    { z: 24, symbol: 'Cr', name: 'Chromium', mass: 52.00, category: 'transition-metal', row: 4, col: 6, neutrons: 28 },
    { z: 25, symbol: 'Mn', name: 'Manganese', mass: 54.94, category: 'transition-metal', row: 4, col: 7, neutrons: 30 },
    { z: 26, symbol: 'Fe', name: 'Iron', mass: 55.85, category: 'transition-metal', row: 4, col: 8, neutrons: 30 },
    { z: 27, symbol: 'Co', name: 'Cobalt', mass: 58.93, category: 'transition-metal', row: 4, col: 9, neutrons: 32 },
    { z: 28, symbol: 'Ni', name: 'Nickel', mass: 58.69, category: 'transition-metal', row: 4, col: 10, neutrons: 31 },
    { z: 29, symbol: 'Cu', name: 'Copper', mass: 63.55, category: 'transition-metal', row: 4, col: 11, neutrons: 35 },
    { z: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition-metal', row: 4, col: 12, neutrons: 35 },
    { z: 31, symbol: 'Ga', name: 'Gallium', mass: 69.72, category: 'post-transition', row: 4, col: 13, neutrons: 39 },
    { z: 32, symbol: 'Ge', name: 'Germanium', mass: 72.63, category: 'metalloid', row: 4, col: 14, neutrons: 41 },
    { z: 33, symbol: 'As', name: 'Arsenic', mass: 74.92, category: 'metalloid', row: 4, col: 15, neutrons: 42 },
    { z: 34, symbol: 'Se', name: 'Selenium', mass: 78.97, category: 'nonmetal', row: 4, col: 16, neutrons: 45 },
    { z: 35, symbol: 'Br', name: 'Bromine', mass: 79.90, category: 'halogen', row: 4, col: 17, neutrons: 45 },
    { z: 36, symbol: 'Kr', name: 'Krypton', mass: 83.80, category: 'noble-gas', row: 4, col: 18, neutrons: 48 },
    // ─── Period 5 ───
    { z: 37, symbol: 'Rb', name: 'Rubidium', mass: 85.47, category: 'alkali-metal', row: 5, col: 1, neutrons: 48 },
    { z: 38, symbol: 'Sr', name: 'Strontium', mass: 87.62, category: 'alkaline-earth', row: 5, col: 2, neutrons: 50 },
    { z: 39, symbol: 'Y', name: 'Yttrium', mass: 88.91, category: 'transition-metal', row: 5, col: 3, neutrons: 50 },
    { z: 40, symbol: 'Zr', name: 'Zirconium', mass: 91.22, category: 'transition-metal', row: 5, col: 4, neutrons: 51 },
    { z: 41, symbol: 'Nb', name: 'Niobium', mass: 92.91, category: 'transition-metal', row: 5, col: 5, neutrons: 52 },
    { z: 42, symbol: 'Mo', name: 'Molybdenum', mass: 95.95, category: 'transition-metal', row: 5, col: 6, neutrons: 54 },
    { z: 43, symbol: 'Tc', name: 'Technetium', mass: 98, category: 'transition-metal', row: 5, col: 7, neutrons: 55 },
    { z: 44, symbol: 'Ru', name: 'Ruthenium', mass: 101.07, category: 'transition-metal', row: 5, col: 8, neutrons: 57 },
    { z: 45, symbol: 'Rh', name: 'Rhodium', mass: 102.91, category: 'transition-metal', row: 5, col: 9, neutrons: 58 },
    { z: 46, symbol: 'Pd', name: 'Palladium', mass: 106.42, category: 'transition-metal', row: 5, col: 10, neutrons: 60 },
    { z: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition-metal', row: 5, col: 11, neutrons: 61 },
    { z: 48, symbol: 'Cd', name: 'Cadmium', mass: 112.41, category: 'transition-metal', row: 5, col: 12, neutrons: 64 },
    { z: 49, symbol: 'In', name: 'Indium', mass: 114.82, category: 'post-transition', row: 5, col: 13, neutrons: 66 },
    { z: 50, symbol: 'Sn', name: 'Tin', mass: 118.71, category: 'post-transition', row: 5, col: 14, neutrons: 69 },
    { z: 51, symbol: 'Sb', name: 'Antimony', mass: 121.76, category: 'metalloid', row: 5, col: 15, neutrons: 71 },
    { z: 52, symbol: 'Te', name: 'Tellurium', mass: 127.60, category: 'metalloid', row: 5, col: 16, neutrons: 76 },
    { z: 53, symbol: 'I', name: 'Iodine', mass: 126.90, category: 'halogen', row: 5, col: 17, neutrons: 74 },
    { z: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, category: 'noble-gas', row: 5, col: 18, neutrons: 77 },
    // ─── Period 6 ───
    { z: 55, symbol: 'Cs', name: 'Caesium', mass: 132.91, category: 'alkali-metal', row: 6, col: 1, neutrons: 78 },
    { z: 56, symbol: 'Ba', name: 'Barium', mass: 137.33, category: 'alkaline-earth', row: 6, col: 2, neutrons: 81 },
    // Lanthanides (row 8 = separate display row)
    { z: 57, symbol: 'La', name: 'Lanthanum', mass: 138.91, category: 'lanthanide', row: 8, col: 3, neutrons: 82 },
    { z: 58, symbol: 'Ce', name: 'Cerium', mass: 140.12, category: 'lanthanide', row: 8, col: 4, neutrons: 82 },
    { z: 59, symbol: 'Pr', name: 'Praseodymium', mass: 140.91, category: 'lanthanide', row: 8, col: 5, neutrons: 82 },
    { z: 60, symbol: 'Nd', name: 'Neodymium', mass: 144.24, category: 'lanthanide', row: 8, col: 6, neutrons: 84 },
    { z: 61, symbol: 'Pm', name: 'Promethium', mass: 145, category: 'lanthanide', row: 8, col: 7, neutrons: 84 },
    { z: 62, symbol: 'Sm', name: 'Samarium', mass: 150.36, category: 'lanthanide', row: 8, col: 8, neutrons: 88 },
    { z: 63, symbol: 'Eu', name: 'Europium', mass: 151.96, category: 'lanthanide', row: 8, col: 9, neutrons: 89 },
    { z: 64, symbol: 'Gd', name: 'Gadolinium', mass: 157.25, category: 'lanthanide', row: 8, col: 10, neutrons: 93 },
    { z: 65, symbol: 'Tb', name: 'Terbium', mass: 158.93, category: 'lanthanide', row: 8, col: 11, neutrons: 94 },
    { z: 66, symbol: 'Dy', name: 'Dysprosium', mass: 162.50, category: 'lanthanide', row: 8, col: 12, neutrons: 97 },
    { z: 67, symbol: 'Ho', name: 'Holmium', mass: 164.93, category: 'lanthanide', row: 8, col: 13, neutrons: 98 },
    { z: 68, symbol: 'Er', name: 'Erbium', mass: 167.26, category: 'lanthanide', row: 8, col: 14, neutrons: 99 },
    { z: 69, symbol: 'Tm', name: 'Thulium', mass: 168.93, category: 'lanthanide', row: 8, col: 15, neutrons: 100 },
    { z: 70, symbol: 'Yb', name: 'Ytterbium', mass: 173.05, category: 'lanthanide', row: 8, col: 16, neutrons: 103 },
    { z: 71, symbol: 'Lu', name: 'Lutetium', mass: 174.97, category: 'lanthanide', row: 8, col: 17, neutrons: 104 },
    // Back to Period 6
    { z: 72, symbol: 'Hf', name: 'Hafnium', mass: 178.49, category: 'transition-metal', row: 6, col: 4, neutrons: 106 },
    { z: 73, symbol: 'Ta', name: 'Tantalum', mass: 180.95, category: 'transition-metal', row: 6, col: 5, neutrons: 108 },
    { z: 74, symbol: 'W', name: 'Tungsten', mass: 183.84, category: 'transition-metal', row: 6, col: 6, neutrons: 110 },
    { z: 75, symbol: 'Re', name: 'Rhenium', mass: 186.21, category: 'transition-metal', row: 6, col: 7, neutrons: 111 },
    { z: 76, symbol: 'Os', name: 'Osmium', mass: 190.23, category: 'transition-metal', row: 6, col: 8, neutrons: 114 },
    { z: 77, symbol: 'Ir', name: 'Iridium', mass: 192.22, category: 'transition-metal', row: 6, col: 9, neutrons: 115 },
    { z: 78, symbol: 'Pt', name: 'Platinum', mass: 195.08, category: 'transition-metal', row: 6, col: 10, neutrons: 117 },
    { z: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition-metal', row: 6, col: 11, neutrons: 118 },
    { z: 80, symbol: 'Hg', name: 'Mercury', mass: 200.59, category: 'transition-metal', row: 6, col: 12, neutrons: 121 },
    { z: 81, symbol: 'Tl', name: 'Thallium', mass: 204.38, category: 'post-transition', row: 6, col: 13, neutrons: 123 },
    { z: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'post-transition', row: 6, col: 14, neutrons: 125 },
    { z: 83, symbol: 'Bi', name: 'Bismuth', mass: 208.98, category: 'post-transition', row: 6, col: 15, neutrons: 126 },
    { z: 84, symbol: 'Po', name: 'Polonium', mass: 209, category: 'post-transition', row: 6, col: 16, neutrons: 125 },
    { z: 85, symbol: 'At', name: 'Astatine', mass: 210, category: 'halogen', row: 6, col: 17, neutrons: 125 },
    { z: 86, symbol: 'Rn', name: 'Radon', mass: 222, category: 'noble-gas', row: 6, col: 18, neutrons: 136 },
    // ─── Period 7 ───
    { z: 87, symbol: 'Fr', name: 'Francium', mass: 223, category: 'alkali-metal', row: 7, col: 1, neutrons: 136 },
    { z: 88, symbol: 'Ra', name: 'Radium', mass: 226, category: 'alkaline-earth', row: 7, col: 2, neutrons: 138 },
    // Actinides (row 9 = separate display row)
    { z: 89, symbol: 'Ac', name: 'Actinium', mass: 227, category: 'actinide', row: 9, col: 3, neutrons: 138 },
    { z: 90, symbol: 'Th', name: 'Thorium', mass: 232.04, category: 'actinide', row: 9, col: 4, neutrons: 142 },
    { z: 91, symbol: 'Pa', name: 'Protactinium', mass: 231.04, category: 'actinide', row: 9, col: 5, neutrons: 140 },
    { z: 92, symbol: 'U', name: 'Uranium', mass: 238.03, category: 'actinide', row: 9, col: 6, neutrons: 146 },
    { z: 93, symbol: 'Np', name: 'Neptunium', mass: 237, category: 'actinide', row: 9, col: 7, neutrons: 144 },
    { z: 94, symbol: 'Pu', name: 'Plutonium', mass: 244, category: 'actinide', row: 9, col: 8, neutrons: 150 },
    { z: 95, symbol: 'Am', name: 'Americium', mass: 243, category: 'actinide', row: 9, col: 9, neutrons: 148 },
    { z: 96, symbol: 'Cm', name: 'Curium', mass: 247, category: 'actinide', row: 9, col: 10, neutrons: 151 },
    { z: 97, symbol: 'Bk', name: 'Berkelium', mass: 247, category: 'actinide', row: 9, col: 11, neutrons: 150 },
    { z: 98, symbol: 'Cf', name: 'Californium', mass: 251, category: 'actinide', row: 9, col: 12, neutrons: 153 },
    { z: 99, symbol: 'Es', name: 'Einsteinium', mass: 252, category: 'actinide', row: 9, col: 13, neutrons: 153 },
    { z: 100, symbol: 'Fm', name: 'Fermium', mass: 257, category: 'actinide', row: 9, col: 14, neutrons: 157 },
    { z: 101, symbol: 'Md', name: 'Mendelevium', mass: 258, category: 'actinide', row: 9, col: 15, neutrons: 157 },
    { z: 102, symbol: 'No', name: 'Nobelium', mass: 259, category: 'actinide', row: 9, col: 16, neutrons: 157 },
    { z: 103, symbol: 'Lr', name: 'Lawrencium', mass: 266, category: 'actinide', row: 9, col: 17, neutrons: 163 },
    // Back to Period 7
    { z: 104, symbol: 'Rf', name: 'Rutherfordium', mass: 267, category: 'transition-metal', row: 7, col: 4, neutrons: 163 },
    { z: 105, symbol: 'Db', name: 'Dubnium', mass: 268, category: 'transition-metal', row: 7, col: 5, neutrons: 163 },
    { z: 106, symbol: 'Sg', name: 'Seaborgium', mass: 269, category: 'transition-metal', row: 7, col: 6, neutrons: 163 },
    { z: 107, symbol: 'Bh', name: 'Bohrium', mass: 270, category: 'transition-metal', row: 7, col: 7, neutrons: 163 },
    { z: 108, symbol: 'Hs', name: 'Hassium', mass: 277, category: 'transition-metal', row: 7, col: 8, neutrons: 169 },
    { z: 109, symbol: 'Mt', name: 'Meitnerium', mass: 278, category: 'transition-metal', row: 7, col: 9, neutrons: 169 },
    { z: 110, symbol: 'Ds', name: 'Darmstadtium', mass: 281, category: 'transition-metal', row: 7, col: 10, neutrons: 171 },
    { z: 111, symbol: 'Rg', name: 'Roentgenium', mass: 282, category: 'transition-metal', row: 7, col: 11, neutrons: 171 },
    { z: 112, symbol: 'Cn', name: 'Copernicium', mass: 285, category: 'transition-metal', row: 7, col: 12, neutrons: 173 },
    { z: 113, symbol: 'Nh', name: 'Nihonium', mass: 286, category: 'post-transition', row: 7, col: 13, neutrons: 173 },
    { z: 114, symbol: 'Fl', name: 'Flerovium', mass: 289, category: 'post-transition', row: 7, col: 14, neutrons: 175 },
    { z: 115, symbol: 'Mc', name: 'Moscovium', mass: 290, category: 'post-transition', row: 7, col: 15, neutrons: 175 },
    { z: 116, symbol: 'Lv', name: 'Livermorium', mass: 293, category: 'post-transition', row: 7, col: 16, neutrons: 177 },
    { z: 117, symbol: 'Ts', name: 'Tennessine', mass: 294, category: 'halogen', row: 7, col: 17, neutrons: 177 },
    { z: 118, symbol: 'Og', name: 'Oganesson', mass: 294, category: 'noble-gas', row: 7, col: 18, neutrons: 176 },
];

// Build lookup by Z
const ELEMENTS_BY_Z = {};
ALL_ELEMENTS.forEach(el => { ELEMENTS_BY_Z[el.z] = el; });

// All 118 elements are now viewable in the orbital viewer
const MAX_VIEWABLE_Z = 118;

// ═══════════════════════════════════════════════════════════════════
// CHEMISTRY DATA FOR REACTION LAB v3
// Sources: Pauling "Nature of the Chemical Bond", Heitler-London,
//          Mulliken, Frenking 2019, Altmann, Woodward-Hoffmann
// ═══════════════════════════════════════════════════════════════════

// Pauling Electronegativity (EN) — Chapter 3-6, Table 3-7
const ELECTRONEGATIVITY = {
    1: 2.20, 3: 0.98, 4: 1.57, 5: 2.04, 6: 2.55, 7: 3.04, 8: 3.44,
    9: 3.98, 11: 0.93, 12: 1.31, 13: 1.61, 14: 1.90, 15: 2.19, 16: 2.58,
    17: 3.16, 19: 0.82, 20: 1.00, 26: 1.83, 29: 1.90, 30: 1.65,
    35: 2.96, 53: 2.66
};

// Pauling Covalent Radii (Å) — Chapter 7, Table 7-2/7-3
const COVALENT_RADII = {
    1: 0.30, 3: 1.34, 4: 0.90, 5: 0.82, 6: 0.77, 7: 0.70, 8: 0.66,
    9: 0.64, 11: 1.54, 12: 1.30, 13: 1.18, 14: 1.11, 15: 1.06, 16: 1.02,
    17: 0.99, 19: 1.96, 20: 1.74, 26: 1.17, 29: 1.17, 30: 1.25,
    35: 1.14, 53: 1.33
};

// Pauling Bond Dissociation Energies (kcal/mol) — Table 3-4
// Keys: "Z1-Z2-order" where order is bond multiplicity
const BOND_ENERGIES = {
    '1-1-1': 104.2,   // H-H
    '6-6-1': 83.1,    // C-C
    '6-6-2': 146,     // C=C
    '6-6-3': 200,     // C≡C
    '6-1-1': 98.8,    // C-H
    '6-8-1': 84,      // C-O
    '6-8-2': 192,     // C=O (as in CO₂)
    '6-7-1': 73,      // C-N
    '6-7-2': 147,     // C=N
    '6-7-3': 213,     // C≡N
    '6-17-1': 78.5,   // C-Cl
    '6-9-1': 116,     // C-F
    '6-16-1': 65,     // C-S
    '7-7-1': 38.4,    // N-N
    '7-7-2': 100,     // N=N
    '7-7-3': 226,     // N≡N
    '7-1-1': 93.4,    // N-H
    '7-8-1': 48,      // N-O
    '8-8-1': 33.2,    // O-O
    '8-8-2': 119.1,   // O=O
    '8-1-1': 110.6,   // O-H
    '9-1-1': 134.6,   // F-H
    '9-9-1': 36.6,    // F-F
    '17-17-1': 58.0,  // Cl-Cl
    '17-1-1': 103.2,  // Cl-H
    '35-35-1': 46.1,  // Br-Br
    '35-1-1': 87.5,   // Br-H
    '11-17-1': 98,    // Na-Cl (ionic)
    '11-9-1': 114,    // Na-F
    '12-8-1': 92,     // Mg-O
    '20-8-1': 110,    // Ca-O
    '26-8-1': 82,     // Fe-O
    '15-1-1': 77,     // P-H
    '16-1-1': 81,     // S-H
    '16-8-1': 54,     // S-O
    '16-8-2': 128,    // S=O
};

// Element bonding properties
const ELEMENT_PROPERTIES = {
    1: { valence: 1, maxBonds: 1, electronsNeeded: 1, isMetal: false, lonePairs: 0 },
    3: { valence: 1, maxBonds: 1, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    4: { valence: 2, maxBonds: 2, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    5: { valence: 3, maxBonds: 3, electronsNeeded: 5, isMetal: false, lonePairs: 0 },
    6: { valence: 4, maxBonds: 4, electronsNeeded: 4, isMetal: false, lonePairs: 0 },
    7: { valence: 5, maxBonds: 3, electronsNeeded: 3, isMetal: false, lonePairs: 1 },
    8: { valence: 6, maxBonds: 2, electronsNeeded: 2, isMetal: false, lonePairs: 2 },
    9: { valence: 7, maxBonds: 1, electronsNeeded: 1, isMetal: false, lonePairs: 3 },
    11: { valence: 1, maxBonds: 1, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    12: { valence: 2, maxBonds: 2, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    13: { valence: 3, maxBonds: 3, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    14: { valence: 4, maxBonds: 4, electronsNeeded: 4, isMetal: false, lonePairs: 0 },
    15: { valence: 5, maxBonds: 3, electronsNeeded: 3, isMetal: false, lonePairs: 1 },
    16: { valence: 6, maxBonds: 2, electronsNeeded: 2, isMetal: false, lonePairs: 2 },
    17: { valence: 7, maxBonds: 1, electronsNeeded: 1, isMetal: false, lonePairs: 3 },
    19: { valence: 1, maxBonds: 1, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    20: { valence: 2, maxBonds: 2, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    26: { valence: 2, maxBonds: 3, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    29: { valence: 1, maxBonds: 2, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    30: { valence: 2, maxBonds: 2, electronsNeeded: 0, isMetal: true, lonePairs: 0 },
    35: { valence: 7, maxBonds: 1, electronsNeeded: 1, isMetal: false, lonePairs: 3 },
    53: { valence: 7, maxBonds: 1, electronsNeeded: 1, isMetal: false, lonePairs: 3 },
};

// VSEPR geometry rules (steric number → geometry)
const VSEPR_GEOMETRY = {
    2: { name: 'Linear', angle: 180, hybrid: 'sp' },
    3: { name: 'Trigonal Planar', angle: 120, hybrid: 'sp²' },
    4: { name: 'Tetrahedral', angle: 109.5, hybrid: 'sp³' },
    5: { name: 'Trigonal Bipyramidal', angle: 90, hybrid: 'sp³d' },
    6: { name: 'Octahedral', angle: 90, hybrid: 'sp³d²' },
};

// Molecular shape from steric number + lone pairs (Pauling Ch. 4)
const MOLECULAR_SHAPES = {
    '2-0': { shape: 'Linear', angle: 180 },
    '3-0': { shape: 'Trigonal Planar', angle: 120 },
    '3-1': { shape: 'Bent', angle: 117 },
    '4-0': { shape: 'Tetrahedral', angle: 109.5 },
    '4-1': { shape: 'Trigonal Pyramidal', angle: 107.3 },
    '4-2': { shape: 'Bent', angle: 104.5 },
    '5-0': { shape: 'Trigonal Bipyramidal', angle: 90 },
    '5-1': { shape: 'Seesaw', angle: 86.5 },
    '5-2': { shape: 'T-shaped', angle: 87.5 },
    '6-0': { shape: 'Octahedral', angle: 90 },
};

// Backward-compatible valence lookup
const VALENCE_ELECTRONS = {};
Object.keys(ELEMENT_PROPERTIES).forEach(z => {
    VALENCE_ELECTRONS[z] = ELEMENT_PROPERTIES[z].maxBonds;
});

// Common elements for the Reaction Lab palette
const LAB_ELEMENTS = [1, 6, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20, 26, 35];

// ─── Preset Reactions with Product Blueprints ───────────────────
// deltaH in kcal/mol (negative = exothermic, positive = endothermic)
const PRESET_REACTIONS = [
    {
        name: 'Water Formation',
        equation: '2H₂ + O₂ → 2H₂O',
        type: 'Synthesis',
        deltaH: -116,
        deltaS: -88.6,
        activationEnergy: 75,
        geometry: 'Bent 104.5°',
        hybridization: 'sp³',
        reactantMolecules: [
            { formula: 'H₂', atoms: [1, 1], bonds: [[0, 1, 1]], count: 2 },
            { formula: 'O₂', atoms: [8, 8], bonds: [[0, 1, 2]], count: 1 }
        ],
        products: [{
            formula: 'H₂O', count: 2, atoms: [8, 1, 1],
            bonds: [[0, 1, 1], [0, 2, 1]],
            layout: [{ x: 0, y: 0 }, { x: -28, y: 24 }, { x: 28, y: 24 }]
        }],
        balanceQuestion: { reactants: { 'H₂': null, 'O₂': null }, products: { 'H₂O': null }, answer: { 'H₂': 2, 'O₂': 1, 'H₂O': 2 } }
    },
    {
        name: 'Salt Formation',
        equation: '2Na + Cl₂ → 2NaCl',
        type: 'Ionic',
        deltaH: -196,
        deltaS: -30.2,
        activationEnergy: 5,
        geometry: 'Ionic Lattice',
        hybridization: 'none',
        reactantMolecules: [
            { formula: 'Na', atoms: [11], bonds: [], count: 2 },
            { formula: 'Cl₂', atoms: [17, 17], bonds: [[0, 1, 1]], count: 1 }
        ],
        products: [{
            formula: 'NaCl', count: 2, atoms: [11, 17],
            bonds: [[0, 1, 1]], bondTypes: ['ionic'],
            layout: [{ x: -22, y: 0 }, { x: 22, y: 0 }]
        }],
        balanceQuestion: { reactants: { 'Na': null, 'Cl₂': null }, products: { 'NaCl': null }, answer: { 'Na': 2, 'Cl₂': 1, 'NaCl': 2 } }
    },
    {
        name: 'Rust',
        equation: '4Fe + 3O₂ → 2Fe₂O₃',
        type: 'Oxidation',
        deltaH: -399,
        deltaS: -137.4,
        activationEnergy: 40,
        geometry: 'Ionic Crystal',
        hybridization: 'none',
        reactantMolecules: [
            { formula: 'Fe', atoms: [26], bonds: [], count: 4 },
            { formula: 'O₂', atoms: [8, 8], bonds: [[0, 1, 2]], count: 3 }
        ],
        products: [{
            formula: 'Fe₂O₃', count: 2, atoms: [26, 26, 8, 8, 8],
            bonds: [[0, 2, 1], [0, 3, 1], [1, 3, 1], [1, 4, 1], [0, 4, 1]],
            bondTypes: ['ionic', 'ionic', 'ionic', 'ionic', 'ionic'],
            layout: [{ x: -25, y: -20 }, { x: 25, y: -20 }, { x: -35, y: 20 }, { x: 0, y: 25 }, { x: 35, y: 20 }]
        }],
        balanceQuestion: { reactants: { 'Fe': null, 'O₂': null }, products: { 'Fe₂O₃': null }, answer: { 'Fe': 4, 'O₂': 3, 'Fe₂O₃': 2 } }
    },
    {
        name: 'Methane Combustion',
        equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        type: 'Combustion',
        deltaH: -213,
        deltaS: -58.8,
        activationEnergy: 65,
        geometry: 'Linear CO₂ + Bent H₂O',
        hybridization: 'sp (CO₂) + sp³ (H₂O)',
        reactantMolecules: [
            { formula: 'CH₄', atoms: [6, 1, 1, 1, 1], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], count: 1 },
            { formula: 'O₂', atoms: [8, 8], bonds: [[0, 1, 2]], count: 2 }
        ],
        products: [
            {
                formula: 'CO₂', count: 1, atoms: [6, 8, 8], bonds: [[0, 1, 2], [0, 2, 2]],
                layout: [{ x: 0, y: 0 }, { x: -35, y: 0 }, { x: 35, y: 0 }]
            },
            {
                formula: 'H₂O', count: 2, atoms: [8, 1, 1], bonds: [[0, 1, 1], [0, 2, 1]],
                layout: [{ x: 0, y: 0 }, { x: -28, y: 24 }, { x: 28, y: 24 }]
            }
        ],
        balanceQuestion: { reactants: { 'CH₄': null, 'O₂': null }, products: { 'CO₂': null, 'H₂O': null }, answer: { 'CH₄': 1, 'O₂': 2, 'CO₂': 1, 'H₂O': 2 } }
    },
    {
        name: 'Ammonia Synthesis',
        equation: 'N₂ + 3H₂ → 2NH₃',
        type: 'Synthesis',
        deltaH: -22,
        deltaS: -47.3,
        activationEnergy: 40,
        geometry: 'Trigonal Pyramidal 107.3°',
        hybridization: 'sp³',
        reactantMolecules: [
            { formula: 'N₂', atoms: [7, 7], bonds: [[0, 1, 3]], count: 1 },
            { formula: 'H₂', atoms: [1, 1], bonds: [[0, 1, 1]], count: 3 }
        ],
        products: [{
            formula: 'NH₃', count: 2, atoms: [7, 1, 1, 1],
            bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
            layout: [{ x: 0, y: -10 }, { x: -28, y: 22 }, { x: 0, y: 32 }, { x: 28, y: 22 }]
        }],
        balanceQuestion: { reactants: { 'N₂': null, 'H₂': null }, products: { 'NH₃': null }, answer: { 'N₂': 1, 'H₂': 3, 'NH₃': 2 } }
    },
    {
        name: 'Hydrogen Chloride',
        equation: 'H₂ + Cl₂ → 2HCl',
        type: 'Synthesis',
        deltaH: -44,
        deltaS: -9.5,
        activationEnergy: 58,
        geometry: 'Linear',
        hybridization: 'none',
        reactantMolecules: [
            { formula: 'H₂', atoms: [1, 1], bonds: [[0, 1, 1]], count: 1 },
            { formula: 'Cl₂', atoms: [17, 17], bonds: [[0, 1, 1]], count: 1 }
        ],
        products: [{
            formula: 'HCl', count: 2, atoms: [1, 17],
            bonds: [[0, 1, 1]],
            layout: [{ x: -18, y: 0 }, { x: 18, y: 0 }]
        }],
        balanceQuestion: { reactants: { 'H₂': null, 'Cl₂': null }, products: { 'HCl': null }, answer: { 'H₂': 1, 'Cl₂': 1, 'HCl': 2 } }
    },
    {
        name: 'Carbon Dioxide',
        equation: 'C + O₂ → CO₂',
        type: 'Combustion',
        deltaH: -94,
        deltaS: 0.7,
        activationEnergy: 80,
        geometry: 'Linear 180°',
        hybridization: 'sp',
        reactantMolecules: [
            { formula: 'C', atoms: [6], bonds: [], count: 1 },
            { formula: 'O₂', atoms: [8, 8], bonds: [[0, 1, 2]], count: 1 }
        ],
        products: [{
            formula: 'CO₂', count: 1, atoms: [6, 8, 8],
            bonds: [[0, 1, 2], [0, 2, 2]],
            layout: [{ x: 0, y: 0 }, { x: -35, y: 0 }, { x: 35, y: 0 }]
        }],
        balanceQuestion: { reactants: { 'C': null, 'O₂': null }, products: { 'CO₂': null }, answer: { 'C': 1, 'O₂': 1, 'CO₂': 1 } }
    },
    {
        name: 'Magnesium Combustion',
        equation: '2Mg + O₂ → 2MgO',
        type: 'Oxidation',
        deltaH: -290,
        deltaS: -54.1,
        activationEnergy: 20,
        geometry: 'Ionic',
        hybridization: 'none',
        reactantMolecules: [
            { formula: 'Mg', atoms: [12], bonds: [], count: 2 },
            { formula: 'O₂', atoms: [8, 8], bonds: [[0, 1, 2]], count: 1 }
        ],
        products: [{
            formula: 'MgO', count: 2, atoms: [12, 8],
            bonds: [[0, 1, 1]], bondTypes: ['ionic'],
            layout: [{ x: -20, y: 0 }, { x: 20, y: 0 }]
        }],
        balanceQuestion: { reactants: { 'Mg': null, 'O₂': null }, products: { 'MgO': null }, answer: { 'Mg': 2, 'O₂': 1, 'MgO': 2 } }
    },
    {
        name: 'Hydrogen Fluoride',
        equation: 'H₂ + F₂ → 2HF',
        type: 'Synthesis',
        deltaH: -130,
        deltaS: -13.8,
        activationEnergy: 35,
        geometry: 'Linear',
        hybridization: 'none',
        reactantMolecules: [
            { formula: 'H₂', atoms: [1, 1], bonds: [[0, 1, 1]], count: 1 },
            { formula: 'F₂', atoms: [9, 9], bonds: [[0, 1, 1]], count: 1 }
        ],
        products: [{
            formula: 'HF', count: 2, atoms: [1, 9],
            bonds: [[0, 1, 1]],
            layout: [{ x: -18, y: 0 }, { x: 18, y: 0 }]
        }],
        balanceQuestion: { reactants: { 'H₂': null, 'F₂': null }, products: { 'HF': null }, answer: { 'H₂': 1, 'F₂': 1, 'HF': 2 } }
    },
    {
        name: 'Hydrogen Peroxide Decomposition',
        equation: '2H₂O₂ → 2H₂O + O₂',
        type: 'Decomposition',
        deltaH: -47,
        deltaS: 30.4,
        activationEnergy: 18,
        geometry: 'Bent H₂O + O₂',
        hybridization: 'sp³',
        reactantMolecules: [
            { formula: 'H₂O₂', atoms: [8, 8, 1, 1], bonds: [[0, 1, 1], [0, 2, 1], [1, 3, 1]], count: 2 }
        ],
        products: [
            {
                formula: 'H₂O', count: 2, atoms: [8, 1, 1], bonds: [[0, 1, 1], [0, 2, 1]],
                layout: [{ x: 0, y: 0 }, { x: -28, y: 24 }, { x: 28, y: 24 }]
            },
            {
                formula: 'O₂', count: 1, atoms: [8, 8], bonds: [[0, 1, 2]],
                layout: [{ x: -18, y: 0 }, { x: 18, y: 0 }]
            }
        ],
        balanceQuestion: { reactants: { 'H₂O₂': null }, products: { 'H₂O': null, 'O₂': null }, answer: { 'H₂O₂': 2, 'H₂O': 2, 'O₂': 1 } }
    },
];

// ═════════════════════════════════════════════
// Standard Reduction Potentials (V vs SHE)
// ═════════════════════════════════════════════
const STANDARD_REDUCTION_POTENTIALS = [
    { ion: 'Li⁺', metal: 'Li', equation: 'Li⁺ + e⁻ → Li', E0: -3.04, n: 1, color: '#ef4444', metalColor: '#c0c0c0' },
    { ion: 'K⁺', metal: 'K', equation: 'K⁺ + e⁻ → K', E0: -2.93, n: 1, color: '#f97316', metalColor: '#c0c0c0' },
    { ion: 'Ca²⁺', metal: 'Ca', equation: 'Ca²⁺ + 2e⁻ → Ca', E0: -2.87, n: 2, color: '#f59e0b', metalColor: '#d0d0d0' },
    { ion: 'Na⁺', metal: 'Na', equation: 'Na⁺ + e⁻ → Na', E0: -2.71, n: 1, color: '#eab308', metalColor: '#c8c8c8' },
    { ion: 'Mg²⁺', metal: 'Mg', equation: 'Mg²⁺ + 2e⁻ → Mg', E0: -2.37, n: 2, color: '#84cc16', metalColor: '#b8b8b8' },
    { ion: 'Al³⁺', metal: 'Al', equation: 'Al³⁺ + 3e⁻ → Al', E0: -1.66, n: 3, color: '#22c55e', metalColor: '#a8a8a8' },
    { ion: 'Zn²⁺', metal: 'Zn', equation: 'Zn²⁺ + 2e⁻ → Zn', E0: -0.76, n: 2, color: '#6366f1', metalColor: '#a0a8c0' },
    { ion: 'Fe²⁺', metal: 'Fe', equation: 'Fe²⁺ + 2e⁻ → Fe', E0: -0.44, n: 2, color: '#8b5cf6', metalColor: '#808080' },
    { ion: 'Ni²⁺', metal: 'Ni', equation: 'Ni²⁺ + 2e⁻ → Ni', E0: -0.26, n: 2, color: '#a855f7', metalColor: '#909090' },
    { ion: 'Sn²⁺', metal: 'Sn', equation: 'Sn²⁺ + 2e⁻ → Sn', E0: -0.14, n: 2, color: '#d946ef', metalColor: '#b0b0b0' },
    { ion: 'Pb²⁺', metal: 'Pb', equation: 'Pb²⁺ + 2e⁻ → Pb', E0: -0.13, n: 2, color: '#ec4899', metalColor: '#707070' },
    { ion: 'H⁺', metal: 'H₂', equation: '2H⁺ + 2e⁻ → H₂', E0: 0.00, n: 2, color: '#94a3b8', metalColor: '#e0e0e0' },
    { ion: 'Cu²⁺', metal: 'Cu', equation: 'Cu²⁺ + 2e⁻ → Cu', E0: +0.34, n: 2, color: '#f97316', metalColor: '#b87333' },
    { ion: 'Ag⁺', metal: 'Ag', equation: 'Ag⁺ + e⁻ → Ag', E0: +0.80, n: 1, color: '#e2e8f0', metalColor: '#c0c0c0' },
    { ion: 'Pt²⁺', metal: 'Pt', equation: 'Pt²⁺ + 2e⁻ → Pt', E0: +1.20, n: 2, color: '#fbbf24', metalColor: '#e5e4e2' },
    { ion: 'Au³⁺', metal: 'Au', equation: 'Au³⁺ + 3e⁻ → Au', E0: +1.50, n: 3, color: '#fbbf24', metalColor: '#ffd700' },
];
