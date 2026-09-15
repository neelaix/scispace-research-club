import { useCallback } from "react";
import { getImageProcessorSync } from "./imageProcessor";

/**
 * WASM image helpers hook — C++ box blur / downsample runs in WASM when built,
 * otherwise JS fallback (same API). Used for gallery progressive placeholders
 * without blocking the main thread per-pixel loops in JS.
 */
export function useWasmImage() {
  const blur = useCallback((rgba: Uint8ClampedArray, w: number, h: number, r: number) => {
    const p = getImageProcessorSync();
    // copy to avoid mutating original if caller wants
    const copy = new Uint8ClampedArray(rgba);
    p.boxBlur(copy, w, h, r);
    return copy;
  }, []);
  const thumb = useCallback((src: Uint8ClampedArray, sw: number, sh: number) => {
    const p = getImageProcessorSync();
    const dw = sw >> 1, dh = sh >> 1;
    const dst = new Uint8ClampedArray(dw * dh * 4);
    p.downsample2x(src, sw, sh, dst);
    return { data: dst, w: dw, h: dh };
  }, []);
  return { blur, thumb };
}
