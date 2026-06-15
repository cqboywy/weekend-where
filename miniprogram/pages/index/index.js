const { getCollections, getCollectionStats } = require('../../utils/cloud.js');

Page({
  data: { recentItems: [], stats: null, loading: true, greeting: '', currentDate: '' },

  onLoad() { this.setGreeting(); this.loadData(); },
  onShow() { this.loadData(); },

  setGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 6) greeting = '夜深了';
    else if (hour < 9) greeting = '早上好';
    else if (hour < 12) greeting = '上午好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`;
    this.setData({ greeting, currentDate: dateStr });
  },

  async loadData() {
    this.setData({ loading: true });
    const [recentResult, statsResult] = await Promise.all([
      getCollections({ limit: 6 }),
      getCollectionStats(),
    ]);
    this.setData({
      recentItems: recentResult.success ? recentResult.data : [],
      stats: statsResult.success ? statsResult.data : null,
      loading: false,
    });
  },

  onGoAdd() { wx.switchTab({ url: '/pages/add/add' }); },
  onGoList(e) {
    const category = e.currentTarget.dataset.category || '';
    wx.switchTab({ url: '/pages/list/list' });
    if (category) { getApp().globalData.listFilter = category; }
  },
  onGoMap() { wx.switchTab({ url: '/pages/map/map' }); },
  onViewDetail(e) {
    const item = e.detail && e.detail.item;
    if (!item || !item._id) return;
    wx.navigateTo({ url: `/pages/detail/detail?id=${item._id}` });
  },
});
