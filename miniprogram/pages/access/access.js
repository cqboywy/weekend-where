const db = wx.cloud.database();

Page({
  data: { code: '', checking: false, error: '' },

  onInput(e) {
    this.setData({ code: e.detail.value, error: '' });
  },

  async onSubmit() {
    const code = this.data.code.trim();
    if (!code) {
      this.setData({ error: '请输入授权码' });
      return;
    }
    this.setData({ checking: true, error: '' });

    try {
      const res = await db.collection('config')
        .where({ key: 'accessCode' })
        .get();

      if (res.data && res.data.length > 0 && res.data[0].value === code) {
        wx.setStorageSync('accessGranted', true);
        wx.reLaunch({ url: '/pages/index/index' });
      } else {
        this.setData({ error: '授权码不正确', checking: false });
      }
    } catch (err) {
      console.error('验证授权码失败:', err);
      // If config collection doesn't exist, show a fallback message
      if (err.errCode === -502005) {
        this.setData({ error: '系统未配置，请联系管理员', checking: false });
      } else {
        this.setData({ error: '验证失败，请重试', checking: false });
      }
    }
  },
});
