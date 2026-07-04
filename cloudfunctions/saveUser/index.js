const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { userId, nickname } = event;
  if (!userId) return { success: false, error: 'userId required' };

  const now = new Date().toISOString();
  const coll = db.collection('users');
  let existingRecord = null;

  try {
    const existing = await coll.where({ userId }).get();
    if (existing.data && existing.data.length > 0) {
      existingRecord = existing.data[0];
    }
  } catch (err) {
    // -502005 = collection not exists — fine, .add() below will create it
    if (err.errCode !== -502005) {
      console.error('saveUser query error:', err);
      return { success: false, error: err.message };
    }
  }

  try {
    if (existingRecord) {
      const updateData = { lastLoginAt: now };
      if (nickname) updateData.nickname = nickname;
      await coll.doc(existingRecord._id).update({ data: updateData });
    } else {
      await coll.add({
        data: { userId, firstLoginAt: now, lastLoginAt: now, nickname: nickname || '' },
      });
    }
    return { success: true };
  } catch (err) {
    console.error('saveUser write error:', err);
    return { success: false, error: err.message };
  }
};
