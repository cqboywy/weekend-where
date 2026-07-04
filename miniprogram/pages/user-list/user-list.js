const { getAllUsers } = require('../../utils/cloud.js');
const { ADMIN_OPENID } = require('../../utils/constants.js');

Page({
  data: {
    users: [],
    loading: true,
  },

  onShow() {
    // Admin gate — only allow the configured admin openid
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
      const users = res.data.map(u => ({
        ...u,
        // Short display id from openid (first 4 + last 4 chars)
        shortId: u.userId ? (u.userId.slice(0, 6) + '…' + u.userId.slice(-4)) : '--',
        firstLogin: this.formatTime(u.firstLoginAt),
        lastLogin: this.formatTime(u.lastLoginAt),
      }));
      this.setData({ users, loading: false });
    } else {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  formatTime(isoString) {
    if (!isoString) return '--';
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },
});
