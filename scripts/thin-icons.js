// Thin lucide icon strokes from 2 → 1.5 for editorial refinement
const fs = require('fs');
const path = require('path');

const iconsPath = path.join(__dirname, '..', 'miniprogram', 'components', 'lucide-icon', 'icons-data.js');
let content = fs.readFileSync(iconsPath, 'utf8');

// Each line looks like: "name": "data:image/svg+xml;base64,PAYLOAD",
// We need to decode the base64 payload, modify the SVG, re-encode.
const re = /"([^"]+)":\s*"data:image\/svg\+xml;base64,([^"]+)"/g;
let count = 0;

content = content.replace(re, (match, name, b64) => {
  const svg = Buffer.from(b64, 'base64').toString('utf8');
  // Replace stroke-width="2" with stroke-width="1.5"
  const modified = svg.replace(/stroke-width="2"/g, 'stroke-width="1.5"');
  const newB64 = Buffer.from(modified, 'utf8').toString('base64');
  count++;
  return `"${name}": "data:image/svg+xml;base64,${newB64}"`;
});

fs.writeFileSync(iconsPath, content, 'utf8');
console.log(`Thinned ${count} icons. stroke-width 2 → 1.5`);
