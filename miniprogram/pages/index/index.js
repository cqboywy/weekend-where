const { getCollections, getCollectionStats } = require('../../utils/cloud.js');
const { CATEGORIES, generateCategoryCover } = require('../../utils/constants.js');
const { getGreeting, classifyQWeatherIcon } = require('../../utils/weather-greeting.js');

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
      // 获取位置（模糊即可，用于天气查询）
      const locRes = await new Promise((resolve, reject) => {
        wx.getLocation({ type: 'wgs84', success: resolve, fail: reject });
      });

      // 直接调用和风天气 API
      const API_KEY = 'cf0e3d6b987a4a7c806997656dc6b8ca';
      const { statusCode, data } = await new Promise((resolve, reject) => {
        wx.request({
          url: `https://devapi.qweather.com/v7/weather/now?location=${locRes.longitude},${locRes.latitude}&key=${API_KEY}`,
          method: 'GET',
          success: resolve,
          fail: reject,
        });
      });

      if (statusCode === 200 && data && data.code === '200' && data.now) {
        const weatherType = classifyQWeatherIcon(Number(data.now.icon));
        app.globalData._weatherCache = { weatherType, ts: Date.now() };
        this.setData({ greeting: getGreeting(hour, weatherType) });
        console.log('天气更新成功:', weatherType, data.now.text);
      } else {
        console.log('天气API返回异常:', statusCode, JSON.stringify(data));
        wx.showToast({ title: '天气API: ' + (data && data.code || statusCode), icon: 'none', duration: 3000 });
      }
    } catch (err) {
      const msg = err && (err.errMsg || err.message || JSON.stringify(err));
      console.log('天气获取失败，使用纯时间短语:', msg);
      wx.showToast({ title: '天气: ' + (msg || '未知').slice(0, 20), icon: 'none', duration: 3000 });
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
