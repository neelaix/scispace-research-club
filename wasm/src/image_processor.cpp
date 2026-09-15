// wasm/src/image_processor.cpp
// Fast image helpers for gallery — blur, downsample, luminance histogram.
// Used to generate blurred placeholders, dominant color and histogram for smooth 60fps transitions.
// All ops are O(N) on raw RGBA bytes and avoid JS per-pixel loops.
//
// Build:
//   emcc wasm/src/image_processor.cpp -O3 -s WASM=1 \
//     -s EXPORTED_FUNCTIONS='["_img_box_blur","_img_downsample_2x","_img_histogram_luma","_malloc","_free"]' \
//     -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME="createImageModule" \
//     -o public/wasm/image_processor.js
//
// JS fallback in src/wasm/imageProcessor.ts mirrors these exports.

#include <emscripten/emscripten.h>
#include <cstdint>
#include <cstring>
#include <algorithm>

extern "C" {

// In-place separable box blur (radius 1..16). Stride = width*4. Border = clamp.
EMSCRIPTEN_KEEPALIVE
void img_box_blur(uint8_t* rgba, int w, int h, int radius) {
  if (!rgba || w <= 0 || h <= 0 || radius <= 0) return;
  if (radius > 16) radius = 16;
  const int n = w * h;
  // temp line buffers
  uint8_t* tmp = (uint8_t*)malloc(n * 4);
  if (!tmp) return;

  // horizontal pass
  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      int r=0,g=0,b=0,a=0, cnt=0;
      for (int k = -radius; k <= radius; ++k) {
        int sx = x + k;
        if (sx < 0) sx = 0; else if (sx >= w) sx = w-1;
        uint8_t* p = rgba + (y * w + sx) * 4;
        r += p[0]; g += p[1]; b += p[2]; a += p[3]; cnt++;
      }
      uint8_t* d = tmp + (y * w + x) * 4;
      d[0]= r/cnt; d[1]= g/cnt; d[2]= b/cnt; d[3]= a/cnt;
    }
  }
  // vertical pass back into rgba
  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      int r=0,g=0,b=0,a=0,cnt=0;
      for (int k = -radius; k <= radius; ++k) {
        int sy = y + k;
        if (sy < 0) sy = 0; else if (sy >= h) sy = h-1;
        uint8_t* p = tmp + (sy * w + x) * 4;
        r += p[0]; g += p[1]; b += p[2]; a += p[3]; cnt++;
      }
      uint8_t* d = rgba + (y * w + x) * 4;
      d[0]= r/cnt; d[1]= g/cnt; d[2]= b/cnt; d[3]= a/cnt;
    }
  }
  free(tmp);
}

// Downsample 2x with 2x2 box filter: src W*H -> dst (W/2)*(H/2). Returns void, writes to dst.
EMSCRIPTEN_KEEPALIVE
void img_downsample_2x(const uint8_t* src, int sw, int sh, uint8_t* dst) {
  if (!src || !dst) return;
  int dw = sw / 2, dh = sh / 2;
  for (int y = 0; y < dh; ++y) {
    for (int x = 0; x < dw; ++x) {
      int sx = x*2, sy = y*2;
      const uint8_t* p00 = src + ((sy+0)*sw + sx+0)*4;
      const uint8_t* p01 = src + ((sy+0)*sw + sx+1)*4;
      const uint8_t* p10 = src + ((sy+1)*sw + sx+0)*4;
      const uint8_t* p11 = src + ((sy+1)*sw + sx+1)*4;
      uint8_t* d = dst + (y*dw + x)*4;
      d[0] = (p00[0]+p01[0]+p10[0]+p11[0]) >> 2;
      d[1] = (p00[1]+p01[1]+p10[1]+p11[1]) >> 2;
      d[2] = (p00[2]+p01[2]+p10[2]+p11[2]) >> 2;
      d[3] = (p00[3]+p01[3]+p10[3]+p11[3]) >> 2;
    }
  }
}

// 64-bin luma histogram (Rec.709). hist must be 64 * int32.
EMSCRIPTEN_KEEPALIVE
void img_histogram_luma(const uint8_t* rgba, int w, int h, int32_t* hist64) {
  if (!rgba || !hist64) return;
  for (int i=0;i<64;++i) hist64[i]=0;
  int n = w*h;
  for (int i=0;i<n;++i) {
    const uint8_t* p = rgba + i*4;
    // luma ~ 0.2126 R + 0.7152 G + 0.0722 B
    int y = (54 * p[0] + 183 * p[1] + 18 * p[2]) >> 8;
    int bin = (y * 64) >> 8;
    if (bin < 0) bin=0; else if (bin>=64) bin=63;
    hist64[bin]++;
  }
}

} // extern C
