const { getCollections, getCollectionStats, removeFromNextGo } = require('../../utils/cloud.js');
const { CATEGORIES, generateCategoryCover } = require('../../utils/constants.js');
const { getRandomQuote } = require('../../utils/quotes.js');

const CHINESE_NUMS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const CHINESE_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatChineseDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = date.getDay();

  const yearStr = String(y).split('').map(ch => '〇一二三四五六七八九'[Number(ch)]).join('');
  const monthStr = CHINESE_NUMS[m];
  let dayStr;
  if (d <= 10) dayStr = CHINESE_NUMS[d];
  else if (d < 20) dayStr = '十' + CHINESE_NUMS[d - 10];
  else if (d === 20) dayStr = '二十';
  else if (d < 30) dayStr = '二十' + CHINESE_NUMS[d - 20];
  else if (d === 30) dayStr = '三十';
  else dayStr = '三十一';
  const weekStr = '星期' + CHINESE_DAYS[w];

  return `${yearStr}年${monthStr}月${dayStr}日 · ${weekStr}`;
}

Page({
  data: {
    featuredItem: null,
    recentItems: [],
    nextGoItems: [],
    loading: true,
    heroQuote: '',
    heroSource: '',
    currentDate: '',
    // Pagination
    recentHasMore: true,
    recentLoadingMore: false,
  },

  onLoad() { this.setQuote(); this.loadData(); },
  onShow() { this.loadData(); },

  setQuote() {
    const now = new Date();
    const quote = getRandomQuote();
    this.setData({
      heroQuote: quote.text,
      heroSource: quote.source,
      currentDate: formatChineseDate(now),
    });
  },

  async loadData() {
    this.setData({ loading: true });

    const app = getApp();
    const cats = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;

    const [recentResult, statsResult, weekendResult] = await Promise.all([
      getCollections({ limit: 20 }),
      getCollectionStats(),
      getCollections({ nextGo: true, limit: 50 }),
    ]);

    if (recentResult.success && recentResult.data.length > 0) {
      const all = recentResult.data;

      // Random featured pick
      const featuredIdx = Math.floor(Math.random() * all.length);
      const featuredItem = all[featuredIdx];

      // Rest for masonry (exclude featured)
      const rest = all.filter((_, i) => i !== featuredIdx);

      // Attach category color/label + pre-computed cover to each item
      const enrich = (item) => {
        const cat = cats.find(c => c.key === item.category) || cats.find(c => c.key === 'other') || {};
        const color = cat.color || '#E8876A';
        return {
          ...item,
          catColor: color,
          catBg: color + '1A',
          catLabel: cat.label || '其他',
          displayCover: item.coverImage || generateCategoryCover(color),
        };
      };

      // 先清空再赋值，强制微信 image 组件重载，避免缓存串位
      const newFeatured = enrich(featuredItem);
      const enrichedRest = rest.map(enrich);
      const enrichedNextGo = (weekendResult.success ? weekendResult.data : []).map(enrich);

      // Save cursor for next page: use createdAt of the oldest item in this batch
      const lastInBatch = all[all.length - 1];
      if (lastInBatch && lastInBatch.createdAt) {
        this._lastCreatedAt = lastInBatch.createdAt;
      }

      this.setData({ featuredItem: null });
      setTimeout(() => {
        this.setData({
          featuredItem: newFeatured,
          recentItems: enrichedRest,
          nextGoItems: enrichedNextGo,
          loading: false,
          recentHasMore: recentResult.hasMore,
          recentLoadingMore: false,
        });
      }, 50);
    } else {
      this.setData({
        featuredItem: null,
        recentItems: [],
        nextGoItems: (weekendResult.success ? weekendResult.data : []).map(enrich),
        loading: false,
        recentHasMore: false,
        recentLoadingMore: false,
      });
    }
  },

  async loadMoreRecent() {
    if (!this.data.recentHasMore || this.data.recentLoadingMore) return;
    this.setData({ recentLoadingMore: true });

    // Cursor-based pagination: fetch items older than the last item we have
    const result = await getCollections({ limit: 20, before: this._lastCreatedAt });

    if (result.success && result.data.length > 0) {
      const app = getApp();
      const cats = (app.globalData.categories && app.globalData.categories.length > 0)
        ? app.globalData.categories
        : CATEGORIES;
      const enrich = (item) => {
        const cat = cats.find(c => c.key === item.category) || cats.find(c => c.key === 'other') || {};
        const color = cat.color || '#E8876A';
        return {
          ...item,
          catColor: color,
          catBg: color + '1A',
          catLabel: cat.label || '其他',
          displayCover: item.coverImage || generateCategoryCover(color),
        };
      };
      const enriched = result.data.map(enrich);

      // Update cursor to oldest item in this batch
      const lastInBatch = result.data[result.data.length - 1];
      if (lastInBatch && lastInBatch.createdAt) {
        this._lastCreatedAt = lastInBatch.createdAt;
      }

      this.setData({
        recentItems: [...this.data.recentItems, ...enriched],
        recentHasMore: result.hasMore,
        recentLoadingMore: false,
      });
    } else {
      this.setData({ recentLoadingMore: false, recentHasMore: false });
    }
  },

  onReachBottom() {
    this.loadMoreRecent();
  },

  onViewFeatured() {
    const item = this.data.featuredItem;
    if (item && item._id) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${item._id}` });
    }
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
    }
  },

  onViewNextGo(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  async onRemoveNextGo(e) {
    const id = e.currentTarget.dataset.id;
    const res = await removeFromNextGo(id);
    if (res.success) {
      wx.showToast({ title: '已移出', icon: 'success' });
      const items = this.data.nextGoItems.filter(item => item._id !== id);
      this.setData({ nextGoItems: items });
    }
  },

  onGoAdd() { wx.switchTab({ url: '/pages/add/add' }); },
  onGoList() { wx.switchTab({ url: '/pages/list/list' }); },
});
