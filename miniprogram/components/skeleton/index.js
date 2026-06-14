Component({
  properties: {
    loading: { type: Boolean, value: true },
    count: { type: Number, value: 3 },
  },
  data: { skeletonList: [] },
  lifetimes: {
    attached() {
      this.setData({
        skeletonList: Array.from({ length: this.properties.count }, (_, i) => i)
      });
    }
  }
});
