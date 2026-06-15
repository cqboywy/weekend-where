const CATEGORIES = [
  { key: 'hotpot', label: '火锅', icon: 'tag' },
  { key: 'barbecue', label: '烧烤', icon: 'tag' },
  { key: 'chinese', label: '中餐', icon: 'tag' },
  { key: 'japanese', label: '日料', icon: 'tag' },
  { key: 'korean', label: '韩餐', icon: 'tag' },
  { key: 'western', label: '西餐', icon: 'tag' },
  { key: 'cafe', label: '咖啡', icon: 'tag' },
  { key: 'dessert', label: '甜品', icon: 'tag' },
  { key: 'street', label: '小吃', icon: 'tag' },
  { key: 'bar', label: '酒吧', icon: 'tag' },
  { key: 'park', label: '公园', icon: 'tag' },
  { key: 'museum', label: '博物馆', icon: 'tag' },
  { key: 'shopping', label: '逛街', icon: 'tag' },
  { key: 'sports', label: '运动', icon: 'tag' },
  { key: 'entertainment', label: '娱乐', icon: 'tag' },
  { key: 'other', label: '其他', icon: 'tag' },
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

module.exports = { CATEGORIES, PLATFORMS, STATUS, COLORS, CATEGORY_COVERS };
