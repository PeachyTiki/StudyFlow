// Reads the uploaded icon, produces icon-192.png + icon-512.png, no dependencies.
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── CRC32 ─────────────────────────────────────────────────────────────────────
const CRC = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const td = Buffer.concat([Buffer.from(type), data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// ── PNG decoder (handles RGB + RGBA source) ───────────────────────────────────
function decodePNG(buf) {
  const SIG = [137,80,78,71,13,10,26,10];
  for (let i = 0; i < 8; i++) if (buf[i] !== SIG[i]) throw new Error('Not a valid PNG');
  let pos = 8, w, h, bDepth, cType;
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); pos += 4;
    const type = buf.slice(pos, pos+4).toString(); pos += 4;
    const data = buf.slice(pos, pos+len); pos += len + 4;
    if (type === 'IHDR') { w=data.readUInt32BE(0);h=data.readUInt32BE(4);bDepth=data[8];cType=data[9]; }
    else if (type === 'IDAT') idats.push(data);
    else if (type === 'IEND') break;
  }
  const raw   = zlib.inflateSync(Buffer.concat(idats));
  const bpp   = cType === 6 ? 4 : cType === 2 ? 3 : 4;
  const stride = w * bpp;
  const out   = new Uint8Array(w * h * 4);
  const prev  = new Uint8Array(stride);
  function pa(a,b,c){const p=a+b-c;const qa=Math.abs(p-a),qb=Math.abs(p-b),qc=Math.abs(p-c);return qa<=qb&&qa<=qc?a:qb<=qc?b:c}
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[rp++];
    const row = new Uint8Array(stride);
    for (let x = 0; x < stride; x++) {
      const v=raw[rp++], a=x>=bpp?row[x-bpp]:0, b=prev[x], c=x>=bpp?prev[x-bpp]:0;
      row[x]=ft===0?v:ft===1?(v+a)&0xff:ft===2?(v+b)&0xff:ft===3?(v+Math.floor((a+b)/2))&0xff:(v+pa(a,b,c))&0xff;
    }
    for (let x = 0; x < w; x++) {
      const pi=(y*w+x)*4;
      if (cType===6) { out[pi]=row[x*4];out[pi+1]=row[x*4+1];out[pi+2]=row[x*4+2];out[pi+3]=row[x*4+3]; }
      else           { out[pi]=row[x*3];out[pi+1]=row[x*3+1];out[pi+2]=row[x*3+2];out[pi+3]=255; }
    }
    prev.set(row);
  }
  return { w, h, px: out };
}

// ── Bilinear resize ───────────────────────────────────────────────────────────
function resize(src, sw, sh, dw, dh) {
  const dst = new Uint8Array(dw * dh * 4);
  const xr = sw / dw, yr = sh / dh;
  for (let dy = 0; dy < dh; dy++) {
    for (let dx = 0; dx < dw; dx++) {
      const sx=dx*xr, sy=dy*yr;
      const x0=Math.min(Math.floor(sx),sw-1), y0=Math.min(Math.floor(sy),sh-1);
      const x1=Math.min(x0+1,sw-1),           y1=Math.min(y0+1,sh-1);
      const xf=sx-x0, yf=sy-y0;
      const di=(dy*dw+dx)*4;
      for (let c=0;c<4;c++) {
        const a=src[(y0*sw+x0)*4+c], b=src[(y0*sw+x1)*4+c];
        const p=src[(y1*sw+x0)*4+c], q=src[(y1*sw+x1)*4+c];
        dst[di+c]=Math.round(a*(1-xf)*(1-yf)+b*xf*(1-yf)+p*(1-xf)*yf+q*xf*yf);
      }
    }
  }
  return dst;
}

// ── PNG encoder ───────────────────────────────────────────────────────────────
function encodePNG(px, w, h) {
  const rows = Buffer.alloc(h * (1 + w * 4));
  for (let y=0;y<h;y++) {
    const off=y*(1+w*4); rows[off]=0;
    for (let x=0;x<w;x++) {
      const si=(y*w+x)*4, di=off+1+x*4;
      rows[di]=px[si];rows[di+1]=px[si+1];rows[di+2]=px[si+2];rows[di+3]=px[si+3];
    }
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),
    chunk('IDAT',zlib.deflateSync(rows,{level:9})),
    chunk('IEND',Buffer.alloc(0))
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, 'UPLOAD_ICON_HERE');
const srcFile   = fs.readdirSync(uploadDir).find(f => /\.(png|jpg|jpeg)$/i.test(f));
if (!srcFile) { console.error('No icon found in UPLOAD_ICON_HERE/'); process.exit(1); }

console.log(`Source: ${srcFile}`);
const { w, h, px } = decodePNG(fs.readFileSync(path.join(uploadDir, srcFile)));
console.log(`  Size: ${w}×${h}`);

// 512×512
const p512 = (w===512&&h===512) ? px : resize(px,w,h,512,512);
fs.writeFileSync(path.join(__dirname,'icon-512.png'), encodePNG(p512,512,512));
console.log('  ✓ icon-512.png');

// 192×192
const p192 = resize(px,w,h,192,192);
fs.writeFileSync(path.join(__dirname,'icon-192.png'), encodePNG(p192,192,192));
console.log('  ✓ icon-192.png');

console.log('Done.');
