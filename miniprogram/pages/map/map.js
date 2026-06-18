const { getAllCollections } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    latitude: 39.9042, longitude: 116.4074, scale: 13,
    markers: [], allItems: [],
    selectedCategory: '', selectedTag: '',
    categories: CATEGORIES, allTags: [],
    filterMode: 'category',
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
    this.setData({ categories: [{ key: '', label: '全部' }, ...cats] });
  },

  async loadMarkers() {
    const result = await getAllCollections();
    if (result.success && result.data.length > 0) {
      const items = result.data.filter(item => item.location && item.location.latitude);
      if (items.length > 0 && !this._hasLocated) {
        this._hasLocated = true;
        this.setData({ latitude: items[0].location.latitude, longitude: items[0].location.longitude });
      }
      // Collect unique tags
      const tagSet = new Set();
      items.forEach(item => {
        if (item.tags && item.tags.length > 0) {
          item.tags.forEach(t => tagSet.add(t));
        }
      });
      const allTags = [{ tag: '', label: '全部' }];
      tagSet.forEach(t => allTags.push({ tag: t, label: t }));

      this.setData({ allItems: items, allTags });
      await this.updateMarkers();
    }
  },

  /**
   * Generate a teardrop pin marker PNG via canvas.
   * Results are cached by color hex string.
   */
  generateMarkerIcon(color) {
    if (this._markerIconCache[color]) {
      return Promise.resolve(this._markerIconCache[color]);
    }

    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select('#markerCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          resolve('/images/tab-map-active.png');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        // High-res canvas → crisp output
        const out = 64;
        const dpr = Math.max(wx.getSystemInfoSync().pixelRatio, 3);
        canvas.width = out * dpr;
        canvas.height = out * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, out, out);

        // Teardrop pin geometry
        const cx = out / 2;
        const cy = 22;
        const r = 17;
        const tip = cy + r + 12;

        // Pin body path
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 1.02, -0.02);
        ctx.quadraticCurveTo(cx + r + 1, cy + r + 2, cx, tip);
        ctx.quadraticCurveTo(cx - r - 1, cy + r + 2, cx - r, cy);
        ctx.closePath();

        // Shadow (draw first, beneath body)
        ctx.shadowColor = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Fill
        ctx.fillStyle = color;
        ctx.fill();

        // Outer white ring (crisp edges)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner hairline — definition edge
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Specular highlight (small bright dot)
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy - 6, 5, 4, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();

        wx.canvasToTempFilePath({
          canvas,
          x: 0, y: 0, width: out, height: out,
          destWidth: out, destHeight: out,
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
    const { allItems, selectedCategory, selectedTag, categories } = this.data;
    let filteredItems = allItems;
    if (selectedCategory) { filteredItems = filteredItems.filter(item => item.category === selectedCategory); }
    if (selectedTag) { filteredItems = filteredItems.filter(item => item.tags && item.tags.includes(selectedTag)); }

    // Collect unique colors
    const colors = new Set();
    filteredItems.forEach(item => {
      const cat = categories.find(c => c.key === item.category) || {};
      colors.add(cat.color || '#E8876A');
    });

    // Pre-generate all needed marker icons
    await Promise.all([...colors].map(c => this.generateMarkerIcon(c)));

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
        width: 44,
        height: 44,
        anchor: { x: 0.5, y: 0.5 },
        callout: {
          content: item.title,
          color: '#FFFFFF',
          fontSize: 13,
          borderRadius: 12,
          bgColor: catColor,
          padding: 12,
          display: 'ALWAYS',
          textAlign: 'center',
        },
      };
    });
    this.setData({ markers });
  },

  onSelectCategory(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.category });
    this.updateMarkers();
  },
  onSelectTag(e) {
    this.setData({ selectedTag: e.currentTarget.dataset.tag });
    this.updateMarkers();
  },
  onToggleFilterMode() {
    const mode = this.data.filterMode === 'category' ? 'tag' : 'category';
    // Clear the other mode's filter when switching
    this.setData({
      filterMode: mode,
      selectedCategory: '',
      selectedTag: '',
    });
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
