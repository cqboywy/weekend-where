App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d2gofrpjid76f3a61',
        traceUser: true,
      });
    }

    // Load Botanical Design System fonts
    wx.loadFontFace({
      family: 'Playfair Display',
      source: 'url("https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDXbtXK-F2qC0s.woff2")',
      success: () => console.log('Playfair Display loaded'),
      fail: () => console.log('Playfair Display failed, using fallback')
    });
    wx.loadFontFace({
      family: 'Source Sans 3',
      source: 'url("https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJLYyJg.woff2")',
      success: () => console.log('Source Sans 3 loaded'),
      fail: () => console.log('Source Sans 3 failed, using fallback')
    });

    this.getOpenIdPromise = this.getOpenId();
  },

  globalData: {
    openid: '',
    categories: [],
    platforms: [],
  },

  // Returns a Promise that resolves with the openid once the login callFunction
  // completes. Consumers (e.g. cloud.js helpers) can await this promise to
  // guard against the race condition where wx.cloud.callFunction is invoked
  // before wx.cloud.init has fully initialised internally.
  getOpenId: function () {
    return new Promise((resolve, reject) => {
      const doCall = (retriesLeft) => {
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            this.globalData.openid = res.result.openid;
            resolve(res.result.openid);
          },
          fail: err => {
            if (retriesLeft > 0) {
              console.warn('获取 openid 失败，重试中...', err);
              setTimeout(() => doCall(retriesLeft - 1), 500);
            } else {
              console.error('获取 openid 失败:', err);
              reject(err);
            }
          }
        });
      };
      doCall(2); // initial call + 2 retries
    });
  }
});
