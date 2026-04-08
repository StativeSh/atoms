import { configToString, getElectronConfiguration } from './chemistry.js';
import assert from 'assert/strict';

console.log('Running tests for configToString...');

// Test 1: Basic single subshell
{
    const config = [{ label: '1s', electrons: 2 }];
    const result = configToString(config);
    assert.equal(result, '1s²');
    console.log('✅ Basic single subshell passed');
}

// Test 2: Multiple subshells
{
    const config = [
        { label: '1s', electrons: 2 },
        { label: '2s', electrons: 2 },
        { label: '2p', electrons: 2 }
    ];
    const result = configToString(config);
    assert.equal(result, '1s² 2s² 2p²');
    console.log('✅ Multiple subshells passed');
}

// Test 3: Double digit electron counts
{
    const config = [{ label: '4f', electrons: 14 }];
    const result = configToString(config);
    assert.equal(result, '4f¹⁴');
    console.log('✅ Double digit electron counts passed');
}

// Test 4: Empty config
{
    const config = [];
    const result = configToString(config);
    assert.equal(result, '');
    console.log('✅ Empty config passed');
}

console.log('Running integration tests with getElectronConfiguration...');

// Test 5: Hydrogen (Z=1)
{
    const config = getElectronConfiguration(1);
    const str = configToString(config);
    assert.equal(str, '1s¹');
    console.log('✅ Hydrogen passed');
}

// Test 6: Carbon (Z=6)
{
    const config = getElectronConfiguration(6);
    const str = configToString(config);
    assert.equal(str, '1s² 2s² 2p²');
    console.log('✅ Carbon passed');
}

// Test 7: Zinc (Z=30)
// 1s2 2s2 2p6 3s2 3p6 4s2 3d10
{
    const config = getElectronConfiguration(30);
    const str = configToString(config);
    // Note: The order depends on AUFBAU_ORDER.
    // AUFBAU_ORDER: 1s, 2s, 2p, 3s, 3p, 4s, 3d ...
    // So 30 electrons:
    // 1s: 2
    // 2s: 2
    // 2p: 6
    // 3s: 2
    // 3p: 6
    // 4s: 2
    // 3d: 10
    assert.equal(str, '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰');
    console.log('✅ Zinc passed');
}

console.log('🎉 All tests passed!');
