const { getCategories, addCategory, updateCategory, deleteCategory, getCategoryItemCount } = require('../../utils/cloud.js');
const { CATEGORY_COLORS } = require('../../utils/constants.js');

Page({
  data: {
    categories: [],
    loading: true,
    // Modal state
    showModal: false,
    modalTitle: '',
    editingId: null,
    formName: '',
    formColor: CATEGORY_COLORS[0],
    presetColors: CATEGORY_COLORS,
    saving: false,
  },

  onShow() {
    this.loadCategories();
  },

  async loadCategories() {
    this.setData({ loading: true });
    const res = await getCategories();
    if (res.success) {
      // Load item counts for each category
      const cats = await Promise.all(res.data.map(async (cat) => {
        const countRes = await getCategoryItemCount(cat.key);
        return { ...cat, itemCount: countRes.success ? countRes.count : 0 };
      }));
      this.setData({ categories: cats, loading: false });
      // Sync to globalData
      const app = getApp();
      app.globalData.categories = res.data;
    } else {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onTapCategory(e) {
    const catKey = e.currentTarget.dataset.category;
    getApp().globalData.categoryFilter = catKey;
    wx.switchTab({ url: '/pages/list/list' });
  },

  // ---- Modal handlers ----

  onAdd() {
    this.setData({
      showModal: true,
      modalTitle: '添加分类',
      editingId: null,
      formName: '',
      formColor: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)],
    });
  },

  onEdit(e) {
    const cat = e.currentTarget.dataset.category;
    this.setData({
      showModal: true,
      modalTitle: '编辑分类',
      editingId: cat._id,
      formName: cat.label,
      formColor: cat.color,
    });
  },

  onPickColor(e) {
    this.setData({ formColor: e.currentTarget.dataset.color });
  },

  onNameInput(e) {
    this.setData({ formName: e.detail.value });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  async onSave() {
    const { formName, formColor, editingId } = this.data;
    const name = formName.trim();
    if (!name) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' });
      return;
    }
    if (name.length > 10) {
      wx.showToast({ title: '名称不超过10个字', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    // Check for duplicate name (case-insensitive)
    const existing = this.data.categories.find(
      c => c.label === name && c._id !== editingId
    );
    if (existing) {
      this.setData({ saving: false });
      wx.showToast({ title: '该分类名称已存在', icon: 'none' });
      return;
    }

    if (editingId) {
      // Update existing
      const res = await updateCategory(editingId, { label: name, color: formColor });
      if (res.success) {
        wx.showToast({ title: '已更新', icon: 'success' });
        this.closeModal();
        this.loadCategories();
      } else {
        wx.showToast({ title: '更新失败', icon: 'none' });
      }
    } else {
      // Add new — generate a unique key
      const key = 'custom_' + Date.now().toString(36);
      const maxOrder = this.data.categories.reduce((max, c) => Math.max(max, c.order || 0), 0);
      const res = await addCategory({
        key,
        label: name,
        icon: 'tag',
        color: formColor,
        isDefault: false,
        order: maxOrder + 1,
      });
      if (res.success) {
        wx.showToast({ title: '已添加', icon: 'success' });
        this.closeModal();
        this.loadCategories();
      } else {
        wx.showToast({ title: '添加失败', icon: 'none' });
      }
    }

    this.setData({ saving: false });
  },

  // ---- Delete ----

  async onDelete(e) {
    const cat = e.currentTarget.dataset.category;

    // Prevent deleting categories that are in use
    if (cat.itemCount > 0) {
      wx.showModal({
        title: '无法删除',
        content: `「${cat.label}」分类下有 ${cat.itemCount} 个收藏，请先移走这些收藏后再删除。`,
        showCancel: false,
      });
      return;
    }

    const res = await new Promise(r => {
      wx.showModal({
        title: '确认删除',
        content: `确定删除「${cat.label}」分类吗？`,
        success: r,
      });
    });
    if (!res.confirm) return;

    const delRes = await deleteCategory(cat._id);
    if (delRes.success) {
      wx.showToast({ title: '已删除', icon: 'success' });
      this.loadCategories();
    } else {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  // Prevent modal background tap from closing
  onModalBgTap() {
    // Do nothing — only the cancel button closes
  },
});
