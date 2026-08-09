/**
 * 精选语录池 —— 用于首页 Hero。
 * 主题覆盖美食、旅行、生活，配作者出处增加文学感。
 */

const QUOTES = [
  // ── 美食 ──
  { text: '人间烟火气，最抚凡人心', source: '——《一日禅》' },
  { text: '四方食事，不过一碗人间烟火', source: '—— 汪曾祺' },
  { text: '唯有美食与爱，不可辜负', source: '—— 《美食、祈祷和恋爱》' },
  { text: '吃是最好的安慰', source: '—— 《深夜食堂》' },
  { text: '人生忽如寄，莫辜负茶、汤和好天气', source: '—— 汪曾祺' },
  { text: '世间万物，唯有美食不可辜负', source: '—— 蔡澜' },
  { text: '好好吃饭，是平凡日子里最大的浪漫', source: '—— 网络佚名' },
  { text: '口味要宽一点、杂一点，南甜北咸东辣西酸，都去尝尝', source: '—— 汪曾祺' },
  { text: '食物有很强大的治愈力量', source: '—— 《千与千寻》' },
  { text: '没有什么烦恼是一顿火锅解决不了的', source: '—— 四川谚语' },

  // ── 旅行 ──
  { text: '身体和灵魂，总有一个在路上', source: '—— 《罗马假日》' },
  { text: '世界是一本书，不旅行的人只读了其中一页', source: '—— 圣奥古斯丁' },
  { text: '旅行不是为了到达目的地，而是为了享受旅途', source: '—— 歌德' },
  { text: '说走就走，是人生最华丽的奢侈', source: '—— 网络佚名' },
  { text: '答案都在路上，自由都在风里', source: '—— 网络佚名' },
  { text: '有趣的人生，一半是山川湖海', source: '—— 网络佚名' },
  { text: "去看看这个世界，趁它还在，趁你未老", source: '—— 网络佚名' },

  // ── 生活 ──
  { text: '把日子过成诗，简单而精致', source: '—— 网络佚名' },
  { text: '生活不止眼前的苟且，还有诗和远方', source: '—— 高晓松' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负', source: '—— 尼采' },
  { text: '慢慢来，比较快', source: '—— 网络佚名' },
  { text: '愿你出走半生，归来仍是少年', source: '—— 网络佚名' },
  { text: '心之所向，素履以往', source: '—— 《易经》' },
  { text: '不赶什么浪潮，也不搭什么船，我自己有海', source: '—— 陈粒' },
  { text: '最好的时光在路上', source: '—— 网络佚名' },
  { text: '不用刻意去找，美好的事物自然会来', source: '—— 网络佚名' },
  { text: '你看这世界不坏，天高地阔，往来无穷', source: '—— 网络佚名' },
];

let _lastIndex = -1;

/**
 * 返回一条随机语录（避免连续两次返回同一条）。
 * @returns {{ text: string, source: string }}
 */
function getRandomQuote() {
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === _lastIndex && QUOTES.length > 1);
  _lastIndex = idx;
  return QUOTES[idx];
}

module.exports = { getRandomQuote };
