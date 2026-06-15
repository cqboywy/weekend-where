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

// Category-specific default cover photos (picsum.photos seeded, stable images)
// IMPORTANT: Add "picsum.photos" to WeChat request domain whitelist in mp admin panel
const CATEGORY_COVERS = {
  hotpot:     'https://picsum.photos/seed/hotpot-food/400/440',
  barbecue:   'https://picsum.photos/seed/bbq-grill/400/440',
  chinese:    'https://picsum.photos/seed/chinese-cuisine/400/440',
  japanese:   'https://picsum.photos/seed/sushi-japan/400/440',
  korean:     'https://picsum.photos/seed/korean-bbq/400/440',
  western:    'https://picsum.photos/seed/pasta-italian/400/440',
  cafe:       'https://picsum.photos/seed/coffee-cafe/400/440',
  dessert:    'https://picsum.photos/seed/dessert-cake/400/440',
  street:     'https://picsum.photos/seed/street-food/400/440',
  bar:        'https://picsum.photos/seed/cocktail-bar/400/440',
  park:       'https://picsum.photos/seed/park-garden/400/440',
  museum:     'https://picsum.photos/seed/museum-art/400/440',
  shopping:   'https://picsum.photos/seed/shopping-retail/400/440',
  sports:     'https://picsum.photos/seed/sports-field/400/440',
  entertainment: 'https://picsum.photos/seed/arcade-games/400/440',
  other:      'https://picsum.photos/seed/food-drink/400/440',
};

module.exports = { CATEGORIES, PLATFORMS, STATUS, COLORS, CATEGORY_COVERS };
