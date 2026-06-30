const { getCollections, getAllCollections, deleteCollectionItem, updateCollectionItem, addToNextGo, removeFromNextGo } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');
const { getRouteDistances, getUserLocation } = require('../../utils/util.js');

Page({
  data: {
    categories: [],
    activeCategory: '__all__',
    activeStatus: '',
    keyword: '',
    showSearch: false,
    searchValue: '',
    showActionSheet: false,
    actionItem: null,
    swiperIndex: 0,
    swiperHeight: 600,
    categoryData: {},  // { [key]: { items, loading, loadingMore, hasMore, skip } }
    nearbyItems: [],
    nearbyLoading: false,
    nearbyError: false,
  },

  async onLoad() {
    this._loadingKeys = {};
    this._showTriggeredLoad = false;
    await this.initCategories();
    const app = getApp();
    if (app.globalData.statusFilter) {
      this.setData({ activeStatus: app.globalData.statusFilter });
      delete app.globalData.statusFilter;
    }
    this.calcSwiperHeight();
    // If onShow has already triggered a load (tag/category filter), skip to avoid duplicate loads
    if (this._showTriggeredLoad) return;
    const idx = this.data.categories.findIndex(c => c.key === '__all__');
    this.setData({ activeCategory: '__all__', swiperIndex: Math.max(0, idx) });
    this.loadCategoryData('__all__', true);
  },

  onShow() {
    this.initCategories();
    const app = getApp();

    if (app.globalData.tagFilter) {
      this._showTriggeredLoad = true;
      const tag = app.globalData.tagFilter;
      delete app.globalData.tagFilter;
      const idx = this.data.categories.findIndex(c => c.key === '__all__');
      this.setData({ showSearch: true, searchValue: tag, keyword: tag, activeCategory: '__all__', activeStatus: '', swiperIndex: Math.max(0, idx) });
      this.reloadAll();
      return;
    }
    if (app.globalData.categoryFilter) {
      this._showTriggeredLoad = true;
      const catKey = app.globalData.categoryFilter;
      delete app.globalData.categoryFilter;
      const idx = this.data.categories.findIndex(c => c.key === catKey);
      this.setData({ activeCategory: catKey, keyword: '', searchValue: '', showSearch: false, activeStatus: '', swiperIndex: Math.max(0, idx) });
      this.loadCategoryData(catKey);
      return;
    }
    if (app.globalData.statusFilter && app.globalData.statusFilter !== this.data.activeStatus) {
      this._showTriggeredLoad = true;
      const idx = this.data.categories.findIndex(c => c.key === '__all__');
      this.setData({ activeStatus: app.globalData.statusFilter, activeCategory: '__all__', keyword: '', searchValue: '', showSearch: false, swiperIndex: Math.max(0, idx) });
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
    // Wait for async category loading if not ready yet (first launch)
    if ((!app.globalData.categories || app.globalData.categories.length === 0) && app.categoriesReady) {
      await app.categoriesReady;
    }
    const raw = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;

    // Sort categories by item count (always fetch fresh)
    let cats = [...raw];
    try {
      const { getCollectionStats } = require('../../utils/cloud.js');
      const statsRes = await getCollectionStats();
      if (statsRes.success) {
        const counts = statsRes.data.byCategory || {};
        cats.sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));
      }
    } catch (e) { /* keep default order */ }
    const full = [{ key: '__nearby__', label: '附近' }, { key: '__all__', label: '全部' }, ...cats];
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
    if (catKey === '__nearby__') {
      this.loadNearbyItems();
      return;
    }
    const key = catKey || '';

    // Prevent concurrent loads for the same category — avoids duplicates from race conditions
    if (this._loadingKeys[key]) return;
    this._loadingKeys[key] = true;

    try {
      await this._doLoadCategoryData(key, refresh);
    } finally {
      this._loadingKeys[key] = false;
    }
  },

  async _doLoadCategoryData(key, refresh) {
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
      category: (key === '__all__' ? undefined : key) || undefined,
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

  // ── Nearby distance-sorted ──

  async loadNearbyItems() {
    if (this.data.nearbyLoading) return;
    this.setData({ nearbyLoading: true, nearbyError: false, nearbyItems: [] });

    const userLoc = await getUserLocation();
    if (!userLoc) {
      this.setData({ nearbyLoading: false, nearbyError: true });
      return;
    }

    const result = await getAllCollections();
    if (!result.success || !result.data || result.data.length === 0) {
      this.setData({ nearbyLoading: false });
      return;
    }

    const itemsWithLocation = result.data.filter(item => item.location && item.location.latitude);
    if (itemsWithLocation.length === 0) {
      this.setData({ nearbyLoading: false });
      return;
    }

    // Batch compute route distances
    const toCoords = itemsWithLocation.map(item => ({
      lat: item.location.latitude,
      lng: item.location.longitude,
    }));
    const distanceTexts = await getRouteDistances(userLoc.latitude, userLoc.longitude, toCoords);

    // Merge distance into items and sort
    const parseDistToMeters = (text) => {
      if (!text) return Infinity;
      if (text === '<10米') return 5;
      if (text === '>100km') return 100001;
      if (text.endsWith('km')) return parseFloat(text) * 1000;
      if (text.endsWith('m')) return parseFloat(text);
      return Infinity;
    };
    const withDistance = itemsWithLocation.map((item, i) => ({
      ...item,
      _distanceText: distanceTexts[i] || '',
      _distanceMeters: parseDistToMeters(distanceTexts[i]),
    }));

    withDistance.sort((a, b) => a._distanceMeters - b._distanceMeters);

    this.setData({ nearbyItems: withDistance, nearbyLoading: false });
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
      const idx = this.data.categories.findIndex(c => c.key === '__all__');
      this.setData({ showSearch: true, searchValue: tag, keyword: tag, activeCategory: '__all__', activeStatus: '', swiperIndex: Math.max(0, idx) });
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
      wx.showToast({ title: isInPlan ? '已移出' : '已加入「计划去」', icon: 'success' });
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

  onShareAppMessage() {
    const item = this.data.actionItem;
    if (!item) return { title: '周末去哪儿', path: '/pages/index/index' };
    return {
      title: `周末去哪儿 — ${item.title}`,
      path: `/pages/detail/detail?id=${item._id}`,
      imageUrl: item.coverImage || '',
    };
  },

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
