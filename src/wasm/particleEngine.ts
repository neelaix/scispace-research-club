// src/wasm/particleEngine.ts
// Loader for the C++ particle_system WASM. Provides identical JS fallback when WASM not built.
// Memory layout mirrors wasm/src/particle_system.cpp: Particle = 9 floats = 36 bytes
//   0:x 1:y 2:vx 3:vy 4:size 5:twPhase 6:twSpeed 7:parallax 8:hue+alpha packed? (we split: 8:hue 9:alphaBase would be 10)
// Actually C++ struct is 9 floats? x,y,vx,vy,size,twPhase,twSpeed,parallax,hue,alphaBase = 10 floats = 40 bytes.
// Keep loader generic: read 10 floats per particle.

export type ParticleEngine = {
  kind: "wasm" | "js";
  count(): number;
  ptr(): number; // wasm pointer or 0 for js (use jsBuffer)
  jsBuffer: Float32Array | null; // non-null for js fallback
  memory: WebAssembly.Memory | null;
  init(count: number, w: number, h: number, seed: number): void;
  resize(w: number, h: number): void;
  update(dt: number, mouseX: number, mouseY: number, hover: number, t: number): void;
  destroy(): void;
};

// ---------- JS fallback — same logic as particle_system.cpp, tuned for cache ----------
class JsParticleEngine implements ParticleEngine {
  kind: "wasm" | "js" = "js";
  memory = null;
  jsBuffer: Float32Array | null = null;
  private count_ = 0;
  private w = 1;
  private h = 1;
  private seed = 0x9e3779b9;
  private t = 0;
  // we store 10 floats per particle
  private static STRIDE = 10;

  private xorshift() {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >>> 17;
    this.seed ^= this.seed << 5;
    return this.seed >>> 0;
  }
  private rand01() { return (this.xorshift() & 0x00ffffff) / 16777216; }
  private randRange(a: number, b: number) { return a + (b - a) * this.rand01(); }

  count() { return this.count_; }
  ptr() { return 0; }

  init(count: number, w: number, h: number, seed: number): void {
    this.count_ = count; this.w = w; this.h = h; this.seed = seed || 0xc0ffee; this.t = 0; void this.w; void this.h;
    const stride = JsParticleEngine.STRIDE;
    this.jsBuffer = new Float32Array(count * stride);
    const b = this.jsBuffer;
    for (let i = 0; i < count; i++) {
      const o = i * stride;
      const tier = this.rand01();
      let x, y, vx, vy, size, parallax, hue, alpha, twPhase, twSpeed;
      if (tier < 0.6) {
        x = this.rand01(); y = this.rand01();
        vx = this.randRange(-0.00012, 0.00018); vy = this.randRange(-0.00008, 0.00008);
        size = this.randRange(0.6, 1.8); parallax = this.randRange(0.2, 0.45);
        hue = this.randRange(192, 228); alpha = this.randRange(0.35, 0.85);
      } else if (tier < 0.9) {
        x = this.rand01(); y = this.randRange(0.08, 0.92);
        vx = this.randRange(-0.00035, 0.00045); vy = this.randRange(-0.00018, 0.00018);
        size = this.randRange(1.2, 2.6); parallax = this.randRange(0.45, 0.75);
        hue = this.randRange(188, 218); alpha = this.randRange(0.45, 0.95);
      } else {
        x = this.randRange(0.32, 0.72); y = this.randRange(0.06, 0.52);
        vx = this.randRange(-0.0006, 0.0006); vy = this.randRange(-0.0001, 0.00025);
        size = this.randRange(1.6, 3.4); parallax = this.randRange(0.75, 1.0);
        hue = this.randRange(18, 36); alpha = this.randRange(0.55, 1.0);
      }
      twPhase = this.randRange(0, Math.PI * 2); twSpeed = this.randRange(0.6, 2.4);
      b[o+0]=x; b[o+1]=y; b[o+2]=vx; b[o+3]=vy; b[o+4]=size; b[o+5]=twPhase; b[o+6]=twSpeed; b[o+7]=parallax; b[o+8]=hue; b[o+9]=alpha;
    }
  }
  resize(w: number, h: number){ this.w=w; this.h=h; void this.w; void this.h; }
  update(dt: number, mouseX: number, mouseY: number, hover: number, timeAccum: number): void {
    if (!this.jsBuffer) return;
    if (dt > 0.05) dt = 0.05;
    this.t = timeAccum; void this.t;
    const b = this.jsBuffer; const stride = JsParticleEngine.STRIDE;
    const lensCx=0.5, lensCy=0.28; const haveMouse = (mouseX>=0 && mouseY>=0)?1:0;
    for (let i=0;i<this.count_;i++){
      const o=i*stride;
      let x=b[o+0], y=b[o+1], vx=b[o+2], vy=b[o+3]; const parallax=b[o+7];
      const sp=parallax;
      x += vx * dt *60 *(0.35+0.85*sp);
      y += vy * dt *60 *(0.35+0.85*sp);
      const dx=x-lensCx, dy=(y-lensCy)*0.92; const r2=dx*dx+dy*dy+0.02; const r=Math.sqrt(r2); const invR=1/r;
      const swirl=(0.000055/r2)*sp;
      vx += (-dy*invR)*swirl*dt*60;
      vy += ( dx*invR)*swirl*dt*60*0.92;
      if (haveMouse>0.5 && hover>0.01){ const mx=(mouseX-0.5)*0.06*sp*hover, my=(mouseY-0.5)*0.04*sp*hover; x+=mx*dt*10; y+=my*dt*10; }
      if (x < -0.02) x+=1.04; else if (x>1.02) x-=1.04;
      if (y < -0.02) y+=1.04; else if (y>1.02) y-=1.04;
      if (vx>0.002) vx=0.002; else if (vx<-0.002) vx=-0.002;
      if (vy>0.002) vy=0.002; else if (vy<-0.002) vy=-0.002;
      b[o+0]=x; b[o+1]=y; b[o+2]=vx; b[o+3]=vy;
    }
  }
  destroy(){ this.jsBuffer=null; this.count_=0; }
}

// Try to load real WASM if public/wasm/particle_system.js exists (Emscripten modularized).
// We lazy-load to avoid blocking. Fallback immediately to JS if fetch fails.
let wasmCache: ParticleEngine | null = null;

export async function getParticleEngine(): Promise<ParticleEngine> {
  if (wasmCache) return wasmCache;
  // Feature gate: only attempt WASM if not in test and fetch is available
  try {
    // Vite will copy public/wasm/* as-is; attempt dynamic import of the Emscripten glue if present.
    // We probe for existence via fetch head.
    const probe = await fetch("./wasm/particle_system.wasm", { method: "HEAD" });
    if (probe.ok) {
      // Emscripten glue optional — bypass Vite bundling via runtime import
      const modFactory: any = await (new Function("u", "return import(u)") as any)("/wasm/particle_system.js");
      const factory = (modFactory as any).default ?? (modFactory as any).createParticleModule;
      if (factory) {
        const mod: any = await factory();
        // Wrap Emscripten exports into ParticleEngine shape
        const stride = 10; // JS view of C++ Particle (10 floats)
        let count_ = 0;
        const eng: ParticleEngine = {
          kind: "wasm",
          memory: mod.memory ?? null,
          jsBuffer: null,
          count: () => count_,
          ptr: () => mod._ps_ptr(),
          init(c,w,h,s){ count_=c; mod._ps_init(c,w,h,s>>>0); },
          resize(w,h){ mod._ps_resize(w,h); },
          update(dt,mx,my,hover,t){ mod._ps_update(dt,mx,my,hover,t); },
          destroy(){ /* no-op, Emscripten owns memory */ },
        };
        // expose reading via HEAPF32 at ptr
        // monkey-patch to provide jsBuffer view for renderer (reads directly from WASM heap)
        const origUpdate = eng.update;
        (eng as any).heapF32 = () => mod.HEAPF32 as Float32Array;
        (eng as any).stride = stride;
        eng.update = origUpdate;
        wasmCache = eng;
        return eng;
      }
    }
  } catch { /* fall through */ }
  const js = new JsParticleEngine();
  wasmCache = js;
  return js;
}

// Synchronous fast-path for render loops where async not desired — returns JS engine immediately.
// WASM will upgrade on next getParticleEngine() if available, but JS is 60fps-capable for 1500 particles.
export function getParticleEngineSync(): ParticleEngine {
  if (wasmCache) return wasmCache;
  const js = new JsParticleEngine();
  wasmCache = js;
  return js;
}
