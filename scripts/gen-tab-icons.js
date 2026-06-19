// Fast editorial tab bar icons — line-only drawing, no pixel loops
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const OUT = path.join(__dirname, '..', 'miniprogram', 'images');
const S = 81;

function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0); }
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(t, d) {
  const l = Buffer.alloc(4); l.writeUInt32BE(d.length);
  const tb = Buffer.from(t, 'ascii');
  const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(Buffer.concat([tb, d])));
  return Buffer.concat([l, tb, d, cr]);
}
function png(buf) {
  const rowLen = 1 + S * 4; // filter byte + RGBA pixels
  const raw = Buffer.alloc(S * rowLen);
  for (let y = 0; y < S; y++) {
    raw[y * rowLen] = 0;
    buf.copy(raw, y * rowLen + 1, y * S * 4, (y + 1) * S * 4);
  }
  const h = Buffer.alloc(13);
  h.writeUInt32BE(S, 0); h.writeUInt32BE(S, 4); h[8] = 8; h[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR',h), chunk('IDAT',zlib.deflateSync(raw)), chunk('IEND',Buffer.alloc(0))]);
}

function fresh() { return Buffer.alloc(S*S*4); }

// Simple line with thickness (multi-stroke)
function draw(buf, x1, y1, x2, y2, thick, r, g, b) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2-x1, y2-y1)));
  const hw = thick/2;
  const dx = x2-x1, dy = y2-y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy/len, ny = dx/len;
  for (let s = 0; s <= steps; s++) {
    const cx = x1 + dx*s/steps, cy = y1 + dy*s/steps;
    for (let tx = -hw; tx <= hw; tx += 0.6) {
      const px = Math.round(cx + nx*tx);
      const py = Math.round(cy + ny*tx);
      if (px>=0 && px<S && py>=0 && py<S) {
        const i = (py*S+px)*4;
        buf[i]=r; buf[i+1]=g; buf[i+2]=b; buf[i+3]=255;
      }
    }
  }
}

// N-gon approximation of circle
function ring(buf, cx, cy, rad, thick, r, g, b) {
  const n = 32;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = 2*Math.PI*i/n;
    pts.push([cx+rad*Math.cos(a), cy+rad*Math.sin(a)]);
  }
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i+1)%n];
    draw(buf, p1[0], p1[1], p2[0], p2[1], thick, r, g, b);
  }
}

function icon(hex, fn) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const buf = fresh();
  fn(buf, r, g, b);
  return png(buf);
}

function home(buf, r, g, b) {
  const t=4;
  draw(buf, 40, 14, 14, 37, t, r, g, b); // roof left
  draw(buf, 40, 14, 66, 37, t, r, g, b); // roof right
  draw(buf, 24, 37, 24, 68, t, r, g, b); // wall left
  draw(buf, 56, 37, 56, 68, t, r, g, b); // wall right
  draw(buf, 24, 68, 56, 68, t, r, g, b); // floor
  draw(buf, 14, 37, 24, 37, t*0.7, r, g, b); // eave left
  draw(buf, 66, 37, 56, 37, t*0.7, r, g, b); // eave right
  draw(buf, 50, 20, 50, 30, t*0.6, r, g, b); // chimney
  draw(buf, 50, 20, 56, 20, t*0.6, r, g, b);
  draw(buf, 56, 20, 56, 27, t*0.6, r, g, b);
}
function map(buf, r, g, b) {
  ring(buf, 40, 26, 13, 4, r, g, b);
  draw(buf, 16, 37, 40, 68, 4, r, g, b);
  draw(buf, 64, 37, 40, 68, 4, r, g, b);
}
function add(buf, r, g, b) {
  ring(buf, 40, 40, 26, 4, r, g, b);
  draw(buf, 40, 27, 40, 53, 4, r, g, b);
  draw(buf, 27, 40, 53, 40, 4, r, g, b);
}
function list(buf, r, g, b) {
  for (let i=0; i<3; i++) draw(buf, 20, 25+i*17, 61, 25+i*17, 4.5, r, g, b);
}
function mine(buf, r, g, b) {
  ring(buf, 40, 23, 12, 4, r, g, b);
  ring(buf, 40, 72, 24, 4, r, g, b);
}

const icons = [
  [home, 'tab-home'], [map, 'tab-map'], [add, 'tab-add'], [list, 'tab-list'], [mine, 'tab-mine']
];
const colors = [['', '#9E9688'], ['-active', '#C2674A']];

const bak = path.join(OUT, '..', 'images-bak');
if (!fs.existsSync(bak)) fs.mkdirSync(bak, {recursive:true});

for (const [fn, name] of icons) {
  for (const [suf, col] of colors) {
    const fname = `${name}${suf}.png`;
    const fp = path.join(OUT, fname);
    if (!fs.existsSync(path.join(bak, fname))) fs.copyFileSync(fp, path.join(bak, fname));
    fs.writeFileSync(fp, icon(col, fn));
    console.log('✓', fname);
  }
}
console.log('Done. Backups in images-bak/');
