// wasm/src/particle_system.cpp
// High-performance cosmic particle engine for SciSpace — compiled to WASM
// Computes 60+ FPS updates for ~1500 stars/dust with orbital physics, twinkle, parallax and lensing.
// JS only does Canvas draw; all math stays in WASM linear memory for cache-friendliness.
//
// Build (requires Emscripten):
//   emcc wasm/src/particle_system.cpp -O3 -s WASM=1 \
//     -s EXPORTED_FUNCTIONS='["_ps_init","_ps_resize","_ps_update","_ps_count","_ps_ptr","_malloc","_free"]' \
//     -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","UTF8ToString"]' \
//     -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="createParticleModule" \
//     -o public/wasm/particle_system.js
//
// Without emcc, the JS fallback in src/wasm/particleEngine.ts provides identical API.

#include <emscripten/emscripten.h>
#include <cmath>
#include <cstdint>
#include <cstdlib>

struct Particle {
  float x;        // 0..1 normalized
  float y;
  float vx;
  float vy;
  float size;     // px at 1080p
  float twinklePhase;
  float twinkleSpeed;
  float parallax; // 0.2..1.0 depth
  float hue;      // 190..235 (blue/cyan) or 18..35 (warm accretion)
  float alphaBase;
};

static Particle* g_particles = nullptr;
static int g_count = 0;
static float g_time = 0.f;
static float g_w = 1.f, g_h = 1.f;
static uint32_t g_seed = 0x9E3779B9u;

// xorshift32
inline uint32_t xorshift32() {
  g_seed ^= g_seed << 13;
  g_seed ^= g_seed >> 17;
  g_seed ^= g_seed << 5;
  return g_seed;
}
inline float rand01() { return (xorshift32() & 0x00FFFFFF) / 16777216.0f; }
inline float randRange(float a, float b) { return a + (b - a) * rand01(); }

extern "C" {

EMSCRIPTEN_KEEPALIVE
int ps_count() { return g_count; }

EMSCRIPTEN_KEEPALIVE
uintptr_t ps_ptr() { return reinterpret_cast<uintptr_t>(g_particles); }

// Particle struct is 36 bytes; JS reads via Float32Array at ps_ptr()
EMSCRIPTEN_KEEPALIVE
void ps_init(int count, float w, float h, uint32_t seed) {
  if (g_particles) free(g_particles);
  g_count = count;
  g_w = w; g_h = h;
  g_seed = seed ? seed : 0xC0FFEEu;
  g_time = 0.f;
  g_particles = (Particle*)malloc(sizeof(Particle) * g_count);
  for (int i = 0; i < g_count; ++i) {
    Particle &p = g_particles[i];
    // layered distribution: 60% distant stars, 30% mid dust, 10% accretion highlights
    float tier = rand01();
    if (tier < 0.6f) {
      p.x = rand01();
      p.y = rand01();
      p.vx = randRange(-0.00012f, 0.00018f);
      p.vy = randRange(-0.00008f, 0.00008f);
      p.size = randRange(0.6f, 1.8f);
      p.parallax = randRange(0.2f, 0.45f);
      p.hue = randRange(192.f, 228.f);
      p.alphaBase = randRange(0.35f, 0.85f);
    } else if (tier < 0.9f) {
      p.x = rand01();
      p.y = randRange(0.08f, 0.92f);
      p.vx = randRange(-0.00035f, 0.00045f);
      p.vy = randRange(-0.00018f, 0.00018f);
      p.size = randRange(1.2f, 2.6f);
      p.parallax = randRange(0.45f, 0.75f);
      p.hue = randRange(188.f, 218.f);
      p.alphaBase = randRange(0.45f, 0.95f);
    } else {
      // warm accretion / lensing streak hints near center-top
      p.x = randRange(0.32f, 0.72f);
      p.y = randRange(0.06f, 0.52f);
      p.vx = randRange(-0.0006f, 0.0006f);
      p.vy = randRange(-0.0001f, 0.00025f);
      p.size = randRange(1.6f, 3.4f);
      p.parallax = randRange(0.75f, 1.0f);
      p.hue = randRange(18.f, 36.f);
      p.alphaBase = randRange(0.55f, 1.0f);
    }
    p.twinklePhase = randRange(0.f, 6.2831853f);
    p.twinkleSpeed = randRange(0.6f, 2.4f);
  }
}

EMSCRIPTEN_KEEPALIVE
void ps_resize(float w, float h) { g_w = w; g_h = h; }

// dt in seconds, mouseX/Y normalized 0..1 (or -1 if no mouse), hover 0..1, timeAccum
EMSCRIPTEN_KEEPALIVE
void ps_update(float dt, float mouseX, float mouseY, float hover, float timeAccum) {
  g_time = timeAccum;
  // clamp dt to avoid spiral on tab wake
  if (dt > 0.05f) dt = 0.05f;
  const float lensCx = 0.50f;
  const float lensCy = 0.28f;
  const float haveMouse = (mouseX >= 0.f && mouseY >= 0.f) ? 1.f : 0.f;

  for (int i = 0; i < g_count; ++i) {
    Particle &p = g_particles[i];
    // base drift scaled by parallax (distant moves slower)
    float sp = p.parallax;
    p.x += p.vx * dt * 60.f * (0.35f + 0.85f * sp);
    p.y += p.vy * dt * 60.f * (0.35f + 0.85f * sp);

    // subtle orbital swirl around black-hole center (lensing) — cheap polar nudge
    float dx = p.x - lensCx;
    float dy = (p.y - lensCy) * 0.92f;
    float r2 = dx*dx + dy*dy + 0.02f;
    float r = sqrtf(r2);
    float invR = 1.f / r;
    // tangential + slight inward pull, falloff ~ 1/r
    float swirl = (0.000055f / r2) * sp;
    // perpendicular
    p.vx += (-dy * invR) * swirl * dt * 60.f;
    p.vy += ( dx * invR) * swirl * dt * 60.f * 0.92f;
    // mouse parallax influence (very subtle, only when hover)
    if (haveMouse > 0.5f && hover > 0.01f) {
      float mx = (mouseX - 0.5f) * 0.06f * sp * hover;
      float my = (mouseY - 0.5f) * 0.04f * sp * hover;
      p.x += mx * dt * 10.f;
      p.y += my * dt * 10.f;
    }

    // wrap softly
    if (p.x < -0.02f) p.x += 1.04f;
    if (p.x >  1.02f) p.x -= 1.04f;
    if (p.y < -0.02f) p.y += 1.04f;
    if (p.y >  1.02f) p.y -= 1.04f;

    // clamp velocity to avoid runaway from lensing
    if (p.vx >  0.002f) p.vx =  0.002f;
    if (p.vx < -0.002f) p.vx = -0.002f;
    if (p.vy >  0.002f) p.vy =  0.002f;
    if (p.vy < -0.002f) p.vy = -0.002f;
  }
}

} // extern C
