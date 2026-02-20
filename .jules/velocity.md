## 2024-05-24 - [CPU to GPU Orbital Animation]
Issue: `animate` loop updated 100k+ particle positions every frame on CPU, causing significant overhead (11ms+ per frame) and expensive buffer uploads.
Root Cause: JS loop iterating over `Float32Array` attributes and setting `needsUpdate=true` every frame.
Optimization: Moved animation logic (breathing + jitter) to vertex shader using `onBeforeCompile` on `PointsMaterial`. Used `particleIndex` attribute for stable per-particle jitter.
Prevention: For large particle systems, always implement procedural animation in vertex shader. Avoid modifying geometry attributes every frame.
