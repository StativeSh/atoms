import test from 'node:test';
import assert from 'node:assert';
import { laguerreL } from '../math-utils.js';

test('laguerreL - L_0^k(x) should always be 1', () => {
    assert.strictEqual(laguerreL(0, 0, 0), 1);
    assert.strictEqual(laguerreL(0, 1, 5), 1);
    assert.strictEqual(laguerreL(0, 5, -2), 1);
});

test('laguerreL - L_1^k(x) should be 1 + k - x', () => {
    assert.strictEqual(laguerreL(1, 0, 0), 1);
    assert.strictEqual(laguerreL(1, 1, 0), 2);
    assert.strictEqual(laguerreL(1, 1, 1), 1);
    assert.strictEqual(laguerreL(1, 2, 5), -2);
});

test('laguerreL - L_n^k(0) should be (n+k)! / (n! k!)', () => {
    // For integer k, this is the binomial coefficient (n+k) choose n
    // L_2^1(0) = (2+1)! / (2! 1!) = 6 / 2 = 3
    assert.strictEqual(laguerreL(2, 1, 0), 3);
    // L_3^1(0) = (3+1)! / (3! 1!) = 24 / 6 = 4
    assert.strictEqual(laguerreL(3, 1, 0), 4);
    // L_2^2(0) = (2+2)! / (2! 2!) = 24 / 4 = 6
    assert.strictEqual(laguerreL(2, 2, 0), 6);
});

test('laguerreL - L_2^k(x) known values', () => {
    // L_2^1(1) = 0.5 * (1^2 - 2*(1+2)*1 + (1+1)*(1+2))
    //          = 0.5 * (1 - 6 + 6) = 0.5
    assert.strictEqual(laguerreL(2, 1, 1), 0.5);

    // L_2^0(x) = 0.5 * (x^2 - 4x + 2)
    // L_2^0(2) = 0.5 * (4 - 8 + 2) = -1
    assert.strictEqual(laguerreL(2, 0, 2), -1);
});

test('laguerreL - higher order known value', () => {
    // L_3^0(x) = 1/6 * (-x^3 + 9x^2 - 18x + 6)
    // L_3^0(1) = 1/6 * (-1 + 9 - 18 + 6) = -4/6 = -2/3
    const val = laguerreL(3, 0, 1);
    assert.ok(Math.abs(val - (-2/3)) < 1e-10);
});
