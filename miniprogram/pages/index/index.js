const { getCollections, getCollectionStats } = require('../../utils/cloud.js');
const { CATEGORIES, generateCategoryCover } = require('../../utils/constants.js');
const { getGreeting } = require('../../utils/weather-greeting.js');

Page({
  data: {
    featuredItem: null,
    recentItems: [],
    loading: true,
    greeting: '',
    currentDate: '',
  },

  onLoad() { this.setGreeting(); this.loadData(); },
  onShow() { this.loadData(); },

  setGreeting() {
    const now = new Date();
    const hour = now.getHours();

    // 先设纯时间短语，天气拿到后更新
    const fallbackGreeting = getGreeting(hour, null);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`;
    this.setData({ greeting: fallbackGreeting, currentDate: dateStr });

    // 异步获取天气
    this.fetchWeatherAndUpdate(hour);
  },

  async fetchWeatherAndUpdate(hour) {
    const app = getApp();

    // 检查缓存（30 分钟 TTL）
    if (app.globalData._weatherCache) {
      const { weatherType, ts } = app.globalData._weatherCache;
      if (Date.now() - ts < 30 * 60 * 1000) {
        this.setData({ greeting: getGreeting(hour, weatherType) });
        return;
      }
    }

    try {
      // 获取位置
      const locRes = await new Promise((resolve, reject) => {
        wx.getLocation({ type: 'wgs84', success: resolve, fail: reject });
      });

      // 调用云函数
      const { result } = await wx.cloud.callFunction({
        name: 'getWeather',
        data: { lat: locRes.latitude, lon: locRes.longitude },
      });

      if (result && result.success && result.data) {
        const { weatherType } = result.data;

        // 缓存
        app.globalData._weatherCache = { weatherType, ts: Date.now() };

        this.setData({ greeting: getGreeting(hour, weatherType) });
      }
      // 失败静默回退 — 已经显示了纯时间短语
    } catch (err) {
      console.log('天气获取失败，使用纯时间短语:', err && err.errMsg || err);
      // 已经显示了 fallback 短语，无需额外处理
    }
  },

  async loadData() {
    this.setData({ loading: true });

    const app = getApp();
    const cats = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;

    const [recentResult, statsResult] = await Promise.all([
      getCollections({ limit: 30 }),
      getCollectionStats(),
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

      this.setData({
        featuredItem: enrich(featuredItem),
        recentItems: rest.map(enrich),
        loading: false,
      });
    } else {
      this.setData({
        featuredItem: null,
        recentItems: [],
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

  onGoAdd() { wx.switchTab({ url: '/pages/add/add' }); },
  onGoList() { wx.switchTab({ url: '/pages/list/list' }); },
});
