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
    this.generateClusterIcon();
  },
  onShow() {
    this.initCategories();
    this.loadMarkers();
  },

  async initCategories() {
    const app = getApp();
    const raw = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;

    // 按收藏数排序（复用缓存）
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

    const sorted = app.globalData._sortedCategories || raw;
    this.setData({ categories: [{ key: '', label: '全部' }, ...sorted] });
  },

  async loadMarkers() {
    const result = await getAllCollections();
    if (result.success && result.data.length > 0) {
      const items = result.data.filter(item => item.location && item.location.latitude);
      if (items.length > 0 && !this._hasLocated) {
        this._hasLocated = true;
        this.setData({ latitude: items[0].location.latitude, longitude: items[0].location.longitude });
      }
      // Collect and sort tags by frequency
      const tagCount = {};
      items.forEach(item => {
        if (item.tags && item.tags.length > 0) {
          item.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
        }
      });
      const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);
      const allTags = [{ tag: '', label: '全部' }];
      sortedTags.forEach(t => allTags.push({ tag: t, label: t }));

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

  generateClusterIcon() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select('#markerCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) { resolve(); return; }
        const canvas = res[0].node;
        const out = 64;
        const dpr = Math.max(wx.getSystemInfoSync().pixelRatio, 3);
        canvas.width = out * dpr;
        canvas.height = out * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, out, out);

        const cx = out / 2, cy = out / 2, r = 24;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#C2674A';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        wx.canvasToTempFilePath({
          canvas, x: 0, y: 0, width: out, height: out,
          destWidth: out, destHeight: out,
          success: (result) => { this._clusterIconCache = result.tempFilePath; resolve(); },
          fail: () => resolve(),
        });
      });
    });
  },

  async updateMarkers() {
    const { allItems, selectedCategory, selectedTag, categories } = this.data;
    let filteredItems = allItems;
    if (selectedCategory) { filteredItems = filteredItems.filter(item => item.category === selectedCategory); }
    if (selectedTag) { filteredItems = filteredItems.filter(item => item.tags && item.tags.includes(selectedTag)); }

    // Pre-generate marker icons: category colors + visited gray
    const VISITED_COLOR = '#A0A098';
    const colors = new Set();
    filteredItems.forEach(item => {
      if (item.status === 'visited') {
        colors.add(VISITED_COLOR);
      } else {
        const cat = categories.find(c => c.key === item.category) || {};
        colors.add(cat.color || '#E8876A');
      }
    });
    await Promise.all([...colors].map(c => this.generateMarkerIcon(c)));

    // Cluster nearby markers
    const clustered = this.clusterMarkers(filteredItems, categories);

    this.setData({ markers: clustered });
  },

  buildMarker(item, categories, allItems) {
    const originalIndex = allItems.indexOf(item);
    const isVisited = item.status === 'visited';
    const cat = categories.find(c => c.key === item.category) || {};
    const catColor = isVisited ? '#A0A098' : (cat.color || '#E8876A');
    return {
      id: originalIndex,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      title: item.title,
      iconPath: this._markerIconCache[catColor] || '/images/tab-map-active.png',
      width: 44,
      height: 44,
      anchor: { x: 0.5, y: 0.5 },
      alpha: isVisited ? 0.6 : 1,
      callout: {
        content: (isVisited ? '✓ ' : '') + item.title,
        color: '#FFFFFF',
        fontSize: 13,
        borderRadius: 12,
        bgColor: catColor,
        padding: 12,
        display: 'ALWAYS',
        textAlign: 'center',
      },
    };
  },

  clusterMarkers(items, categories) {
    const gridSize = 0.015; // ~1.5km
    const groups = {};

    items.forEach(item => {
      const lat = Math.round(item.location.latitude / gridSize) * gridSize;
      const lng = Math.round(item.location.longitude / gridSize) * gridSize;
      const key = lat.toFixed(4) + ',' + lng.toFixed(4);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    const markers = [];
    Object.values(groups).forEach(group => {
      if (group.length === 1) {
        markers.push(this.buildMarker(group[0], categories, items));
      } else {
        // Cluster — show count badge
        const lat = group.reduce((s, i) => s + i.location.latitude, 0) / group.length;
        const lng = group.reduce((s, i) => s + i.location.longitude, 0) / group.length;
        const hasUnvisited = group.some(i => i.status !== 'visited');
        const bgColor = hasUnvisited ? '#C2674A' : '#A0A098';
        markers.push({
          id: 90000 + markers.length,
          latitude: lat,
          longitude: lng,
          width: 56,
          height: 56,
          iconPath: this._clusterIconCache || '/images/tab-map-active.png',
          alpha: hasUnvisited ? 1 : 0.6,
          anchor: { x: 0.5, y: 0.5 },
          callout: {
            content: group.length + ' 个',
            color: '#FFFFFF',
            fontSize: 14,
            borderRadius: 16,
            bgColor: bgColor,
            padding: 14,
            display: 'ALWAYS',
            textAlign: 'center',
          },
          // Store group for detail expansion (future)
          _count: group.length,
        });
      }
    });
    return markers;
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
