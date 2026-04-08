import { laguerreL } from './math.mjs';
import assert from 'node:assert';

console.log("Running tests for laguerreL...");

// Test L_0^k(x) = 1
for (let k = 0; k < 5; k++) {
    for (let x = 0; x < 5; x++) {
        assert.strictEqual(laguerreL(0, k, x), 1, `L_0^${k}(${x}) should be 1`);
    }
}

// Test L_1^k(x) = 1 + k - x
for (let k = 0; k < 5; k++) {
    for (let x = 0; x < 5; x++) {
        assert.strictEqual(laguerreL(1, k, x), 1 + k - x, `L_1^${k}(${x}) should be ${1 + k - x}`);
    }
}

// Test L_2^0(x) = 0.5 * (x^2 - 4x + 2)
// x=0: 1
assert.strictEqual(laguerreL(2, 0, 0), 1, "L_2^0(0) should be 1");
// x=2: 0.5 * (4 - 8 + 2) = -1
assert.strictEqual(laguerreL(2, 0, 2), -1, "L_2^0(2) should be -1");
// x=4: 0.5 * (16 - 16 + 2) = 1
assert.strictEqual(laguerreL(2, 0, 4), 1, "L_2^0(4) should be 1");

// Test L_2^1(x) = 0.5 * (x^2 - 6x + 6)
// k=1, p=2
// Formula: 0.5 * (x^2 - 2(1+2)x + (1+1)(1+2)) = 0.5 * (x^2 - 6x + 6)
// x=0: 3
assert.strictEqual(laguerreL(2, 1, 0), 3, "L_2^1(0) should be 3");
// x=3: 0.5 * (9 - 18 + 6) = -1.5
assert.strictEqual(laguerreL(2, 1, 3), -1.5, "L_2^1(3) should be -1.5");

console.log("All tests passed!");
