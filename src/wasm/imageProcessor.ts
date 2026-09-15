// src/wasm/imageProcessor.ts
// WASM image helpers loader — mirrors wasm/src/image_processor.cpp
// JS fallback uses tight loops with typed arrays (cache-friendly, no per-pixel alloc).

export type ImageProcessor = {
  kind: "wasm" | "js";
  boxBlur(rgba: Uint8ClampedArray, w: number, h: number, radius: number): void;
  downsample2x(src: Uint8ClampedArray, sw: number, sh: number, dst: Uint8ClampedArray): void;
  histogramLuma(rgba: Uint8ClampedArray, w: number, h: number, out64: Int32Array): void;
};

class JsImageProcessor implements ImageProcessor {
  kind: "wasm" | "js" = "js";
  boxBlur(rgba: Uint8ClampedArray, w: number, h: number, radius: number): void {
    if (radius <= 0) return;
    if (radius > 16) radius = 16;
    const n = w*h;
    const tmp = new Uint8ClampedArray(n*4);
    // horizontal
    for (let y=0;y<h;y++){
      for (let x=0;x<w;x++){
        let r=0,g=0,b=0,a=0,cnt=0;
        for (let k=-radius;k<=radius;k++){
          let sx = x+k; if (sx<0) sx=0; else if (sx>=w) sx=w-1;
          const o=(y*w+sx)*4; r+=rgba[o]; g+=rgba[o+1]; b+=rgba[o+2]; a+=rgba[o+3]; cnt++;
        }
        const d=(y*w+x)*4; tmp[d]=r/cnt; tmp[d+1]=g/cnt; tmp[d+2]=b/cnt; tmp[d+3]=a/cnt;
      }
    }
    for (let y=0;y<h;y++){
      for (let x=0;x<w;x++){
        let r=0,g=0,b=0,a=0,cnt=0;
        for (let k=-radius;k<=radius;k++){
          let sy=y+k; if (sy<0) sy=0; else if (sy>=h) sy=h-1;
          const o=(sy*w+x)*4; r+=tmp[o]; g+=tmp[o+1]; b+=tmp[o+2]; a+=tmp[o+3]; cnt++;
        }
        const d=(y*w+x)*4; rgba[d]=r/cnt; rgba[d+1]=g/cnt; rgba[d+2]=b/cnt; rgba[d+3]=a/cnt;
      }
    }
  }
  downsample2x(src: Uint8ClampedArray, sw:number, sh:number, dst: Uint8ClampedArray): void {
    const dw=sw>>1, dh=sh>>1;
    for (let y=0;y<dh;y++) for(let x=0;x<dw;x++){
      const sx=x*2, sy=y*2;
      const p00=((sy)*sw+sx)*4, p01=p00+4, p10=((sy+1)*sw+sx)*4, p11=p10+4;
      const d=(y*dw+x)*4;
      dst[d]= (src[p00]+src[p01]+src[p10]+src[p11])>>2;
      dst[d+1]=(src[p00+1]+src[p01+1]+src[p10+1]+src[p11+1])>>2;
      dst[d+2]=(src[p00+2]+src[p01+2]+src[p10+2]+src[p11+2])>>2;
      dst[d+3]=(src[p00+3]+src[p01+3]+src[p10+3]+src[p11+3])>>2;
    }
  }
  histogramLuma(rgba: Uint8ClampedArray, w:number, h:number, out64:Int32Array): void {
    out64.fill(0);
    const n=w*h;
    for(let i=0;i<n;i++){ const o=i*4; const y=(54*rgba[o]+183*rgba[o+1]+18*rgba[o+2])>>8; let b=(y*64)>>8; if(b<0)b=0; else if(b>=64)b=63; out64[b]++; }
  }
}

let cache: ImageProcessor | null = null;
export async function getImageProcessor(): Promise<ImageProcessor>{
  if(cache) return cache;
  try{
    const probe = await fetch("./wasm/image_processor.wasm",{method:"HEAD"});
    if(probe.ok){
      // optional Emscripten glue, bypass Vite bundling
      const modFactory: any = await (new Function("u", "return import(u)") as any)("/wasm/image_processor.js");
      const factory = (modFactory as any).default ?? (modFactory as any).createImageModule;
      if(factory){
        const mod:any = await factory();
        const eng: ImageProcessor = {
          kind:"wasm",
          boxBlur(rgba,w,h,r){ const ptr=mod._malloc(rgba.length); mod.HEAPU8.set(rgba,ptr); mod._img_box_blur(ptr,w,h,r); rgba.set(mod.HEAPU8.subarray(ptr,ptr+rgba.length)); mod._free(ptr); },
          downsample2x(src,sw,sh,dst){ const pS=mod._malloc(src.length), pD=mod._malloc(dst.length); mod.HEAPU8.set(src,pS); mod._img_downsample_2x(pS,sw,sh,pD); dst.set(mod.HEAPU8.subarray(pD,pD+dst.length)); mod._free(pS); mod._free(pD); },
          histogramLuma(rgba,w,h,out){ const pR=mod._malloc(rgba.length), pH=mod._malloc(64*4); mod.HEAPU8.set(rgba,pR); mod._img_histogram_luma(pR,w,h,pH); const view = new Int32Array(mod.HEAPU8.buffer, pH, 64); out.set(view as any); mod._free(pR); mod._free(pH); },
        };
        cache=eng; return eng;
      }
    }
  }catch{}
  const js=new JsImageProcessor(); cache=js; return js;
}
export function getImageProcessorSync(): ImageProcessor {
  if(cache) return cache;
  const js=new JsImageProcessor(); cache=js; return js;
}
