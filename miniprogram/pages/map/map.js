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

  onLoad() { this.loadMarkers(); },
  onShow() { this.loadMarkers(); },

  async loadMarkers() {
    const result = await getAllCollections();
    if (result.success && result.data.length > 0) {
      const items = result.data.filter(item => item.location && item.location.latitude);
      if (items.length > 0 && !this._hasLocated) {
        this._hasLocated = true;
        this.setData({ latitude: items[0].location.latitude, longitude: items[0].location.longitude });
      }
      this.setData({ allItems: items });
      this.updateMarkers();
    }
  },

  updateMarkers() {
    const { allItems, selectedCategory } = this.data;
    let filteredItems = allItems;
    if (selectedCategory) { filteredItems = allItems.filter(item => item.category === selectedCategory); }

    const markers = filteredItems.map((item, index) => ({
      id: index,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      title: item.title,
      iconPath: '/images/marker-food.png',
      width: 36, height: 36,
      callout: { content: item.title, color: '#2D3A31', fontSize: 13, borderRadius: 8, bgColor: '#FFFFFF', padding: 8, display: 'BYCLICK' },
    }));
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
