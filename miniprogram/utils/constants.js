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

const PLATFORMS = [
  { key: 'xiaohongshu', label: '小红书', color: '#FF3B4A' },
  { key: 'douyin', label: '抖音', color: '#1A1A1A' },
  { key: 'bilibili', label: 'B站', color: '#FB7299' },
  { key: 'dianping', label: '大众点评', color: '#FF9F0A' },
  { key: 'wechat', label: '微信', color: '#07C160' },
  { key: 'other', label: '其他', color: '#999999' },
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

// Category-specific default cover — rich SVG with icon-like geometric patterns
// Each gradient uses a distinct 2-color palette + a centered decorative circle ring
// No external deps, no domain whitelist needed, renders instantly
const CATEGORY_COVERS = {
  hotpot:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#F06B5A"/><stop offset="100%" stop-color="#C0392B"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  barbecue:   'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#F09050"/><stop offset="100%" stop-color="#D4642A"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  chinese:    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#E8483A"/><stop offset="100%" stop-color="#9B1B1C"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  japanese:   'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#8CB59A"/><stop offset="100%" stop-color="#4A7C59"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  korean:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#EB7585"/><stop offset="100%" stop-color="#C44258"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  western:    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#A07858"/><stop offset="100%" stop-color="#6B3F1F"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  cafe:       'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#B8957D"/><stop offset="100%" stop-color="#7B6152"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  dessert:    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#F2B5C0"/><stop offset="100%" stop-color="#D48495"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  street:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#F5B040"/><stop offset="100%" stop-color="#D4891A"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  bar:        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#7B6A8A"/><stop offset="100%" stop-color="#4A3D5C"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  park:       'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#7BA88A"/><stop offset="100%" stop-color="#4A7C59"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  museum:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#9DABBD"/><stop offset="100%" stop-color="#62708C"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  shopping:   'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#EC9580"/><stop offset="100%" stop-color="#D06750"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  sports:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#6BAADD"/><stop offset="100%" stop-color="#3B7BB5"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  entertainment: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#AB80C5"/><stop offset="100%" stop-color="#7B4DA0"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
  other:      'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#C8B8A8"/><stop offset="100%" stop-color="#9B8B7D"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>'),
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
 * Generate a dynamic category cover SVG data URI from a single color.
 * Produces a radial gradient + 3 concentric circle rings, matching the
 * visual language of the hardcoded CATEGORY_COVERS.
 * @param {string} color - primary hex color (e.g. "#E8533F")
 * @returns {string} data:image/svg+xml URI
 */
function generateCategoryCover(color) {
  const dark = darkenHex(color, 0.35);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="' + color + '"/><stop offset="100%" stop-color="' + dark + '"/></radialGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><circle cx="200" cy="200" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

module.exports = { CATEGORIES, PLATFORMS, STATUS, COLORS, CATEGORY_COLORS, CATEGORY_COVERS, generateCategoryCover, darkenHex };
