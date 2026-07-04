const { getAllUsers } = require('../../utils/cloud.js');
const { ADMIN_OPENID } = require('../../utils/constants.js');

Page({
  data: {
    users: [],
    loading: true,
  },

  onShow() {
    const app = getApp();
    if (app.globalData.openid !== ADMIN_OPENID) {
      wx.showToast({ title: '无权限访问', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.loadUsers();
  },

  async loadUsers() {
    this.setData({ loading: true });
    const res = await getAllUsers();
    if (res.success) {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activeCount = res.data.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > monthAgo).length;

      const users = res.data
        .sort((a, b) => new Date(a.firstLoginAt) - new Date(b.firstLoginAt))
        .map((u, i) => ({
          label: '用户 ' + (i + 1),
          collectionCount: u.collectionCount || 0,
          lastLogin: this.formatTime(u.lastLoginAt),
          firstLogin: this.formatTime(u.firstLoginAt),
        }));

      this.setData({ users, totalCount: users.length, activeCount, loading: false });
    } else {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  formatTime(isoString) {
    if (!isoString) return '--';
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },
});
