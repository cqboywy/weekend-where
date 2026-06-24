function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, delay = 300) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) { last = now; fn.apply(this, args); }
  };
}

function getDayOfWeek(date) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return '星期' + days[date.getDay()];
}

/**
 * Haversine spherical distance between two points.
 * @returns {string} formatted distance e.g. "320m" / "1.2km" / "<10米" / ">100km"
 */
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;

  if (meters < 10) return '<10米';
  if (meters < 1000) return Math.round(meters) + 'm';
  if (meters < 100000) return (meters / 1000).toFixed(1) + 'km';
  return '>100km';
}

/**
 * Get user's current location with 5-min cache. Returns null silently on failure.
 * @returns {Promise<{latitude:number, longitude:number}|null>}
 */
function getUserLocation() {
  const app = getApp();
  const cache = app.globalData._userLocation;
  if (cache && Date.now() - cache.ts < 5 * 60 * 1000) {
    return Promise.resolve({ latitude: cache.latitude, longitude: cache.longitude });
  }
  return new Promise((resolve) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const loc = { latitude: res.latitude, longitude: res.longitude, ts: Date.now() };
        app.globalData._userLocation = loc;
        resolve({ latitude: loc.latitude, longitude: loc.longitude });
      },
      fail: () => resolve(null),
    });
  });
}

module.exports = { formatTime, debounce, throttle, getDayOfWeek, calcDistance, getUserLocation };
