// 云函数：标签统计 — 服务端聚合，不受客户端 limit/skip 限制
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { userId } = event;
  if (!userId) return { success: false, error: 'missing userId' };

  const freq = {};
  const pageSize = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const res = await db.collection('collection_items')
      .where({ userId })
      .field({ tags: true })
      .skip(offset)
      .limit(pageSize)
      .get();

    res.data.forEach(item => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
          freq[tag] = (freq[tag] || 0) + 1;
        });
      }
    });

    hasMore = res.data.length === pageSize;
    offset += pageSize;
  }

  const data = Object.entries(freq)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return { success: true, data };
};
