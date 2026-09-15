# SciSpace WASM modules

C++ sources live in `wasm/src/`. They are compiled to WebAssembly for 60+ FPS paths; JS fallbacks keep the site working without a toolchain.

## Modules

- `particle_system.cpp` — cosmic star/dust engine (1500 particles, O(N) per frame, lensing + parallax). ~36 bytes/particle, contiguous Float32 memory.
- `image_processor.cpp` — box blur, downsample, luma histogram for gallery placeholders.

## Build (requires Emscripten 3.1+)

```bash
# particle system
emcc wasm/src/particle_system.cpp -O3 -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_ps_init","_ps_resize","_ps_update","_ps_count","_ps_ptr","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 -s EXPORT_NAME="createParticleModule" \
  -o public/wasm/particle_system.js

# image processor
emcc wasm/src/image_processor.cpp -O3 -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_img_box_blur","_img_downsample_2x","_img_histogram_luma","_malloc","_free"]' \
  -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="createImageModule" \
  -o public/wasm/image_processor.js
```

Or `npm run wasm:build` (checks for `emcc` first).

In dev / CI without `emcc`, the TS loaders in `src/wasm/` automatically use the hand-tuned JS fallback with identical API — no broken build.
