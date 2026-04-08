import { laguerreL } from '../math.js';
import assert from 'node:assert';

console.log("Testing laguerreL function...");

// Test case 1: p = 0
// L_0^k(x) = 1
assert.strictEqual(laguerreL(0, 0, 5), 1, "p=0 should return 1");
assert.strictEqual(laguerreL(0, 10, 100), 1, "p=0 should return 1 regardless of k and x");

// Test case 2: p = 1
// L_1^k(x) = 1 + k - x
let k = 2;
let x = 3;
assert.strictEqual(laguerreL(1, k, x), 1 + k - x, "p=1 should return 1 + k - x");

k = 0; x = 0;
assert.strictEqual(laguerreL(1, k, x), 1 + k - x, "p=1 should return 1 + k - x (zeros)");

k = 5; x = 10;
assert.strictEqual(laguerreL(1, k, x), 1 + k - x, "p=1 should return 1 + k - x (negative result)");

// Test case 3: p = 2
// L_2^k(x) = ((2*2 - 1 + k - x) * L_1^k(x) - (2 - 1 + k) * L_0^k(x)) / 2
//          = ((3 + k - x) * (1 + k - x) - (1 + k) * 1) / 2
// Let's verify this formula manually for k=1, x=2
k = 1; x = 2;
// L_1 = 1 + 1 - 2 = 0
// L_0 = 1
// L_2 = ((3 + 1 - 2) * 0 - (1 + 1) * 1) / 2 = (2 * 0 - 2) / 2 = -1
assert.strictEqual(laguerreL(2, k, x), -1, "p=2 manual calculation check");

// Let's try another one for p=2
// k=0, x=1
// L_1 = 1 + 0 - 1 = 0
// L_0 = 1
// L_2 = ((3 + 0 - 1) * 0 - (1 + 0) * 1) / 2 = (2 * 0 - 1) / 2 = -0.5
k = 0; x = 1;
assert.strictEqual(laguerreL(2, k, x), -0.5, "p=2 manual calculation check 2");


// Test case 4: p = 3
// Recurrence check
// L_3 = ((2*3 - 1 + k - x) * L_2 - (3 - 1 + k) * L_1) / 3
//     = ((5 + k - x) * L_2 - (2 + k) * L_1) / 3
k = 0; x = 0;
// L_0 = 1
// L_1 = 1
// L_2 = ((3)*1 - 1*1)/2 = 1
// L_3 = ((5)*1 - 2*1)/3 = 3/3 = 1
assert.strictEqual(laguerreL(3, 0, 0), 1, "p=3 at origin");

console.log("All tests passed!");
