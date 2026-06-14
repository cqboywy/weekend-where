const CATEGORIES = [
  { key: 'hotpot', label: '🍲 火锅', icon: '🍲' },
  { key: 'barbecue', label: '🥩 烧烤', icon: '🥩' },
  { key: 'chinese', label: '🥢 中餐', icon: '🥢' },
  { key: 'japanese', label: '🍣 日料', icon: '🍣' },
  { key: 'korean', label: '🇰🇷 韩餐', icon: '🇰🇷' },
  { key: 'western', label: '🍝 西餐', icon: '🍝' },
  { key: 'cafe', label: '☕ 咖啡', icon: '☕' },
  { key: 'dessert', label: '🍰 甜品', icon: '🍰' },
  { key: 'street', label: '🍢 小吃', icon: '🍢' },
  { key: 'bar', label: '🍸 酒吧', icon: '🍸' },
  { key: 'park', label: '🌳 公园', icon: '🌳' },
  { key: 'museum', label: '🏛️ 博物馆', icon: '🏛️' },
  { key: 'shopping', label: '🛍️ 逛街', icon: '🛍️' },
  { key: 'sports', label: '⚽ 运动', icon: '⚽' },
  { key: 'entertainment', label: '🎮 娱乐', icon: '🎮' },
  { key: 'other', label: '📌 其他', icon: '📌' },
];

const PLATFORMS = [
  { key: 'xiaohongshu', label: '小红书', color: '#FF2442' },
  { key: 'douyin', label: '抖音', color: '#000000' },
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
  bg: '#F8F9FA',
  primary: '#FF6B35',
  accent: '#2EC4B6',
  accentPink: '#EF476F',
  yellow: '#FFD166',
  text: '#212529',
  textLight: '#6C757D',
  white: '#FFFFFF',
  border: '#E9ECEF',
};

module.exports = { CATEGORIES, PLATFORMS, STATUS, COLORS };
