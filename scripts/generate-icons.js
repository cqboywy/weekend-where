// Generate minimal 40x40 orange PNG icons for tab bar
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createMinimalPNG(width, height, r, g, b, a = 255) {
  // Create raw RGBA image data
  const rawData = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rawData[i * 4] = r;
    rawData[i * 4 + 1] = g;
    rawData[i * 4 + 2] = b;
    rawData[i * 4 + 3] = a;
  }

  // Filter and compress each row
  const filtered = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    filtered[y * (1 + width * 4)] = 0; // filter: None
    rawData.copy(filtered, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(filtered);

  // Build PNG file
  const chunks = [];

  // PNG Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  chunks.push(createChunk('IHDR', ihdr));

  // IDAT
  chunks.push(createChunk('IDAT', compressed));

  // IEND
  chunks.push(createChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

const imagesDir = path.join(__dirname, '..', 'miniprogram', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Tab icons (40x40)
const icons = [
  // Default state (brown #8B7355)
  ['tab-home.png', 139, 115, 85],
  ['tab-map.png', 139, 115, 85],
  ['tab-add.png', 139, 115, 85],
  ['tab-list.png', 139, 115, 85],
  ['tab-mine.png', 139, 115, 85],
  // Active state (orange #FF9A56)
  ['tab-home-active.png', 255, 154, 86],
  ['tab-map-active.png', 255, 154, 86],
  ['tab-add-active.png', 255, 154, 86],
  ['tab-list-active.png', 255, 154, 86],
  ['tab-mine-active.png', 255, 154, 86],
];

icons.forEach(([name, r, g, b]) => {
  const png = createMinimalPNG(40, 40, r, g, b);
  fs.writeFileSync(path.join(imagesDir, name), png);
  console.log('Created: ' + name);
});

// Default cover (750x500, light cream)
const cover = createMinimalPNG(750, 500, 255, 248, 240);
fs.writeFileSync(path.join(imagesDir, 'default-cover.png'), cover);
console.log('Created: default-cover.png');

// Marker icon (36x36, orange)
const marker = createMinimalPNG(36, 36, 255, 154, 86);
fs.writeFileSync(path.join(imagesDir, 'marker-food.png'), marker);
console.log('Created: marker-food.png');

console.log('All icons generated!');
