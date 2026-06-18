const { getCollections, deleteCollectionItem, updateCollectionItem } = require('../../utils/cloud.js');
const { CATEGORIES, STATUS } = require('../../utils/constants.js');

Page({
  data: {
    items: [], loading: true, hasMore: true, skip: 0, refreshTriggered: false,
    categories: [{ key: '', label: '全部' }, ...CATEGORIES],
    activeCategory: '', activeStatus: '', keyword: '', showSearch: false, searchValue: '',
    sortBy: 'time', showSortMenu: false,
    actionItem: null, showActionSheet: false,
  },

  onLoad() {
    this.initCategories();
    // Check for status filter preset from home page stats tap
    const app = getApp();
    if (app.globalData.statusFilter) {
      this.setData({ activeStatus: app.globalData.statusFilter });
      delete app.globalData.statusFilter;
    }
    this.loadData(true);
  },

  onShow() {
    this.initCategories();
    const app = getApp();
    // Handle tag filter from mine page
    if (app.globalData.tagFilter) {
      const tag = app.globalData.tagFilter;
      delete app.globalData.tagFilter;
      this.setData({ showSearch: true, searchValue: tag, keyword: tag });
      this.loadData(true);
      return;
    }
    // Re-check on each show in case user navigates back
    if (app.globalData.statusFilter && app.globalData.statusFilter !== this.data.activeStatus) {
      this.setData({ activeStatus: app.globalData.statusFilter });
      delete app.globalData.statusFilter;
      this.loadData(true);
    }
  },

  initCategories() {
    const app = getApp();
    const cats = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;
    this.setData({ categories: [{ key: '', label: '全部' }, ...cats] });
  },

  async loadData(refresh = false) {
    if (refresh) { this.setData({ skip: 0, hasMore: true, items: [], loading: true }); }
    else if (!this.data.hasMore || this.data.loading) { return; }

    this.setData({ loading: true });
    const { activeCategory, activeStatus, keyword, skip } = this.data;
    const result = await getCollections({
      category: activeCategory || undefined,
      status: activeStatus || undefined,
      keyword: keyword || undefined,
      skip: refresh ? 0 : skip, limit: 20,
    });

    if (result.success) {
      const items = refresh ? result.data : [...this.data.items, ...result.data];
      this.setData({ items, skip: items.length, hasMore: result.hasMore, loading: false, refreshTriggered: false });
    } else {
      this.setData({ loading: false, refreshTriggered: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onPullDownRefresh() {
    this.setData({ refreshTriggered: true });
    this.loadData(true).then(() => wx.stopPullDownRefresh());
  },
  onReachBottom() { this.loadData(false); },

  onSelectCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category });
    this.loadData(true);
  },
  onToggleSearch() {
    this.setData({ showSearch: !this.data.showSearch, searchValue: '' });
    if (!this.data.showSearch) { this.setData({ keyword: '' }); this.loadData(true); }
  },
  onSearchInput(e) { this.setData({ searchValue: e.detail.value }); },
  onSearchConfirm() {
    this.setData({ keyword: this.data.searchValue.trim() });
    this.loadData(true);
  },

  onCardTap(e) {
    const item = e.detail.item;
    wx.navigateTo({ url: `/pages/detail/detail?id=${item._id}` });
  },
  onCardLongPress(e) {
    const item = e.detail && e.detail.item;
    if (item) {
      this.setData({ actionItem: item, showActionSheet: true });
    }
  },

  onCardTagTap(e) {
    const tag = e.detail.tag;
    if (tag) {
      this.setData({ showSearch: true, searchValue: tag, keyword: tag });
      this.loadData(true);
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    }
  },

  onAction(e) {
    const action = e.currentTarget.dataset.action;
    const { actionItem } = this.data;
    this.setData({ showActionSheet: false });
    if (!actionItem) {
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
      return;
    }
    if (action === 'toggleStatus') this.toggleStatus(actionItem);
    else if (action === 'delete') this.deleteItem(actionItem);
    else if (action === 'share') wx.showToast({ title: '请点击右上角分享', icon: 'none' });
  },

  async toggleStatus(item) {
    const newStatus = item.status === 'want_to_go' ? 'visited' : 'want_to_go';
    const result = await updateCollectionItem(item._id, { status: newStatus });
    if (result.success) {
      const items = this.data.items.map(i => i._id === item._id ? { ...i, status: newStatus } : i);
      this.setData({ items });
      wx.showToast({ title: newStatus === 'visited' ? '标记为已去过' : '标记为想去', icon: 'success' });
    }
  },

  async deleteItem(item) {
    const confirmRes = await new Promise(resolve => {
      wx.showModal({ title: '确认删除', content: `确定删除「${item.title}」吗？`, success: resolve });
    });
    if (!confirmRes.confirm) return;
    const result = await deleteCollectionItem(item._id);
    if (result.success) {
      this.setData({ items: this.data.items.filter(i => i._id !== item._id) });
      wx.showToast({ title: '已删除', icon: 'success' });
    }
  },

  noop() {},
  onCloseAction() { this.setData({ showActionSheet: false }); },

  onClearStatus() {
    this.setData({ activeStatus: '' });
    this.loadData(true);
  },

  onGoAdd() { wx.switchTab({ url: '/pages/add/add' }); },
});
