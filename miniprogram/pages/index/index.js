const { getCollections, getCollectionStats, removeFromNextGo } = require('../../utils/cloud.js');
const { CATEGORIES, generateCategoryCover } = require('../../utils/constants.js');
const { getGreeting, classifyWmoCode } = require('../../utils/weather-greeting.js');

const CHINESE_NUMS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const CHINESE_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatChineseDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = date.getDay();

  const yearStr = String(y).split('').map(ch => '〇一二三四五六七八九'[Number(ch)]).join('');
  const monthStr = CHINESE_NUMS[m];
  let dayStr;
  if (d <= 10) dayStr = CHINESE_NUMS[d];
  else if (d < 20) dayStr = '十' + CHINESE_NUMS[d - 10];
  else if (d === 20) dayStr = '二十';
  else if (d < 30) dayStr = '二十' + CHINESE_NUMS[d - 20];
  else if (d === 30) dayStr = '三十';
  else dayStr = '三十一';
  const weekStr = '星期' + CHINESE_DAYS[w];

  return `${yearStr}年${monthStr}月${dayStr}日 · ${weekStr}`;
}

Page({
  data: {
    featuredItem: null,
    recentItems: [],
    nextGoItems: [],
    loading: true,
    greeting: '',
    currentDate: '',
    weatherDetail: '',
  },

  onLoad() { this.setGreeting(); this.loadData(); },
  onShow() { this.loadData(); },

  setGreeting() {
    const now = new Date();
    const hour = now.getHours();

    // 先设纯时间短语，天气拿到后更新
    const fallbackGreeting = getGreeting(hour, null);
    const dateStr = formatChineseDate(now);
    this.setData({ greeting: fallbackGreeting, currentDate: dateStr });

    // 异步获取天气
    this.fetchWeatherAndUpdate(hour);
  },

  async fetchWeatherAndUpdate(hour) {
    const app = getApp();

    // 检查缓存（30 分钟 TTL）
    if (app.globalData._weatherCache) {
      const { weatherType, ts, temp } = app.globalData._weatherCache;
      if (Date.now() - ts < 30 * 60 * 1000) {
        this.setData({ greeting: getGreeting(hour, weatherType), weatherDetail: temp != null ? temp + '°C' : '' });
        return;
      }
    }

    try {
      const locRes = await new Promise((resolve, reject) => {
        wx.getLocation({ type: 'wgs84', success: resolve, fail: reject });
      });

      // Open-Meteo 免费天气 API（WMO 天气码，无需 Key）
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${locRes.latitude}&longitude=${locRes.longitude}&current_weather=true`;
      const res = await new Promise((resolve, reject) => {
        wx.request({ url, method: 'GET', success: resolve, fail: reject });
      });

      if (res.statusCode === 200 && res.data && res.data.current_weather) {
        const cw = res.data.current_weather;
        const weatherType = classifyWmoCode(cw.weathercode);
        const temp = Math.round(cw.temperature);
        app.globalData._weatherCache = { weatherType, temp, ts: Date.now() };
        this.setData({
          greeting: getGreeting(hour, weatherType),
          weatherDetail: temp + '°C',
        });
      }
    } catch (err) {
      console.log('天气获取失败:', err && err.errMsg || err);
    }
  },

  async loadData() {
    this.setData({ loading: true });

    const app = getApp();
    const cats = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;

    const [recentResult, statsResult, weekendResult] = await Promise.all([
      getCollections({ limit: 30 }),
      getCollectionStats(),
      getCollections({ nextGo: true, limit: 50 }),
    ]);

    if (recentResult.success && recentResult.data.length > 0) {
      const all = recentResult.data;

      // Random featured pick
      const featuredIdx = Math.floor(Math.random() * all.length);
      const featuredItem = all[featuredIdx];

      // Rest for masonry (exclude featured, limit 20)
      const rest = all.filter((_, i) => i !== featuredIdx).slice(0, 20);

      // Attach category color/label + pre-computed cover to each item
      const enrich = (item) => {
        const cat = cats.find(c => c.key === item.category) || cats.find(c => c.key === 'other') || {};
        const color = cat.color || '#E8876A';
        return {
          ...item,
          catColor: color,
          catBg: color + '1A',
          catLabel: cat.label || '其他',
          displayCover: item.coverImage || generateCategoryCover(color),
        };
      };

      // 先清空再赋值，强制微信 image 组件重载，避免缓存串位
      const newFeatured = enrich(featuredItem);
      const enrichedRest = rest.map(enrich);
      const enrichedNextGo = (weekendResult.success ? weekendResult.data : []).map(enrich);
      this.setData({ featuredItem: null });
      setTimeout(() => {
        this.setData({
          featuredItem: newFeatured,
          recentItems: enrichedRest,
          nextGoItems: enrichedNextGo,
          loading: false,
        });
      }, 50);
    } else {
      this.setData({
        featuredItem: null,
        recentItems: [],
        nextGoItems: (weekendResult.success ? weekendResult.data : []).map(enrich),
        loading: false,
      });
    }
  },

  onViewFeatured() {
    const item = this.data.featuredItem;
    if (item && item._id) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${item._id}` });
    }
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
    }
  },

  onViewNextGo(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  async onRemoveNextGo(e) {
    const id = e.currentTarget.dataset.id;
    const res = await removeFromNextGo(id);
    if (res.success) {
      wx.showToast({ title: '已移出', icon: 'success' });
      const items = this.data.nextGoItems.filter(item => item._id !== id);
      this.setData({ nextGoItems: items });
    }
  },

  onGoAdd() { wx.switchTab({ url: '/pages/add/add' }); },
  onGoList() { wx.switchTab({ url: '/pages/list/list' }); },
});
