const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { userId } = event;
  if (!userId) return { success: false, error: 'userId required' };

  const now = new Date().toISOString();
  const coll = db.collection('users');

  try {
    const existing = await coll.where({ userId }).get();
    if (existing.data && existing.data.length > 0) {
      await coll.doc(existing.data[0]._id).update({
        data: { lastLoginAt: now },
      });
    } else {
      await coll.add({
        data: { userId, firstLoginAt: now, lastLoginAt: now },
      });
    }
    return { success: true };
  } catch (err) {
    console.error('saveUser error:', err);
    return { success: false, error: err.message };
  }
};
