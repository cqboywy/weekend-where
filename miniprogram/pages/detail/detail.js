const { getCollectionDetail, updateCollectionItem, deleteCollectionItem, addToNextGo, removeFromNextGo } = require('../../utils/cloud.js');
const { CATEGORIES, STATUS, generateCategoryCover } = require('../../utils/constants.js');
const { getRouteDistance, getUserLocation } = require('../../utils/util.js');

Page({
  data: { item: null, loading: true, categoryInfo: null, statusLabel: '', displayCover: '', distanceText: '' },

  onLoad(options) {
    if (options.id) { this.loadDetail(options.id); }
    else { wx.showToast({ title: '参数错误', icon: 'none' }); setTimeout(() => wx.navigateBack(), 1500); }
  },

  async loadDetail(id) {
    const result = await getCollectionDetail(id);
    if (result.success && result.data) {
      const item = result.data;
      // Use dynamic categories for BOTH info lookup and cover
      const app = getApp();
      const cats = (app.globalData.categories && app.globalData.categories.length > 0)
        ? app.globalData.categories
        : CATEGORIES;
      const categoryInfo = cats.find(c => c.key === item.category) || cats.find(c => c.key === 'other') || { key: 'other', label: '其他', color: '#B5A595' };
      const statusLabel = STATUS.find(s => s.key === item.status)?.label || '';

      // Convert cloud file ID to temp URL so it's accessible to shared visitors
      let displayCover = item.coverImage || '';
      if (displayCover && displayCover.startsWith('cloud://')) {
        try {
          const tmpRes = await wx.cloud.getTempFileURL({ fileList: [displayCover] });
          displayCover = (tmpRes.fileList && tmpRes.fileList[0] && tmpRes.fileList[0].tempFileURL) || displayCover;
        } catch (e) { /* keep original */ }
      }
      if (!displayCover) {
        displayCover = generateCategoryCover(categoryInfo.color || '#B5A595');
      }

      // Compute distance from current location
      let distanceText = '';
      if (item.location && item.location.latitude && item.location.longitude) {
        const userLoc = await getUserLocation();
        if (userLoc) {
          distanceText = await getRouteDistance(
            userLoc.latitude, userLoc.longitude,
            item.location.latitude, item.location.longitude
          );
        }
      }

      this.setData({ item, categoryInfo, statusLabel, displayCover, distanceText, loading: false });
    } else {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  async onToggleNextGo() {
    const item = this.data.item;
    const isInPlan = item.nextGo;
    const res = isInPlan ? await removeFromNextGo(item._id) : await addToNextGo(item._id);
    if (res.success) {
      getApp().globalData.listNeedsRefresh = true;
      this.setData({ 'item.nextGo': !isInPlan });
      wx.showToast({ title: isInPlan ? '已移出' : '已加入「计划去」', icon: 'success' });
    }
  },

  async onToggleStatus() {
    const newStatus = this.data.item.status === 'want_to_go' ? 'visited' : 'want_to_go';
    const result = await updateCollectionItem(this.data.item._id, { status: newStatus });
    if (result.success) {
      getApp().globalData.listNeedsRefresh = true;
      const statusLabel = STATUS.find(s => s.key === newStatus).label;
      this.setData({ 'item.status': newStatus, statusLabel });
      wx.showToast({ title: `已标记为「${statusLabel}」`, icon: 'success' });
    }
  },

  onNavigate() {
    const { location } = this.data.item;
    if (!location || !location.latitude) { wx.showToast({ title: '未设置位置信息', icon: 'none' }); return; }
    wx.openLocation({ latitude: location.latitude, longitude: location.longitude, name: location.name || this.data.item.title, address: location.address || '', scale: 16 });
  },

  onEdit() {
    const app = getApp();
    app.globalData.editItemId = this.data.item._id;
    wx.switchTab({ url: '/pages/add/add' });
  },

  onCopyNote() {
    if (this.data.item.note) {
      wx.setClipboardData({
        data: this.data.item.note,
        success: () => { wx.showToast({ title: '备注已复制', icon: 'success' }); }
      });
    }
  },

  onOpenOriginal() {
    if (this.data.item.originalUrl) {
      wx.setClipboardData({
        data: this.data.item.originalUrl,
        success: () => { wx.showModal({ title: '链接已复制', content: '请在浏览器中打开查看原文', showCancel: false }); }
      });
    }
  },

  async onDelete() {
    const res = await new Promise(r => { wx.showModal({ title: '确认删除', content: `确定删除「${this.data.item.title}」吗？`, success: r }); });
    if (!res.confirm) return;
    const result = await deleteCollectionItem(this.data.item._id);
    if (result.success) { getApp().globalData.listNeedsRefresh = true; wx.showToast({ title: '已删除', icon: 'success' }); setTimeout(() => wx.navigateBack(), 1500); }
  },

  onShareAppMessage() {
    const { item, displayCover } = this.data;
    return {
      title: `周末去哪儿 — ${item.title}`,
      path: `/pages/detail/detail?id=${item._id}`,
      imageUrl: displayCover || '',
    };
  },
});
