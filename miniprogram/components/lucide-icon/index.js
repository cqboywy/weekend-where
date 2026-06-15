const ICONS = require('./icons-data.js');

Component({
  properties: {
    name: { type: String, value: 'house' },
    size: { type: Number, value: 40 },
    color: { type: String, value: '' },
  },

  data: { iconSrc: '', iconStyle: '' },

  lifetimes: {
    attached() { this.updateIcon(); }
  },

  observers: {
    'name, size, color'() { this.updateIcon(); }
  },

  methods: {
    updateIcon() {
      const { name, size, color } = this.properties;
      const src = ICONS[name] || ICONS['house'];
      let style = `width:${size}rpx;height:${size}rpx;`;
      this.setData({ iconSrc: src, iconStyle: style });
    }
  }
});
