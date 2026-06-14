App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'YOUR_CLOUD_ENV_ID',
        traceUser: true,
      });
    }
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
