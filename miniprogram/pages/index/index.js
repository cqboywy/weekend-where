const { getCollections, getCollectionStats } = require('../../utils/cloud.js');
const { CATEGORIES, generateCategoryCover } = require('../../utils/constants.js');

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
    const hour = new Date().getHours();
    let greeting;
    if (hour < 6) greeting = '夜深人静';
    else if (hour < 9) greeting = '晨光熹微';
    else if (hour < 12) greeting = '天朗气清';
    else if (hour < 14) greeting = '日正当中';
    else if (hour < 18) greeting = '日影西斜';
    else greeting = '暮色四合';
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`;
    this.setData({ greeting, currentDate: dateStr });
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
