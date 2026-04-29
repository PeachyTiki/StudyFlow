// Generates icon-192.png and icon-512.png from the StudyFlow SVG design.
// Pure Node.js — no external dependencies.
const zlib = require('zlib');
const fs   = require('fs');

// ── CRC32 (required by PNG spec) ─────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const td  = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// ── Pixel renderer ────────────────────────────────────────────────────────────
function renderIcon(size) {
  const px = new Uint8Array(size * size * 4); // RGBA, initially transparent
  const sc = size / 512;

  function setBlend(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    const sa = a / 255, da = px[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    if (oa < 1e-6) return;
    px[i]     = Math.round((r * sa + px[i]     * da * (1 - sa)) / oa);
    px[i + 1] = Math.round((g * sa + px[i + 1] * da * (1 - sa)) / oa);
    px[i + 2] = Math.round((b * sa + px[i + 2] * da * (1 - sa)) / oa);
    px[i + 3] = Math.round(oa * 255);
  }

  function fillRR(sx, sy, sw, sh, srx, r, g, b, a = 255) {
    const x  = Math.round(sx * sc), y  = Math.round(sy * sc);
    const w  = Math.round(sw * sc), h  = Math.round(sh * sc);
    const rx = Math.max(1, Math.round(srx * sc));
    for (let py = y; py < y + h; py++) {
      for (let px2 = x; px2 < x + w; px2++) {
        let inside = true;
        const inLeft  = px2 < x + rx, inRight = px2 >= x + w - rx;
        const inTop   = py < y + rx,  inBot   = py >= y + h - rx;
        if (inLeft  && inTop)  { const dx=px2-(x+rx),      dy=py-(y+rx);      inside=dx*dx+dy*dy<=rx*rx; }
        if (inRight && inTop)  { const dx=px2-(x+w-rx-1),  dy=py-(y+rx);      inside=dx*dx+dy*dy<=rx*rx; }
        if (inLeft  && inBot)  { const dx=px2-(x+rx),      dy=py-(y+h-rx-1);  inside=dx*dx+dy*dy<=rx*rx; }
        if (inRight && inBot)  { const dx=px2-(x+w-rx-1),  dy=py-(y+h-rx-1); inside=dx*dx+dy*dy<=rx*rx; }
        if (inside) setBlend(px2, py, r, g, b, a);
      }
    }
  }

  // ── Draw layers (matches icon.svg exactly) ────────────────────────────────
  // 1. Background rounded rect  #0A0A0F  rx=80
  fillRR(  0,   0, 512, 512,  80,  10,  10,  15, 255);
  // 2. Book body  #7C6FFF  rx=20
  fillRR(110, 100, 292, 320,  20, 124, 111, 255, 255);
  // 3. Spine strip  #A78BFA  rx=9
  fillRR(110, 100,  18, 320,   9, 167, 139, 250, 255);
  // 4. Text lines (from SVG, scaled to size)
  //    full white
  fillRR(148, 158, 188,  22,  11, 255, 255, 255, 255);
  //    75% white
  fillRR(148, 200, 150,  16,   8, 255, 255, 255, 191);
  fillRR(148, 232, 170,  16,   8, 255, 255, 255, 191);
  //    55% white
  fillRR(148, 264, 130,  16,   8, 255, 255, 255, 140);
  fillRR(148, 296, 155,  16,   8, 255, 255, 255, 140);
  //    35% white
  fillRR(148, 328, 110,  16,   8, 255, 255, 255,  89);

  // ── Encode PNG ────────────────────────────────────────────────────────────
  const rows = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const off = y * (1 + size * 4);
    rows[off] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4, di = off + 1 + x * 4;
      rows[di] = px[si]; rows[di+1] = px[si+1]; rows[di+2] = px[si+2]; rows[di+3] = px[si+3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

for (const size of [192, 512]) {
  const buf = renderIcon(size);
  const out = `icon-${size}.png`;
  fs.writeFileSync(out, buf);
  console.log(`✓ ${out}  (${(buf.length / 1024).toFixed(1)} KB)`);
}
console.log('Icons generated.');
