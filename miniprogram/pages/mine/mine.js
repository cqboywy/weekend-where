const { getCollectionStats } = require('../../utils/cloud.js');

Page({
  data: { stats: null, loading: true },
  onShow() { this.loadStats(); },
  async loadStats() {
    this.setData({ loading: true });
    const result = await getCollectionStats();
    if (result.success) { this.setData({ stats: result.data, loading: false }); }
    else { this.setData({ loading: false }); }
  },
  onExport() { wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' }); },
  onAbout() {
    wx.showModal({ title: '周末去哪儿', content: 'v1.0.0\n聚合你的美食与游玩灵感\n告别周末选择困难', showCancel: false });
  },
  onManageCategories() { wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' }); },
  onFeedback() { wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' }); },
});
