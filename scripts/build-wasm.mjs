#!/usr/bin/env node
// scripts/build-wasm.mjs — builds C++ -> WASM if emcc is available, otherwise warns and keeps JS fallback.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const hasEmcc = (() => {
  try { execSync("emcc --version", { stdio: "ignore" }); return true; } catch { return false; }
})();

if (process.argv.includes("--check")) {
  console.log(hasEmcc ? "emcc: found" : "emcc: NOT found — JS fallback will be used (still 60fps for 1200 particles)");
  process.exit(0);
}

if (!hasEmcc) {
  console.warn("[wasm] emcc not found — skipping WASM build. The app will use the optimized JS fallback with identical API.");
  console.warn("       Install Emscripten (https://emscripten.org/docs/getting_started/downloads.html) then run npm run wasm:build for native WASM.");
  process.exit(0);
}

mkdirSync("public/wasm", { recursive: true });

console.log("[wasm] building particle_system...");
execSync(
  `emcc wasm/src/particle_system.cpp -O3 -s WASM=1 -s EXPORTED_FUNCTIONS='["_ps_init","_ps_resize","_ps_update","_ps_count","_ps_ptr","_malloc","_free"]' -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="createParticleModule" -o public/wasm/particle_system.js`,
  { stdio: "inherit" }
);
console.log("[wasm] building image_processor...");
execSync(
  `emcc wasm/src/image_processor.cpp -O3 -s WASM=1 -s EXPORTED_FUNCTIONS='["_img_box_blur","_img_downsample_2x","_img_histogram_luma","_malloc","_free"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="createImageModule" -o public/wasm/image_processor.js`,
  { stdio: "inherit" }
);
console.log("[wasm] done → public/wasm/");
