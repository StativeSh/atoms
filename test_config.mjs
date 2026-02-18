import { configToString, getElectronConfiguration } from './chemistry.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
    console.log(`✅ ${message}`);
}

function testConfigToString() {
    console.log("Testing configToString...");

    // Test Case 1: Hydrogen (1s¹)
    const hConfig = [{ label: '1s', electrons: 1 }];
    const hStr = configToString(hConfig);
    assert(hStr === '1s¹', `Hydrogen should be "1s¹", got "${hStr}"`);

    // Test Case 2: Helium (1s²)
    const heConfig = [{ label: '1s', electrons: 2 }];
    const heStr = configToString(heConfig);
    assert(heStr === '1s²', `Helium should be "1s²", got "${heStr}"`);

    // Test Case 3: Carbon (1s² 2s² 2p²)
    const cConfig = [
        { label: '1s', electrons: 2 },
        { label: '2s', electrons: 2 },
        { label: '2p', electrons: 2 }
    ];
    const cStr = configToString(cConfig);
    assert(cStr === '1s² 2s² 2p²', `Carbon should be "1s² 2s² 2p²", got "${cStr}"`);

    // Test Case 4: Zinc (ending in 3d¹⁰) - testing double digit superscript
    // Zn is [Ar] 4s² 3d¹⁰ -> 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰
    // But getElectronConfiguration follows Aufbau order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p...
    // Let's verify with getElectronConfiguration too.
    const znConfig = getElectronConfiguration(30);
    const znStr = configToString(znConfig);
    // Expected: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰
    // Check if it ends with 3d¹⁰
    assert(znStr.endsWith('3d¹⁰'), `Zinc should end with "3d¹⁰", got "${znStr}"`);
    assert(znStr.includes('4s²'), `Zinc should include "4s²"`);

    // Test Case 5: Empty configuration
    const emptyConfig = [];
    const emptyStr = configToString(emptyConfig);
    assert(emptyStr === '', `Empty config should be "", got "${emptyStr}"`);

    // Test Case 6: Zero electrons (edge case, though unlikely from getElectronConfiguration)
    const zeroConfig = [{ label: '1s', electrons: 0 }];
    const zeroStr = configToString(zeroConfig);
    assert(zeroStr === '1s⁰', `Zero electrons should be "1s⁰", got "${zeroStr}"`);

    // Test Case 7: Large number of electrons (edge case)
    const largeConfig = [{ label: '5g', electrons: 18 }]; // theoretical
    const largeStr = configToString(largeConfig);
    assert(largeStr === '5g¹⁸', `Large config should be "5g¹⁸", got "${largeStr}"`);

    console.log("All tests passed!");
}

try {
    testConfigToString();
} catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
}
