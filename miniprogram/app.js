const { CATEGORIES } = require('./utils/constants.js');

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

    // Load Editorial Journal fonts
    wx.loadFontFace({
      family: 'Noto Serif SC',
      source: 'url("https://fonts.gstatic.com/s/notoserifsc/v22/H4c8BXePl9DZ0Xe7gG9cyOj7mm63SzZBEtERe7Y.otf")',
      success: () => console.log('Noto Serif SC loaded'),
      fail: () => console.log('Noto Serif SC failed, using fallback')
    });
    wx.loadFontFace({
      family: 'Noto Sans SC',
      source: 'url("https://fonts.gstatic.com/s/notosanssc/v26/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_EnYxNbPzS5HE.woff2")',
      success: () => console.log('Noto Sans SC loaded'),
      fail: () => console.log('Noto Sans SC failed, using fallback')
    });

    this.getOpenIdPromise = this.getOpenId();

    // Seed default categories (async, non-blocking) then load into globalData
    // NOTE: require cloud.js AFTER wx.cloud.init() — it calls wx.cloud.database() at module level
    const { seedDefaultCategories, getCategories } = require('./utils/cloud.js');
    this.categoriesReady = this.getOpenIdPromise
      .then(() => seedDefaultCategories(CATEGORIES))
      .then(seedRes => {
        console.log(seedRes.seeded ? `已种子 ${seedRes.count} 个默认分类` : '分类数据已存在，跳过种子');
        return getCategories();
      })
      .then(res => {
        if (res.success) {
          this.globalData.categories = res.data;
          delete this.globalData._sortedCategories; // Force re-sort with fresh data
          console.log(`已加载 ${res.data.length} 个分类到全局缓存`);
        }
      })
      .catch(err => {
        // Fallback to hardcoded defaults if cloud fails
        console.error('加载分类失败，使用本地默认:', err);
        this.globalData.categories = CATEGORIES.map((c, i) => ({ ...c, isDefault: true, order: i }));
      });
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
