
import { laguerreL } from './math.js';

console.log('Running tests for laguerreL...');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        testsFailed++;
        throw new Error(message);
    } else {
        console.log(`✅ PASSED: ${message}`);
        testsPassed++;
    }
}

function areClose(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}

try {
    // Test Case 1: Base case p=0
    // L_0^k(x) = 1
    assert(laguerreL(0, 0, 0) === 1, 'p=0 should return 1');
    assert(laguerreL(0, 5, 100) === 1, 'p=0 with other params should return 1');

    // Test Case 2: Linear case p=1
    // L_1^k(x) = 1 + k - x
    assert(laguerreL(1, 0, 0) === 1, 'L_1^0(0) should be 1');
    assert(laguerreL(1, 1, 2) === 0, 'L_1^1(2) should be 1 + 1 - 2 = 0');
    assert(laguerreL(1, 5, 2) === 4, 'L_1^5(2) should be 1 + 5 - 2 = 4');

    // Test Case 3: p=2, k=0, x=0
    // L_2^0(0) = 1
    assert(laguerreL(2, 0, 0) === 1, 'L_2^0(0) should be 1');

    // Test Case 4: p=2, k=1, x=2
    // L_2^1(2) = -1
    assert(laguerreL(2, 1, 2) === -1, 'L_2^1(2) should be -1');

    // Test Case 5: p=3, k=2, x=1
    // L_3^2(1) = 7/3
    const result = laguerreL(3, 2, 1);
    const expected = 7/3;
    assert(areClose(result, expected), `L_3^2(1) should be approx ${expected}, got ${result}`);

    console.log(`\n🎉 All ${testsPassed} tests passed!`);

} catch (e) {
    console.error(`\n💥 Tests failed! Passed: ${testsPassed}, Failed: ${testsFailed}`);
    process.exit(1);
}
