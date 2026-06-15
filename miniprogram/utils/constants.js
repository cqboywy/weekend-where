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

// Category-specific default cover gradients (refined, no-emoji, pure color)
const CATEGORY_COVERS = {
  hotpot:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8533F"/><stop offset="100%" stop-color="#C0392B"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  barbecue:   'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F0854B"/><stop offset="100%" stop-color="#D4642A"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  chinese:    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D4383A"/><stop offset="100%" stop-color="#8B1A1C"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  japanese:   'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7BA587"/><stop offset="100%" stop-color="#4A7C59"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  korean:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E85D75"/><stop offset="100%" stop-color="#C44258"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  western:    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8B5E3C"/><stop offset="100%" stop-color="#6B3F1F"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  cafe:       'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A0846B"/><stop offset="100%" stop-color="#7B6152"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  dessert:    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F2A7B3"/><stop offset="100%" stop-color="#D48495"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  street:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F5A623"/><stop offset="100%" stop-color="#D4891A"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  bar:        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6C5B7B"/><stop offset="100%" stop-color="#4A3D5C"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  park:       'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6B9B7A"/><stop offset="100%" stop-color="#4A7C59"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  museum:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8E9AAF"/><stop offset="100%" stop-color="#62708C"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  shopping:   'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8876A"/><stop offset="100%" stop-color="#D06750"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  sports:     'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#5B9BD5"/><stop offset="100%" stop-color="#3B7BB5"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  entertainment: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9B6DB5"/><stop offset="100%" stop-color="#7B4DA0"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
  other:      'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#B8A89A"/><stop offset="100%" stop-color="#9B8B7D"/></linearGradient></defs><rect width="400" height="440" fill="url(#g)"/><circle cx="200" cy="220" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/></svg>'),
};

module.exports = { CATEGORIES, PLATFORMS, STATUS, COLORS, CATEGORY_COVERS };
