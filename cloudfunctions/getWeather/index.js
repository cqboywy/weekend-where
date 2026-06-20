const https = require('https');

const API_KEY = 'YOUR_QWEATHER_KEY'; // 替换为你的和风天气 API Key

/**
 * QWeather icon → simplified weather type
 *   100=晴 101=多云 102=少云 103=晴间多云 104=阴
 *   3xx=雨 4xx=雪 5xx=雾/霾 2xx=风
 */
function classifyWeather(iconCode) {
  const code = Number(iconCode);
  if (code === 100 || code === 102) return 'sunny';
  if (code === 101 || code === 103) return 'cloudy';
  if (code === 104) return 'overcast';
  if (code >= 300 && code < 400) return 'rain';
  if (code >= 400 && code < 500) return 'snow';
  if (code >= 500 && code < 600) return 'fog';
  if (code >= 200 && code < 300) return 'windy';
  return 'sunny';
}

exports.main = async (event) => {
  const { lat, lon } = event;

  try {
    const httpResult = await new Promise((resolve, reject) => {
      const url = `https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${API_KEY}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('JSON parse failed')); }
        });
      }).on('error', reject);
    });

    if (httpResult.code === '200' && httpResult.now) {
      const now = httpResult.now;
      return {
        success: true,
        data: {
          weatherType: classifyWeather(now.icon),
          temp: now.temp,
          text: now.text,
          icon: now.icon,
          feelsLike: now.feelsLike,
          windDir: now.windDir,
          windScale: now.windScale,
          humidity: now.humidity,
        },
      };
    }

    return { success: false, error: httpResult.code || 'unknown' };
  } catch (err) {
    console.error('getWeather error:', err);
    return { success: false, error: err.message };
  }
};
