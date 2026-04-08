const count = 50000; // Simulate a reasonable number of particles for a complex atom
const positions = new Float32Array(count * 3);
const base = new Float32Array(count * 3);
// Initialize with random values
for(let i=0; i<positions.length; i++) {
    base[i] = (Math.random() - 0.5) * 10;
    positions[i] = base[i];
}

const speed = 1.0;
const n = 3;
const l = 1;
let elapsed = 0;

console.log(`Benchmarking particle animation for ${count} particles over 600 frames...`);

const start = process.hrtime();

for (let frame = 0; frame < 600; frame++) { // Simulate ~10 seconds at 60fps
    elapsed += 0.016;
    const phase = elapsed * speed * 0.8 + n * 1.3 + l * 0.7;
    const breathe = 1.0 + Math.sin(phase) * 0.04;

    // The code to optimize
    for (let i = 0; i < positions.length; i += 3) {
        const jitterScale = 0.03 * speed;
        positions[i] = base[i] * breathe + (Math.sin(elapsed * 2.3 + i) * jitterScale);
        positions[i + 1] = base[i + 1] * breathe + (Math.cos(elapsed * 1.7 + i) * jitterScale);
        positions[i + 2] = base[i + 2] * breathe + (Math.sin(elapsed * 3.1 + i + 1) * jitterScale);
    }
}

const end = process.hrtime(start);
const timeInMs = (end[0] * 1000 + end[1] / 1e6);
console.log(`Total CPU time: ${timeInMs.toFixed(2)}ms`);
console.log(`Average time per frame: ${(timeInMs / 600).toFixed(2)}ms`);
