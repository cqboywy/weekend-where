const CATEGORIES = [
  { key: 'hotpot', label: '火锅', icon: 'tag', color: '#E8533F' },
  { key: 'barbecue', label: '烧烤', icon: 'tag', color: '#F0854B' },
  { key: 'chinese', label: '中餐', icon: 'tag', color: '#D9403A' },
  { key: 'japanese', label: '日料', icon: 'tag', color: '#7BA587' },
  { key: 'korean', label: '韩餐', icon: 'tag', color: '#E0707D' },
  { key: 'western', label: '西餐', icon: 'tag', color: '#9B6E4A' },
  { key: 'cafe', label: '咖啡', icon: 'tag', color: '#B08870' },
  { key: 'dessert', label: '甜品', icon: 'tag', color: '#E8A0AD' },
  { key: 'street', label: '小吃', icon: 'tag', color: '#EAA838' },
  { key: 'bar', label: '酒吧', icon: 'tag', color: '#726080' },
  { key: 'park', label: '公园', icon: 'tag', color: '#6EA07A' },
  { key: 'museum', label: '博物馆', icon: 'tag', color: '#95A3B5' },
  { key: 'shopping', label: '逛街', icon: 'tag', color: '#E28870' },
  { key: 'sports', label: '运动', icon: 'tag', color: '#5D9DD5' },
  { key: 'entertainment', label: '娱乐', icon: 'tag', color: '#A075C0' },
  { key: 'other', label: '其他', icon: 'tag', color: '#B5A595' },
];

// Preset color palette for category manager color picker
const CATEGORY_COLORS = [
  '#E8533F', '#F0854B', '#D9403A', '#7BA587', '#E0707D',
  '#9B6E4A', '#B08870', '#E8A0AD', '#EAA838', '#726080',
  '#6EA07A', '#95A3B5', '#E28870', '#5D9DD5', '#A075C0',
  '#B5A595', '#6EB5C0', '#D4A070', '#8899AA', '#C09B6E',
];

const STATUS = [
  { key: 'want_to_go', label: '想去' },
  { key: 'visited', label: '去过' },
];

const COLORS = {
  bg: '#FEF9F3',
  text: '#3D2B1F',
  primary: '#E8876A',
  primarySoft: '#FFF0E8',
  surface: '#FFF3EB',
  border: '#F2E2D5',
  accent: '#F0A050',
  accentSoft: '#FFF6ED',
  white: '#FFFFFF',
  success: '#7CB889',
  danger: '#D4735E',
  muted: '#B8A89A',
};

/**
 * Darken a hex color by a given factor (0-1).
 * @param {string} hex - e.g. "#E8533F"
 * @param {number} amount - 0.3 = darken by 30%
 * @returns {string} darkened hex color
 */
function darkenHex(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = 1 - amount;
  const rr = Math.floor(r * factor);
  const gg = Math.floor(g * factor);
  const bb = Math.floor(b * factor);
  return '#' + [rr, gg, bb].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a category cover SVG with a gradient base + 4 semi-transparent
 * "light-spot" ellipses (Spotify / Apple Music style).  Spot layout is
 * deterministic per colour so every category looks unique without needing
 * any pre-defined icon or font.
 * @param {string} color - primary hex color (e.g. "#E8533F")
 * @returns {string} data:image/svg+xml URI
 */
function generateCategoryCover(color) {
  const dark = darkenHex(color, 0.35);

  // Deterministic seed from the 3 RGB channels
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const seed = r * 65536 + g * 256 + b;
  // Simple Mulberry32 PRNG
  let state = seed;
  function rand() {
    state |= 0; state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // 4 light-spot ellipses
  let spots = '';
  for (let i = 0; i < 4; i++) {
    const cx = 30 + rand() * 340;
    const cy = 30 + rand() * 380;
    const rx = 45 + rand() * 110;
    const ry = 35 + rand() * 85;
    const rot = Math.round(rand() * 360);
    const opacity = (0.06 + rand() * 0.10).toFixed(3);
    spots += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
      '" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' +
      ' fill="rgba(255,255,255,' + opacity + ')" />';
  }

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="' + color + '"/><stop offset="100%" stop-color="' + dark + '"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/>' + spots + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

module.exports = { CATEGORIES, STATUS, COLORS, CATEGORY_COLORS, generateCategoryCover, darkenHex };
