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
  { text: '好好吃饭，是平凡日子里最大的浪漫', source: '' },
  { text: '口味要宽一点、杂一点，南甜北咸东辣西酸，都去尝尝', source: '—— 汪曾祺' },
  { text: '食物有很强大的治愈力量', source: '—— 《千与千寻》' },
  { text: '没有什么烦恼是一顿火锅解决不了的', source: '—— 四川谚语' },
  { text: '一个人也要好好吃饭', source: '—— 《孤独的美食家》' },
  { text: '爱就是在一起吃很多很多顿饭', source: '' },
  { text: '没了烟火气，人生就是一段孤独的旅程', source: '—— 《人生一串》' },
  { text: '好吃的，就是好生活', source: '—— 蔡澜' },
  { text: '不求深刻，只求吃饱', source: '' },
  { text: '幸福就是甜品的味道', source: '—— 《西洋骨董洋果子店》' },
  { text: '厨房是世界上最治愈的地方', source: '' },
  { text: '有酒有肉有朋友，人生足矣', source: '' },

  // ── 旅行 ──
  { text: '身体和灵魂，总有一个在路上', source: '—— 《罗马假日》' },
  { text: '世界是一本书，不旅行的人只读了其中一页', source: '—— 圣奥古斯丁' },
  { text: '旅行不是为了到达目的地，而是为了享受旅途', source: '—— 歌德' },
  { text: '说走就走，是人生最华丽的奢侈', source: '' },
  { text: '答案都在路上，自由都在风里', source: '' },
  { text: '有趣的人生，一半是山川湖海', source: '' },
  { text: '去看看这个世界，趁它还在，趁你未老', source: '' },
  { text: '旅行的意义不在于到达，而在于出发', source: '' },
  { text: '一个人的行走范围，就是他的世界', source: '—— 北岛' },
  { text: '远方的远方，比远方更远', source: '—— 海子' },
  { text: '趁着年轻，多去看看这个世界', source: '' },
  { text: '在山野间追风，看黄昏与黎明', source: '' },
  { text: '你要去看看太阳，和心爱的人走在街上', source: '—— 海子' },

  // ── 生活 ──
  { text: '把日子过成诗，简单而精致', source: '' },
  { text: '生活不止眼前的苟且，还有诗和远方', source: '—— 高晓松' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负', source: '—— 尼采' },
  { text: '慢慢来，比较快', source: '' },
  { text: '愿你出走半生，归来仍是少年', source: '' },
  { text: '心之所向，素履以往', source: '—— 《易经》' },
  { text: '不赶什么浪潮，也不搭什么船，我自己有海', source: '—— 陈粒' },
  { text: '最好的时光在路上', source: '' },
  { text: '不用刻意去找，美好的事物自然会来', source: '' },
  { text: '你看这世界不坏，天高地阔，往来无穷', source: '' },
  { text: '万物皆有裂痕，那是光照进来的地方', source: '—— 莱昂纳德·科恩' },
  { text: '总之岁月漫长，然而值得等待', source: '—— 村上春树' },
  { text: '且将新火试新茶，诗酒趁年华', source: '—— 苏轼' },
  { text: '此心安处是吾乡', source: '—— 苏轼' },
  { text: '白日放歌须纵酒，青春作伴好还乡', source: '—— 杜甫' },
  { text: '采菊东篱下，悠然见南山', source: '—— 陶渊明' },
  { text: '行到水穷处，坐看云起时', source: '—— 王维' },
  { text: '我们热爱生活，并非我们习惯生活，而是习惯热爱', source: '' },
  { text: '生活的理想，就是为了理想的生活', source: '—— 张闻天' },
  { text: '所谓生活，一半惊喜一半遗憾', source: '' },
  { text: '今天也是被生活治愈的一天', source: '' },

  // ── 季节 ──
  { text: '吹灭读书灯，一身都是月', source: '—— 孙玉石' },
  { text: '醉后不知天在水，满船清梦压星河', source: '—— 唐温如' },
  { text: '春有百花秋有月，夏有凉风冬有雪', source: '—— 无门慧开' },
  { text: '人间四月芳菲尽，山寺桃花始盛开', source: '—— 白居易' },
  { text: '小扇引微凉，悠悠夏日长', source: '—— 顾太清' },
  { text: '自古逢秋悲寂寥，我言秋日胜春朝', source: '—— 刘禹锡' },
  { text: '晚来天欲雪，能饮一杯无', source: '—— 白居易' },
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
