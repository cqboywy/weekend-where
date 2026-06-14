const cloud = require('wx-server-sdk');
const https = require('https');
const http = require('http');
const { URL } = require('url');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function detectPlatform(url) {
  const host = url.toLowerCase();
  if (host.includes('xiaohongshu.com') || host.includes('xhslink.com')) return 'xiaohongshu';
  if (host.includes('douyin.com') || host.includes('tiktok.com')) return 'douyin';
  if (host.includes('bilibili.com') || host.includes('b23.tv')) return 'bilibili';
  if (host.includes('dianping.com') || host.includes('meituan.com')) return 'dianping';
  if (host.includes('weixin.qq.com') || host.includes('mp.weixin.qq.com')) return 'wechat';
  return 'other';
}

function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.get(urlString, { timeout: 8000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, url: res.url || urlString }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractOGTags(html) {
  const tags = {};
  const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i) || html.match(/<meta[^>]+name="og:title"[^>]+content="([^"]*)"/i);
  tags.title = titleMatch ? titleMatch[1] : '';
  const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i);
  tags.description = descMatch ? descMatch[1] : '';
  const imgMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
  tags.image = imgMatch ? imgMatch[1] : '';
  if (!tags.title) {
    const tMatch = html.match(/<title>([^<]*)<\/title>/i);
    tags.title = tMatch ? tMatch[1].trim() : '';
  }
  return tags;
}

exports.main = async (event, context) => {
  const { url } = event;
  if (!url) { return { success: false, error: '缺少url参数' }; }
  try {
    const platform = detectPlatform(url);
    const { html } = await fetchUrl(url);
    const ogTags = extractOGTags(html);
    return { success: true, data: { title: ogTags.title || '', description: ogTags.description || '', coverImage: ogTags.image || '', platform: platform } };
  } catch (err) {
    console.error('链接解析失败:', err.message);
    return { success: false, error: err.message, data: { title: '', description: '', coverImage: '', platform: detectPlatform(url) } };
  }
};
