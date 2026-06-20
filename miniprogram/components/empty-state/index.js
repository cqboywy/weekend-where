Component({
  properties: {
    icon: { type: String, value: '' },
    iconName: { type: String, value: 'bookmark' },
    title: { type: String, value: '还没有收藏哦' },
    description: { type: String, value: '去添加你的第一个美食或游玩地点吧' },
    showButton: { type: Boolean, value: true },
    buttonText: { type: String, value: '添加收藏' },
  },
  methods: {
    onButtonTap() { this.triggerEvent('action'); }
  }
});
