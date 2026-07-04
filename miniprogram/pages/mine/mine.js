const { getCollectionStats, getTagStats, updateUserNickname, getAllUsers } = require('../../utils/cloud.js');
const { ADMIN_OPENID } = require('../../utils/constants.js');

Page({
  data: { stats: null, loading: true, tagStats: [], displayTagStats: [], showAllTags: false, isAdmin: false, userNickname: '', nicknameEditing: false },
  async onShow() {
    const app = getApp();

    // Wait for openid if not yet resolved (app just launched)
    if (!app.globalData.openid && app.getOpenIdPromise) {
      await app.getOpenIdPromise;
    }
    this.setData({ isAdmin: app.globalData.openid === ADMIN_OPENID });
    console.log('[mine] admin check: current=' + app.globalData.openid + ' configured=' + ADMIN_OPENID + ' match=' + (app.globalData.openid === ADMIN_OPENID));
    this.loadNickname();
    this.loadStats(); this.loadTagStats();
  },
  async loadNickname() {
    // Check if we have a stored nickname for this user
    const all = await getAllUsers();
    if (all.success) {
      const me = all.data.find(u => u.userId === getApp().globalData.openid);
      if (me && me.nickname) {
        this.setData({ userNickname: me.nickname });
      }
    }
  },
  onNicknameTap() {
    this.setData({ nicknameEditing: true });
  },
  async onNicknameBlur(e) {
    const nick = (e.detail && e.detail.value || '').trim();
    this.setData({ nicknameEditing: false });
    if (nick && nick !== this.data.userNickname) {
      this.setData({ userNickname: nick });
      const app = getApp();
      if (app.globalData.openid) {
        await updateUserNickname(app.globalData.openid, nick);
      }
    }
  },
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
  onUserManagement() { wx.navigateTo({ url: '/pages/user-list/user-list' }); },
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
