import assert from 'node:assert';
import { getElectronConfiguration, configToString, ELEMENTS } from './atomic_logic.mjs';

// Test Helper
function verifyConfiguration(z, expectedString) {
    const config = getElectronConfiguration(z);
    const configStr = configToString(config);

    // Check total electrons
    const totalElectrons = config.reduce((sum, sub) => sum + sub.electrons, 0);
    assert.strictEqual(totalElectrons, z, `Total electrons for Z=${z} should be ${z}`);

    // Check string representation
    assert.strictEqual(configStr, expectedString, `Configuration string for Z=${z} mismatch`);

    console.log(`✅ Z=${z} (${expectedString}) passed`);
}

console.log('🧪 Testing Atomic Logic...');

// 1. Hydrogen: 1s1
verifyConfiguration(1, '1s¹');

// 2. Helium: 1s2
verifyConfiguration(2, '1s²');

// 3. Carbon: 1s2 2s2 2p2
verifyConfiguration(6, '1s² 2s² 2p²');

// 4. Neon: 1s2 2s2 2p6
verifyConfiguration(10, '1s² 2s² 2p⁶');

// 5. Argon: 1s2 2s2 2p6 3s2 3p6
verifyConfiguration(18, '1s² 2s² 2p⁶ 3s² 3p⁶');

// 6. Scandium: 1s2 2s2 2p6 3s2 3p6 4s2 3d1
// Note: The order in config depends on AUFBAU_ORDER which is energy order.
// 4s fills before 3d.
// So: 1s, 2s, 2p, 3s, 3p, 4s, 3d
verifyConfiguration(21, '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹');

// 7. Krypton: 1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6
verifyConfiguration(36, '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶');

// 8. Edge Case: Z=0
verifyConfiguration(0, '');

// 9. Verify ELEMENTS export
assert.ok(ELEMENTS[1], 'Hydrogen should be in ELEMENTS');
assert.strictEqual(ELEMENTS[6].name, 'Carbon', 'Element 6 should be Carbon');
console.log('✅ ELEMENTS export verified');

console.log('🎉 All tests passed!');
