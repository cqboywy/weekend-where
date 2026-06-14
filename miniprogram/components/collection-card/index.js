const { PLATFORMS, CATEGORIES } = require('../../utils/constants.js');

Component({
  properties: {
    item: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (newVal) {
          this.processItem(newVal);
        }
      }
    },
    showStatus: {
      type: Boolean,
      value: true,
    }
  },

  data: {
    platformInfo: {},
    categoryInfo: {},
    formattedDate: '',
  },

  methods: {
    processItem(item) {
      const platformInfo = PLATFORMS.find(p => p.key === item.platform) || PLATFORMS.find(p => p.key === 'other');
      const categoryInfo = CATEGORIES.find(c => c.key === item.category) || CATEGORIES.find(c => c.key === 'other');
      const date = new Date(item.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      let formattedDate;
      if (diffDays === 0) formattedDate = '今天';
      else if (diffDays === 1) formattedDate = '昨天';
      else if (diffDays < 7) formattedDate = `${diffDays}天前`;
      else formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

      this.setData({ platformInfo, categoryInfo, formattedDate });
    },

    onTap() {
      this.triggerEvent('tap', { item: this.properties.item });
    },

    onLongPress() {
      this.triggerEvent('longpress', { item: this.properties.item });
    },
  }
});
