const { CATEGORIES, generateCategoryCover } = require('../../utils/constants.js');
const { calcDistance, getUserLocation } = require('../../utils/util.js');

Component({
  properties: {
    item: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (newVal) {
          this.processItem(newVal);
          this.computeDistance(newVal);
        }
      }
    },
    showStatus: {
      type: Boolean,
      value: true,
    },
    index: {
      type: Number,
      value: 0,
      observer: function (newVal) {
        this.setData({ staggerClass: 'stagger-' + (Math.min(newVal, 4) + 1) });
      }
    }
  },

  data: {
    categoryInfo: {},
    formattedDate: '',
    staggerClass: 'stagger-1',
    displayCover: '',
    displayTags: [],
    overflowCount: 0,
    distanceText: '',
  },

  methods: {
    processItem(item) {
      // Use dynamic categories from globalData, fallback to hardcoded CATEGORIES
      const app = getApp();
      const cats = (app.globalData.categories && app.globalData.categories.length > 0)
        ? app.globalData.categories
        : CATEGORIES;
      const categoryInfo = cats.find(c => c.key === item.category) || cats.find(c => c.key === 'other') || { key: 'other', label: '其他', color: '#B5A595' };
      const categoryColor = categoryInfo.color || '#B5A595';
      const displayCover = item.coverImage || generateCategoryCover(categoryColor);
      const tags = item.tags || [];
      const displayTags = tags.slice(0, 3);
      const overflowCount = tags.length - 3;
      const date = new Date(item.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      let formattedDate;
      if (diffDays === 0) formattedDate = '今天';
      else if (diffDays === 1) formattedDate = '昨天';
      else if (diffDays < 7) formattedDate = `${diffDays}天前`;
      else formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

      this.setData({ categoryInfo, formattedDate, displayCover, displayTags, overflowCount });
    },

    onTap() {
      this.triggerEvent('tap', { item: this.properties.item });
    },

    onLongPress() {
      this.triggerEvent('longpress', { item: this.properties.item });
    },

    async computeDistance(item) {
      if (!item.location || !item.location.latitude) return;
      const userLoc = await getUserLocation();
      if (userLoc) {
        const dist = calcDistance(
          userLoc.latitude, userLoc.longitude,
          item.location.latitude, item.location.longitude
        );
        this.setData({ distanceText: dist });
      }
    },

    onTagTap(e) {
      this.triggerEvent('tagtap', { tag: e.currentTarget.dataset.tag });
    },
  }
});
