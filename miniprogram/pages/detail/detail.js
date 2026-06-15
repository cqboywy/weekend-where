const { getCollectionDetail, updateCollectionItem, deleteCollectionItem } = require('../../utils/cloud.js');
const { CATEGORIES, PLATFORMS, STATUS, CATEGORY_COVERS } = require('../../utils/constants.js');

Page({
  data: { item: null, loading: true, categoryInfo: null, platformInfo: null, statusLabel: '', displayCover: '' },

  onLoad(options) {
    if (options.id) { this.loadDetail(options.id); }
    else { wx.showToast({ title: '参数错误', icon: 'none' }); setTimeout(() => wx.navigateBack(), 1500); }
  },

  async loadDetail(id) {
    const result = await getCollectionDetail(id);
    if (result.success && result.data) {
      const item = result.data;
      const categoryInfo = CATEGORIES.find(c => c.key === item.category);
      const platformInfo = PLATFORMS.find(p => p.key === item.platform);
      const statusLabel = STATUS.find(s => s.key === item.status)?.label || '';
      const displayCover = item.coverImage || (CATEGORY_COVERS[item.category] || CATEGORY_COVERS['other']);
      this.setData({ item, categoryInfo, platformInfo, statusLabel, displayCover, loading: false });
    } else {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  async onToggleStatus() {
    const newStatus = this.data.item.status === 'want_to_go' ? 'visited' : 'want_to_go';
    const result = await updateCollectionItem(this.data.item._id, { status: newStatus });
    if (result.success) {
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
    const item = this.data.item;
    const params = [
      `id=${item._id}`,
      `title=${encodeURIComponent(item.title || '')}`,
      `category=${item.category || ''}`,
      `platform=${item.platform || ''}`,
      `rating=${item.rating || 0}`,
      `note=${encodeURIComponent(item.note || '')}`,
      `status=${item.status || 'want_to_go'}`,
    ];
    if (item.location && item.location.name) {
      params.push(`locName=${encodeURIComponent(item.location.name)}`);
      params.push(`locAddr=${encodeURIComponent(item.location.address || '')}`);
      params.push(`lat=${item.location.latitude || 0}`);
      params.push(`lng=${item.location.longitude || 0}`);
    }
    if (item.tags && item.tags.length > 0) {
      params.push(`tags=${encodeURIComponent(item.tags.join(','))}`);
    }
    if (item.originalUrl) {
      params.push(`url=${encodeURIComponent(item.originalUrl)}`);
    }
    wx.navigateTo({ url: `/pages/add/add?edit=1&${params.join('&')}` });
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
    if (result.success) { wx.showToast({ title: '已删除', icon: 'success' }); setTimeout(() => wx.navigateBack(), 1500); }
  },

  onShareAppMessage() {
    return { title: `周末去哪儿 — ${this.data.item.title}`, path: `/pages/detail/detail?id=${this.data.item._id}`, imageUrl: this.data.item.coverImage || '' };
  },
});
