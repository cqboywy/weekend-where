const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Build CRC table
const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = ((crc >>> 8) & 0x00FFFFFF) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crcBuf]);
}

// Build a PNG from RGBA pixel array
function buildPNG(width, height, pixels) {
  // Filter each row (filter byte 0 = None)
  const filtered = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    filtered[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      filtered[dst] = pixels[src];
      filtered[dst + 1] = pixels[src + 1];
      filtered[dst + 2] = pixels[src + 2];
      filtered[dst + 3] = pixels[src + 3];
    }
  }
  const compressed = zlib.deflateSync(filtered);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// Draw helpers
function createPixels(w, h) { return Buffer.alloc(w * h * 4, 0); }

function fillRect(pixels, w, x, y, rw, rh, r, g, b, a = 255) {
  for (let dy = Math.max(0, y); dy < Math.min(pixels.length / (w * 4), y + rh); dy++) {
    for (let dx = Math.max(0, x); dx < Math.min(w, x + rw); dx++) {
      const i = (dy * w + dx) * 4;
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a;
    }
  }
}

function fillCircle(pixels, w, cx, cy, radius, r, g, b, a = 255) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const px = cx + dx, py = cy + dy;
        if (px >= 0 && px < w && py >= 0 && py < w) {
          const i = (py * w + px) * 4;
          pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a;
        }
      }
    }
  }
}

const SIZE = 40;
const imagesDir = path.join(__dirname, '..', 'miniprogram', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Inactive: #9CA3AF = 156,163,175; Active: #1A56DB = 26,86,219
const INACTIVE = [156, 163, 175];
const ACTIVE = [26, 86, 219];

function makeIcon(drawFn, color) {
  const p = createPixels(SIZE, SIZE);
  drawFn(p, color[0], color[1], color[2]);
  return buildPNG(SIZE, SIZE, p);
}

// HOME icon - simple house shape
function drawHome(p, r, g, b) {
  // Roof
  fillRect(p, SIZE, 8, 10, 24, 6, r, g, b);
  fillRect(p, SIZE, 10, 13, 20, 4, r, g, b);
  fillRect(p, SIZE, 13, 16, 14, 3, r, g, b);
  // Body
  fillRect(p, SIZE, 10, 18, 20, 16, r, g, b);
  // Door
  fillRect(p, SIZE, 16, 24, 8, 10, 255, 255, 255);
}

// MAP pin icon
function drawPin(p, r, g, b) {
  fillCircle(p, SIZE, 20, 14, 9, r, g, b);
  fillRect(p, SIZE, 16, 20, 8, 12, r, g, b);
  fillRect(p, SIZE, 18, 30, 4, 4, r, g, b);
  fillRect(p, SIZE, 19, 33, 2, 3, r, g, b);
  fillCircle(p, SIZE, 20, 14, 4, 255, 255, 255);
}

// ADD icon - circle with plus
function drawAdd(p, r, g, b) {
  fillCircle(p, SIZE, 20, 20, 15, r, g, b);
  fillRect(p, SIZE, 9, 18, 22, 4, 255, 255, 255);
  fillRect(p, SIZE, 18, 9, 4, 22, 255, 255, 255);
}

// LIST icon - 4 squares in a grid
function drawList(p, r, g, b) {
  fillRect(p, SIZE, 7, 8, 10, 10, r, g, b);
  fillRect(p, SIZE, 23, 8, 10, 10, r, g, b);
  fillRect(p, SIZE, 7, 22, 10, 10, r, g, b);
  fillRect(p, SIZE, 23, 22, 10, 10, r, g, b);
}

// MINE icon - person silhouette
function drawMine(p, r, g, b) {
  fillCircle(p, SIZE, 20, 10, 7, r, g, b);
  fillCircle(p, SIZE, 20, 23, 11, r, g, b);
  fillRect(p, SIZE, 6, 23, 28, 14, 255, 255, 255);
  fillRect(p, SIZE, 8, 18, 24, 12, r, g, b);
}

const icons = [
  ['tab-home.png', drawHome],
  ['tab-map.png', drawPin],
  ['tab-add.png', drawAdd],
  ['tab-list.png', drawList],
  ['tab-mine.png', drawMine],
];

icons.forEach(([name, drawFn]) => {
  fs.writeFileSync(path.join(imagesDir, name), makeIcon(drawFn, INACTIVE));
  const activeName = name.replace('.png', '-active.png');
  fs.writeFileSync(path.join(imagesDir, activeName), makeIcon(drawFn, ACTIVE));
  console.log('Created: ' + name + ' + ' + activeName);
});

// Regenerate default-cover and marker-food with new colors
const cover = createPixels(750, 500);
fillRect(cover, 750, 0, 0, 750, 500, 248, 249, 251);
fs.writeFileSync(path.join(imagesDir, 'default-cover.png'), buildPNG(750, 500, cover));
console.log('Created: default-cover.png');

const marker = createPixels(36, 36);
fillCircle(marker, 36, 18, 12, 10, 26, 86, 219);
fillRect(marker, 36, 14, 18, 8, 14, 26, 86, 219);
fillRect(marker, 36, 16, 28, 4, 5, 26, 86, 219);
fillRect(marker, 36, 17, 32, 2, 4, 26, 86, 219);
fillCircle(marker, 36, 18, 12, 5, 255, 255, 255);
fs.writeFileSync(path.join(imagesDir, 'marker-food.png'), buildPNG(36, 36, marker));
console.log('Created: marker-food.png');

console.log('All v3 icons generated!');
