const db = wx.cloud.database();
const _ = db.command;

function collection(name) {
  return db.collection(name);
}

// Resolves to the current user's openid, waiting for the login cloud function
// if necessary. This prevents silent failures when wx.cloud.init() hasn't
// finished its internal async initialisation (Bug 2 fix).
async function ensureOpenId() {
  const app = getApp();
  if (app.globalData.openid) {
    return app.globalData.openid;
  }
  if (app.getOpenIdPromise) {
    return app.getOpenIdPromise;
  }
  // Fallback: if neither is ready, re-trigger and wait
  const p = app.getOpenId();
  app.getOpenIdPromise = p;
  return p;
}

async function addCollectionItem(data) {
  try {
    const userId = await ensureOpenId();
    const res = await collection('collection_items').add({
      data: {
        ...data,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
    return { success: true, id: res._id };
  } catch (err) {
    console.error('添加收藏失败:', err);
    return { success: false, error: err };
  }
}

async function getCollections({ category, keyword, status, nextGo, skip = 0, limit = 20 } = {}) {
  try {
    const userId = await ensureOpenId();
    // Build all conditions into a single array and use _.and() to avoid the
    // CloudBase SDK bug where chained .where() calls replace previous conditions.
    const conditions = [{ userId }];

    if (category) {
      conditions.push({ category });
    }
    if (status) {
      conditions.push({ status });
    }
    if (nextGo !== undefined) {
      conditions.push({ nextGo });
    }
    if (keyword) {
      conditions.push(
        _.or([
          { title: db.RegExp({ regexp: keyword, options: 'i' }) },
          { note: db.RegExp({ regexp: keyword, options: 'i' }) },
          { 'location.name': db.RegExp({ regexp: keyword, options: 'i' }) },
          { tags: db.RegExp({ regexp: keyword, options: 'i' }) },
        ])
      );
    }

    const res = await collection('collection_items')
      .where(_.and(conditions))
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get();

    return { success: true, data: res.data, hasMore: res.data.length === limit };
  } catch (err) {
    console.error('获取收藏列表失败:', err);
    return { success: false, error: err, data: [] };
  }
}

async function getAllCollections() {
  try {
    // Paginate through all items using getCollections with list-proven limit of 20
    const allData = [];
    let skip = 0;
    let hasMore = true;
    while (hasMore) {
      const result = await getCollections({ limit: 20, skip });
      if (result.success && result.data) {
        allData.push(...result.data);
        hasMore = result.hasMore;
        skip += result.data.length;
      } else {
        hasMore = false;
      }
    }
    return { success: true, data: allData, hasMore: false };
  } catch (err) {
    console.error('获取全部收藏失败:', err);
    return { success: false, error: err, data: [], hasMore: false };
  }
}

async function getCollectionDetail(id) {
  try {
    const res = await collection('collection_items').doc(id).get();
    return { success: true, data: res.data };
  } catch (err) {
    console.error('获取收藏详情失败:', err);
    return { success: false, error: err };
  }
}

async function updateCollectionItem(id, data) {
  try {
    await collection('collection_items').doc(id).update({
      data: { ...data, updatedAt: new Date().toISOString() }
    });
    return { success: true };
  } catch (err) {
    console.error('更新收藏失败:', err);
    return { success: false, error: err };
  }
}

async function deleteCollectionItem(id) {
  try {
    await collection('collection_items').doc(id).remove();
    return { success: true };
  } catch (err) {
    console.error('删除收藏失败:', err);
    return { success: false, error: err };
  }
}

async function getCollectionStats() {
  try {
    const userId = await ensureOpenId();
    const coll = collection('collection_items');
    const totalRes = await coll.where({ userId }).count();
    const wantRes = await coll.where({ userId, status: 'want_to_go' }).count();
    const visitedRes = await coll.where({ userId, status: 'visited' }).count();

    // Count items per category using individual .count() queries (always accurate, no index needed)
    const categories = getApp().globalData.categories;
    const categoryCount = {};
    if (categories && categories.length > 0) {
      await Promise.all(categories.map(async (cat) => {
        try {
          const res = await coll.where({ userId, category: cat.key }).count();
          categoryCount[cat.key] = res.total;
        } catch (e) { categoryCount[cat.key] = 0; }
      }));
    }

    return {
      success: true,
      data: {
        total: totalRes.total,
        wantToGo: wantRes.total,
        visited: visitedRes.total,
        byCategory: categoryCount,
      }
    };
  } catch (err) {
    console.error('获取统计失败:', err);
    return { success: false, error: err };
  }
}

/**
 * Aggregate tag frequencies from all user collections.
 * @returns {Promise<{success: boolean, data: Array<{tag: string, count: number}>}>}
 */
async function getTagStats() {
  try {
    const userId = await ensureOpenId();
    // Use cloud function to aggregate — bypasses client-side limit/field quirks
    const res = await wx.cloud.callFunction({
      name: 'getTagStats',
      data: { userId },
    });
    if (res.result && res.result.success) {
      return { success: true, data: res.result.data };
    }
    // Fallback: aggregate on client side
    const freq = {};
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const page = await collection('collection_items')
        .where({ userId })
        .skip(offset)
        .limit(pageSize)
        .get();
      page.data.forEach(item => {
        if (item.tags && item.tags.length > 0) {
          item.tags.forEach(tag => {
            freq[tag] = (freq[tag] || 0) + 1;
          });
        }
      });
      hasMore = page.data.length === pageSize;
      offset += pageSize;
    }
    const data = Object.entries(freq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    return { success: true, data };
  } catch (err) {
    console.error('获取标签统计失败:', err);
    return { success: false, error: err, data: [] };
  }
}

// ============================================================
// Category CRUD — operates on the 'categories' collection
// ============================================================

async function getCategories() {
  try {
    const userId = await ensureOpenId();
    const res = await collection('categories')
      .where({ userId })
      .orderBy('order', 'asc')
      .limit(100)
      .get();
    return { success: true, data: res.data };
  } catch (err) {
    console.error('获取分类列表失败:', err);
    return { success: false, error: err, data: [] };
  }
}

async function addCategory(data) {
  try {
    const userId = await ensureOpenId();
    const now = new Date().toISOString();
    const res = await collection('categories').add({
      data: {
        ...data,
        userId,
        createdAt: now,
        updatedAt: now,
      }
    });
    return { success: true, id: res._id };
  } catch (err) {
    console.error('添加分类失败:', err);
    return { success: false, error: err };
  }
}

async function updateCategory(id, data) {
  try {
    await collection('categories').doc(id).update({
      data: { ...data, updatedAt: new Date().toISOString() }
    });
    return { success: true };
  } catch (err) {
    console.error('更新分类失败:', err);
    return { success: false, error: err };
  }
}

async function deleteCategory(id) {
  try {
    await collection('categories').doc(id).remove();
    return { success: true };
  } catch (err) {
    console.error('删除分类失败:', err);
    return { success: false, error: err };
  }
}

/**
 * Seed default categories for a new user.  Safe to call repeatedly —
 * it only inserts when the user has zero categories.
 * @param {Array} defaults - array of { key, label, icon, color } objects
 */
async function seedDefaultCategories(defaults) {
  try {
    const userId = await ensureOpenId();
    const existing = await collection('categories').where({ userId }).count();
    if (existing.total > 0) return { success: true, seeded: false };

    const now = new Date().toISOString();
    const docs = defaults.map((cat, i) => ({
      key: cat.key,
      label: cat.label,
      icon: cat.icon || 'tag',
      color: cat.color || '#B5A595',
      isDefault: true,
      order: i,
      userId,
      createdAt: now,
      updatedAt: now,
    }));

    // Insert each category individually (CloudBase SDK doesn't support batch add)
    for (const doc of docs) {
      await collection('categories').add({ data: doc });
    }

    return { success: true, seeded: true, count: docs.length };
  } catch (err) {
    console.error('种子分类失败:', err);
    return { success: false, error: err };
  }
}

/**
 * Count how many collection_items use a given category key.
 * @param {string} categoryKey
 * @returns {Promise<{success: boolean, count: number}>}
 */
async function getCategoryItemCount(categoryKey) {
  try {
    const userId = await ensureOpenId();
    const res = await collection('collection_items')
      .where({ userId, category: categoryKey })
      .count();
    return { success: true, count: res.total };
  } catch (err) {
    console.error('查询分类使用数失败:', err);
    return { success: false, count: 0, error: err };
  }
}

/**
 * Upload a cover image to CloudBase cloud storage.
 * @param {string} filePath - local temp file path from wx.chooseImage
 * @returns {Promise<{success: boolean, fileID?: string, error?: any}>}
 */
async function uploadImage(filePath) {
  try {
    const openId = await ensureOpenId();
    const cloudPath = `cover-images/${openId}_${Date.now()}.jpg`;
    const res = await wx.cloud.uploadFile({ cloudPath, filePath });
    return { success: true, fileID: res.fileID };
  } catch (err) {
    console.error('封面上传失败:', err);
    return { success: false, error: err };
  }
}

/**
 * Rename a tag across all user collections.
 * @param {string} oldTag
 * @param {string} newTag
 * @returns {Promise<{success: boolean, updated: number}>}
 */
async function renameTagInCollections(oldTag, newTag) {
  try {
    const userId = await ensureOpenId();
    const res = await collection('collection_items')
      .where({ userId, tags: db.RegExp({ regexp: oldTag, options: 'i' }) })
      .field({ tags: true })
      .limit(200)
      .get();
    let updated = 0;
    for (const item of res.data) {
      const tags = item.tags.map(t => t === oldTag ? newTag : t);
      await collection('collection_items').doc(item._id).update({
        data: { tags, updatedAt: new Date().toISOString() }
      });
      updated++;
    }
    return { success: true, updated };
  } catch (err) {
    console.error('重命名标签失败:', err);
    return { success: false, error: err, updated: 0 };
  }
}

/**
 * Remove a tag from all user collections.
 * @param {string} tag
 * @returns {Promise<{success: boolean, updated: number}>}
 */
async function removeTagFromAllCollections(tag) {
  try {
    const userId = await ensureOpenId();
    const res = await collection('collection_items')
      .where({ userId, tags: db.RegExp({ regexp: tag, options: 'i' }) })
      .field({ tags: true })
      .limit(200)
      .get();
    let updated = 0;
    for (const item of res.data) {
      const tags = item.tags.filter(t => t !== tag);
      await collection('collection_items').doc(item._id).update({
        data: { tags, updatedAt: new Date().toISOString() }
      });
      updated++;
    }
    return { success: true, updated };
  } catch (err) {
    console.error('删除标签失败:', err);
    return { success: false, error: err, updated: 0 };
  }
}

/**
 * Add a collection to the next-go list.
 */
async function addToNextGo(id) {
  try {
    await collection('collection_items').doc(id).update({
      data: { nextGo: true, nextGoAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    });
    return { success: true };
  } catch (err) {
    console.error('加入「下次去」失败:', err);
    return { success: false, error: err };
  }
}

/**
 * Remove a collection from the next-go list.
 */
async function removeFromNextGo(id) {
  try {
    await collection('collection_items').doc(id).update({
      data: { nextGo: false, updatedAt: new Date().toISOString() }
    });
    return { success: true };
  } catch (err) {
    console.error('移出「下次去」失败:', err);
    return { success: false, error: err };
  }
}

module.exports = {
  db, _, collection,
  addCollectionItem, getCollections, getAllCollections,
  getCollectionDetail, updateCollectionItem, deleteCollectionItem,
  getCollectionStats, getTagStats,
  getCategories, addCategory, updateCategory, deleteCategory,
  seedDefaultCategories, getCategoryItemCount,
  uploadImage,
  renameTagInCollections, removeTagFromAllCollections,
  addToNextGo, removeFromNextGo,
};
