const { getCollections, deleteCollectionItem, updateCollectionItem, addToNextGo, removeFromNextGo } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    categories: [],
    activeCategory: '',
    activeStatus: '',
    keyword: '',
    showSearch: false,
    searchValue: '',
    showActionSheet: false,
    actionItem: null,
    swiperIndex: 0,
    swiperHeight: 600,
    categoryData: {},  // { [key]: { items, loading, loadingMore, hasMore, skip } }
  },

  onLoad() {
    this.initCategories();
    const app = getApp();
    if (app.globalData.statusFilter) {
      this.setData({ activeStatus: app.globalData.statusFilter });
      delete app.globalData.statusFilter;
    }
    this.calcSwiperHeight();
    this.loadCategoryData('', true);
  },

  onShow() {
    this.initCategories();
    const app = getApp();

    if (app.globalData.tagFilter) {
      const tag = app.globalData.tagFilter;
      delete app.globalData.tagFilter;
      this.setData({ showSearch: true, searchValue: tag, keyword: tag, activeCategory: '', activeStatus: '', swiperIndex: 0 });
      this.reloadAll();
      return;
    }
    if (app.globalData.categoryFilter) {
      const catKey = app.globalData.categoryFilter;
      delete app.globalData.categoryFilter;
      const idx = this.data.categories.findIndex(c => c.key === catKey);
      this.setData({ activeCategory: catKey, keyword: '', searchValue: '', showSearch: false, activeStatus: '', swiperIndex: Math.max(0, idx) });
      this.loadCategoryData(catKey);
      return;
    }
    if (app.globalData.statusFilter && app.globalData.statusFilter !== this.data.activeStatus) {
      this.setData({ activeStatus: app.globalData.statusFilter, activeCategory: '', keyword: '', searchValue: '', showSearch: false, swiperIndex: 0 });
      delete app.globalData.statusFilter;
      this.reloadAll();
    }
    if (app.globalData.listNeedsRefresh) {
      delete app.globalData.listNeedsRefresh;
      this.reloadAll();
    }
  },

  calcSwiperHeight() {
    const info = wx.getSystemInfoSync();
    // header ~80 + search ~60 + chips ~50 = ~190rpx ≈ 95px + tabBar ~50px + safe
    const top = 95;
    const bottom = 50 + (info.safeArea ? info.safeArea.bottom - info.screenHeight : 0);
    this.setData({ swiperHeight: info.windowHeight - top - bottom + 30 });
  },

  async initCategories() {
    const app = getApp();
    const raw = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;

    if (!app.globalData._sortedCategories) {
      try {
        const { getCollectionStats } = require('../../utils/cloud.js');
        const statsRes = await getCollectionStats();
        if (statsRes.success) {
          const counts = statsRes.data.byCategory || {};
          const sorted = [...raw].sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
          app.globalData._sortedCategories = sorted;
        }
      } catch (e) { /* fallback */ }
    }

    const cats = app.globalData._sortedCategories || raw;
    const full = [{ key: '', label: '全部' }, ...cats];
    if (JSON.stringify(full.map(c => c.key)) !== JSON.stringify(this.data.categories.map(c => c.key))) {
      // 为新分类初始化空数据槽
      const initData = { ...this.data.categoryData };
      full.forEach(c => {
        const k = c.key || '';
        if (!initData[k]) initData[k] = { items: [], loading: false, loadingMore: false, hasMore: true, skip: 0 };
      });
      this.setData({ categories: full, categoryData: initData });
    }
  },

  // ── Category data ──

  async loadCategoryData(catKey, refresh = false) {
    const key = catKey || '';
    const prev = this.data.categoryData[key] || { items: [], loading: false, loadingMore: false, hasMore: true, skip: 0 };

    if (refresh) {
      prev.skip = 0;
      prev.hasMore = true;
      prev.items = [];
    }
    if (!prev.hasMore && !refresh) return;

    const setDataObj = {};
    if (refresh) {
      setDataObj[`categoryData.${key}.loading`] = true;
      setDataObj[`categoryData.${key}.items`] = [];
    } else {
      setDataObj[`categoryData.${key}.loadingMore`] = true;
    }
    this.setData(setDataObj);

    const result = await getCollections({
      category: key || undefined,
      status: this.data.activeStatus || undefined,
      keyword: this.data.keyword || undefined,
      skip: refresh ? 0 : prev.skip,
      limit: 20,
    });

    const patch = {};
    if (result.success) {
      const items = refresh ? result.data : [...prev.items, ...result.data];
      patch[`categoryData.${key}.items`] = items;
      patch[`categoryData.${key}.skip`] = items.length;
      patch[`categoryData.${key}.hasMore`] = result.hasMore;
    }
    patch[`categoryData.${key}.loading`] = false;
    patch[`categoryData.${key}.loadingMore`] = false;
    this.setData(patch);
  },

  reloadAll() {
    const init = {};
    this.data.categories.forEach(c => {
      init[c.key || ''] = { items: [], loading: false, loadingMore: false, hasMore: true, skip: 0 };
    });
    this.setData({ categoryData: init });
    this.loadCategoryData(this.data.activeCategory, true);
  },

  // ── Swiper ──

  onSwiperChange(e) {
    const idx = e.detail.current;
    const cat = this.data.categories[idx];
    if (cat) {
      this.setData({ activeCategory: cat.key, swiperIndex: idx });
      this.loadCategoryData(cat.key);
    }
  },

  onSelectCategory(e) {
    const catKey = e.currentTarget.dataset.category;
    const idx = this.data.categories.findIndex(c => c.key === catKey);
    this.setData({ activeCategory: catKey, swiperIndex: idx });
    this.loadCategoryData(catKey);
  },

  // ── Search ──

  onToggleSearch() {
    if (this.data.showSearch) {
      this.setData({ showSearch: false, searchValue: '', keyword: '' });
      this.reloadAll();
    } else {
      this.setData({ showSearch: true, searchValue: '' });
    }
  },
  onSearchInput(e) { this.setData({ searchValue: e.detail.value }); },
  onSearchConfirm() {
    this.setData({ keyword: this.data.searchValue.trim() });
    this.reloadAll();
  },

  // ── Cards ──

  onCardTap(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.detail.item._id}` });
  },
  onCardLongPress(e) {
    const item = e.detail && e.detail.item;
    if (item) this.setData({ actionItem: item, showActionSheet: true });
  },
  onCardTagTap(e) {
    const tag = e.detail.tag;
    if (tag) {
      this.setData({ showSearch: true, searchValue: tag, keyword: tag, activeCategory: '', activeStatus: '', swiperIndex: 0 });
      this.reloadAll();
    }
  },

  // ── Actions ──

  onAction(e) {
    const action = e.currentTarget.dataset.action;
    const { actionItem } = this.data;
    this.setData({ showActionSheet: false });
    if (!actionItem) return;
    if (action === 'toggleNextGo') this.toggleNextGo(actionItem);
    else if (action === 'toggleStatus') this.toggleStatus(actionItem);
    else if (action === 'delete') this.deleteItem(actionItem);
    else if (action === 'share') wx.showToast({ title: '请点击右上角分享', icon: 'none' });
  },

  async toggleNextGo(item) {
    const isInPlan = item.nextGo;
    const res = isInPlan ? await removeFromNextGo(item._id) : await addToNextGo(item._id);
    if (res.success) {
      this.updateItemLocally(item._id, { nextGo: !isInPlan });
      wx.showToast({ title: isInPlan ? '已移出' : '已加入「下次去」', icon: 'success' });
    }
  },

  async toggleStatus(item) {
    const newStatus = item.status === 'want_to_go' ? 'visited' : 'want_to_go';
    const res = await updateCollectionItem(item._id, { status: newStatus });
    if (res.success) {
      this.updateItemLocally(item._id, { status: newStatus });
      wx.showToast({ title: newStatus === 'visited' ? '标记为已去过' : '标记为想去', icon: 'success' });
    }
  },

  async deleteItem(item) {
    const confirmRes = await new Promise(r => wx.showModal({ title: '确认删除', content: `确定删除「${item.title}」吗？`, success: r }));
    if (!confirmRes.confirm) return;
    const res = await deleteCollectionItem(item._id);
    if (res.success) {
      this.removeItemLocally(item._id);
      wx.showToast({ title: '已删除', icon: 'success' });
    }
  },

  updateItemLocally(id, patch) {
    const data = { ...this.data.categoryData };
    Object.keys(data).forEach(key => {
      data[key] = { ...data[key], items: data[key].items.map(i => i._id === id ? { ...i, ...patch } : i) };
    });
    this.setData({ categoryData: data });
  },

  removeItemLocally(id) {
    const data = { ...this.data.categoryData };
    Object.keys(data).forEach(key => {
      data[key] = { ...data[key], items: data[key].items.filter(i => i._id !== id) };
    });
    this.setData({ categoryData: data });
  },

  // ── Misc ──

  noop() {},
  onCloseAction() { this.setData({ showActionSheet: false }); },
  onClearStatus() {
    this.setData({ activeStatus: '' });
    this.reloadAll();
  },
  onGoAdd() { wx.switchTab({ url: '/pages/add/add' }); },

  onPullDownRefresh() {
    this.loadCategoryData(this.data.activeCategory, true);
  },

  onReachBottom() {
    this.loadCategoryData(this.data.activeCategory, false);
  },
});
