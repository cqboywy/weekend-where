// Convert Lucide SVGs to PNG tab bar icons + copy SVGs for inline use
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LUCIDE_DIR = path.join(__dirname, '..', 'node_modules', 'lucide-static', 'icons');
const IMAGES_DIR = path.join(__dirname, '..', 'miniprogram', 'images');
const ICONS_DIR = path.join(__dirname, '..', 'miniprogram', 'icons');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

// Tab bar icon mapping: [tabName, lucideIcon]
const TAB_ICONS = [
  ['tab-home', 'house'],
  ['tab-map', 'map-pin'],
  ['tab-add', 'plus-circle'],
  ['tab-list', 'layout-grid'],
  ['tab-mine', 'user'],
];

const INACTIVE = '#B5AEA5';
const ACTIVE = '#8C9A84';
const SIZE = 80; // generate at 2x for retina

async function generateTabIcon(lucideName, outputName, color) {
  const svgPath = path.join(LUCIDE_DIR, `${lucideName}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error(`MISSING: ${svgPath}`);
    return;
  }

  // Read SVG and inject color
  let svg = fs.readFileSync(svgPath, 'utf8');
  svg = svg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
  svg = svg.replace(/stroke-width="[^"]*"/g, 'stroke-width="1.5"');

  await sharp(Buffer.from(svg))
    .resize(SIZE, SIZE)
    .png()
    .toFile(path.join(IMAGES_DIR, `${outputName}.png`));

  console.log(`Generated: ${outputName}.png (${color})`);
}

async function generateAll() {
  for (const [outputName, lucideName] of TAB_ICONS) {
    await generateTabIcon(lucideName, outputName, INACTIVE);
    await generateTabIcon(lucideName, `${outputName}-active`, ACTIVE);
  }

  // Copy inline SVG icons to miniprogram/icons/
  const INLINE_ICONS = [
    ...TAB_ICONS.map(([, name]) => name),
    'search', 'star', 'navigation', 'share', 'tag',
    'download', 'message-circle', 'info', 'chevron-right',
    'arrow-right', 'plus', 'x', 'check',
  ];

  for (const name of [...new Set(INLINE_ICONS)]) {
    const src = path.join(LUCIDE_DIR, `${name}.svg`);
    const dest = path.join(ICONS_DIR, `${name}.svg`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied: icons/${name}.svg`);
    }
  }

  console.log('\nDONE! All Lucide icons generated.');
}

generateAll().catch(console.error);
