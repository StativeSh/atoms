export function laguerreL(p, k, x) {
    if (p === 0) return 1;
    if (p === 1) return 1 + k - x;
    let lPrev2 = 1;
    let lPrev1 = 1 + k - x;
    for (let i = 2; i <= p; i++) {
        const lCurr = ((2 * i - 1 + k - x) * lPrev1 - (i - 1 + k) * lPrev2) / i;
        lPrev2 = lPrev1;
        lPrev1 = lCurr;
    }
    return lPrev1;
}
