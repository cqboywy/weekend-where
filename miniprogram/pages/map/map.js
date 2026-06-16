const { getAllCollections } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    latitude: 39.9042, longitude: 116.4074, scale: 13,
    markers: [], allItems: [],
    selectedCategory: '', showCategoryFilter: false,
    categories: CATEGORIES,
    selectedItem: null, showDetailCard: false,
  },

  _markerIconCache: {},

  onLoad() {
    this.initCategories();
    this.loadMarkers();
  },
  onShow() {
    this.initCategories();
    this.loadMarkers();
  },

  initCategories() {
    const app = getApp();
    const cats = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;
    this.setData({ categories: cats });
  },

  async loadMarkers() {
    const result = await getAllCollections();
    if (result.success && result.data.length > 0) {
      const items = result.data.filter(item => item.location && item.location.latitude);
      if (items.length > 0 && !this._hasLocated) {
        this._hasLocated = true;
        this.setData({ latitude: items[0].location.latitude, longitude: items[0].location.longitude });
      }
      this.setData({ allItems: items });
      await this.updateMarkers();
    }
  },

  /**
   * Generate a solid filled circle marker PNG via canvas.
   * Results are cached by color hex string.
   */
  generateMarkerIcon(color) {
    if (this._markerIconCache[color]) {
      return Promise.resolve(this._markerIconCache[color]);
    }

    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery();
      query.select('#markerCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          // Canvas 2d not available, fallback to built-in image
          resolve('/images/tab-map-active.png');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const size = 56;
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        // Outer circle (white border)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 24, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Inner filled circle (category color)
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 20, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Highlight (lighter arc at top-left for 3D pin feel)
        ctx.beginPath();
        ctx.arc(size / 2 - 4, size / 2 - 4, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();

        wx.canvasToTempFilePath({
          canvas,
          x: 0, y: 0, width: size, height: size,
          destWidth: size, destHeight: size,
          success: (result) => {
            this._markerIconCache[color] = result.tempFilePath;
            resolve(result.tempFilePath);
          },
          fail: () => resolve('/images/tab-map-active.png'),
        });
      });
    });
  },

  async updateMarkers() {
    const { allItems, selectedCategory, categories } = this.data;
    let filteredItems = allItems;
    if (selectedCategory) { filteredItems = allItems.filter(item => item.category === selectedCategory); }

    // Collect unique colors
    const colors = new Set();
    filteredItems.forEach(item => {
      const cat = categories.find(c => c.key === item.category) || {};
      colors.add(cat.color || '#E8876A');
    });

    // Pre-generate all needed marker icons
    await Promise.all([...colors].map(c => this.generateMarkerIcon(c)));

    const hasFilter = !!selectedCategory;
    const markers = filteredItems.map((item) => {
      const originalIndex = allItems.indexOf(item);
      const cat = categories.find(c => c.key === item.category) || {};
      const catColor = cat.color || '#E8876A';
      return {
        id: originalIndex,
        latitude: item.location.latitude,
        longitude: item.location.longitude,
        title: item.title,
        iconPath: this._markerIconCache[catColor] || '/images/tab-map-active.png',
        width: hasFilter ? 52 : 44,
        height: hasFilter ? 52 : 44,
        anchor: { x: 0.5, y: 0.5 },
        callout: {
          content: item.title,
          color: '#FFFFFF',
          fontSize: 13,
          borderRadius: 12,
          bgColor: catColor,
          padding: 12,
          display: hasFilter ? 'ALWAYS' : 'BYCLICK',
          textAlign: 'center',
        },
      };
    });
    this.setData({ markers });
  },

  onToggleFilter() { this.setData({ showCategoryFilter: !this.data.showCategoryFilter }); },
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category === this.data.selectedCategory ? '' : category, showCategoryFilter: false });
    this.updateMarkers();
  },

  onMarkerTap(e) {
    const item = this.data.allItems[e.detail.markerId];
    if (item) { this.setData({ selectedItem: item, showDetailCard: true }); }
  },

  onViewDetail() {
    if (this.data.selectedItem) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${this.data.selectedItem._id}` });
    }
  },

  onCloseCard() { this.setData({ showDetailCard: false, selectedItem: null }); },

  onMoveToCurrent() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => { this.setData({ latitude: res.latitude, longitude: res.longitude, scale: 14 }); },
      fail: () => { wx.showToast({ title: '请授权位置权限', icon: 'none' }); }
    });
  },
});
