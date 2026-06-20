const { getCollectionStats, getTagStats } = require('../../utils/cloud.js');

Page({
  data: { stats: null, loading: true, tagStats: [], displayTagStats: [], showAllTags: false },
  onShow() { this.loadStats(); this.loadTagStats(); },
  async loadStats() {
    this.setData({ loading: true });
    const result = await getCollectionStats();
    if (result.success) { this.setData({ stats: result.data, loading: false }); }
    else { this.setData({ loading: false }); }
  },
  async loadTagStats() {
    const result = await getTagStats();
    if (result.success) {
      this.setData({ tagStats: result.data, displayTagStats: result.data.slice(0, 10) });
    }
  },
  onExport() { wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' }); },
  onAbout() {
    wx.showModal({ title: '周末去哪儿', content: 'v1.2\n聚合你的美食与游玩灵感\n告别周末选择困难', showCancel: false });
  },
  onManageCategories() { wx.navigateTo({ url: '/pages/category-manage/category-manage' }); },
  onManageTags() { wx.navigateTo({ url: '/pages/tag-manage/tag-manage' }); },
  onFeedback() { wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' }); },

  onTapStat(e) {
    const status = e.currentTarget.dataset.status;
    const app = getApp();
    if (status) {
      app.globalData.statusFilter = status;
    } else {
      delete app.globalData.statusFilter;
    }
    wx.switchTab({ url: '/pages/list/list' });
  },

  onTapStatTag(e) {
    const tag = e.currentTarget.dataset.tag;
    getApp().globalData.tagFilter = tag;
    wx.switchTab({ url: '/pages/list/list' });
  },

  onToggleShowAllTags() {
    const show = !this.data.showAllTags;
    this.setData({
      showAllTags: show,
      displayTagStats: show ? this.data.tagStats : this.data.tagStats.slice(0, 10),
    });
  },
});
