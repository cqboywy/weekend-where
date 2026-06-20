const { getTagStats, renameTagInCollections, removeTagFromAllCollections } = require('../../utils/cloud.js');

Page({
  data: {
    tags: [],
    loading: true,
    // Modal
    showModal: false,
    modalTitle: '',
    editingTag: '',
    formName: '',
    saving: false,
    // Delete confirm
    deletingTag: '',
  },

  onShow() {
    this.loadTags();
  },

  async loadTags() {
    this.setData({ loading: true });
    const res = await getTagStats();
    if (res.success) {
      this.setData({ tags: res.data, loading: false });
    } else {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // ── Edit ──
  onEdit(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({
      showModal: true,
      modalTitle: '编辑标签',
      editingTag: tag,
      formName: tag,
    });
  },

  onNameInput(e) {
    this.setData({ formName: e.detail.value });
  },

  closeModal() {
    this.setData({ showModal: false, editingTag: '', formName: '' });
  },

  async onSave() {
    const { formName, editingTag } = this.data;
    const name = formName.trim();
    if (!name) {
      wx.showToast({ title: '请输入标签名', icon: 'none' });
      return;
    }
    if (name === editingTag) {
      this.closeModal();
      return;
    }

    this.setData({ saving: true });
    const res = await renameTagInCollections(editingTag, name);
    this.setData({ saving: false });

    if (res.success) {
      wx.showToast({ title: `已更新 ${res.updated} 个收藏`, icon: 'success' });
      this.closeModal();
      this.loadTags();
    } else {
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  // ── Delete ──
  onDelete(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({ deletingTag: tag });
    wx.showModal({
      title: '删除标签',
      content: `确定删除「${tag}」标签吗？将从 ${this.getTagCount(tag)} 个收藏中移除。`,
      success: async (res) => {
        if (!res.confirm) return;
        const result = await removeTagFromAllCollections(tag);
        if (result.success) {
          wx.showToast({ title: `已从 ${result.updated} 个收藏移除`, icon: 'success' });
          this.loadTags();
        } else {
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      },
    });
  },

  getTagCount(tag) {
    const found = this.data.tags.find(t => t.tag === tag);
    return found ? found.count : 0;
  },

  onTapTag(e) {
    const tag = e.currentTarget.dataset.tag;
    getApp().globalData.tagFilter = tag;
    wx.switchTab({ url: '/pages/list/list' });
  },
});
