/**
 * 天气感知问候语映射表
 * timeSlot × weatherType → 诗意短语
 */

// 根据小时获取时段
function getTimeSlot(hour) {
  if (hour < 5) return 'night';       // 夜深 0-4
  if (hour < 7) return 'dawn';        // 拂晓 5-6
  if (hour < 9) return 'morning';     // 晨间 7-8
  if (hour < 11) return 'lateMorning';// 上午 9-10
  if (hour < 14) return 'noon';       // 正午 11-13
  if (hour < 17) return 'afternoon';  // 午后 14-16
  if (hour < 19) return 'dusk';       // 黄昏 17-18
  return 'evening';                   // 入夜 19-23
}

// 纯时间短语（无天气数据时的回退）
const TIME_ONLY = {
  night: '夜深人静',
  dawn: '晨光熹微',
  morning: '天朗气清',
  lateMorning: '天朗气清',
  noon: '日正当中',
  afternoon: '日影西斜',
  dusk: '暮色四合',
  evening: '暮色四合',
};

// timeSlot × weatherType 矩阵
const MATRIX = {
  // ──── 晴 ────
  sunny: {
    night: '星河欲转',
    dawn: '东方既白',
    morning: '晨光熹微',
    lateMorning: '碧空如洗',
    noon: '日暖风恬',
    afternoon: '晴光潋滟',
    dusk: '晚霞似火',
    evening: '月出皎兮',
  },
  // ──── 多云 ────
  cloudy: {
    night: '云隐疏星',
    dawn: '薄明微熹',
    morning: '白云初晴',
    lateMorning: '云淡风轻',
    noon: '云影徘徊',
    afternoon: '浮云卷舒',
    dusk: '云霞成绮',
    evening: '云破月来',
  },
  // ──── 阴 ────
  overcast: {
    night: '夜色如墨',
    dawn: '天光未开',
    morning: '薄雾笼城',
    lateMorning: '天色柔柔',
    noon: '天幕低垂',
    afternoon: '沉云不散',
    dusk: '苍然暮色',
    evening: '暝色入楼',
  },
  // ──── 雨 ────
  rain: {
    night: '夜雨寄北',
    dawn: '晓来雨过',
    morning: '雨打芭蕉',
    lateMorning: '烟雨濛濛',
    noon: '一帘疏雨',
    afternoon: '雨过天青',
    dusk: '暮雨潇潇',
    evening: '巴山夜雨',
  },
  // ──── 雪 ────
  snow: {
    night: '雪落无声',
    dawn: '晨雪初霁',
    morning: '飞雪迎春',
    lateMorning: '碎琼乱玉',
    noon: '碎琼乱玉',
    afternoon: '踏雪寻梅',
    dusk: '晚来欲雪',
    evening: '风雪夜归',
  },
  // ──── 雾/霾 ────
  fog: {
    night: '夜雾朦胧',
    dawn: '晨雾迷蒙',
    morning: '雾失楼台',
    lateMorning: '轻纱漫城',
    noon: '轻纱漫城',
    afternoon: '暮霭沉沉',
    dusk: '暮霭沉沉',
    evening: '夜雾朦胧',
  },
  // ──── 风 ────
  windy: {
    night: '夜风习习',
    dawn: '晨风微凉',
    morning: '风起青萍',
    lateMorning: '清风徐来',
    noon: '惠风和畅',
    afternoon: '惠风和畅',
    dusk: '晚风拂柳',
    evening: '夜风习习',
  },
};

/**
 * 获取问候语
 * @param {number} hour - 当前小时 (0-23)
 * @param {string|null} weatherType - 天气类型，null 则用纯时间短语
 * @returns {string} 诗意短语
 */
function getGreeting(hour, weatherType) {
  const slot = getTimeSlot(hour);
  if (!weatherType || !MATRIX[weatherType]) {
    return TIME_ONLY[slot];
  }
  return MATRIX[weatherType][slot] || TIME_ONLY[slot];
}

/**
 * WMO 天气码（Open-Meteo） → 简化天气类型
 *   0=晴 1-3=多云 45,48=雾 51-67=雨 71-77=雪 80-99=雨/雷暴
 * @param {number} code
 * @returns {string} sunny | cloudy | overcast | rain | snow | fog | windy
 */
function classifyWmoCode(code) {
  if (code === 0 || code === 1) return 'sunny';  // 晴、大部晴
  if (code === 2) return 'cloudy';               // 少云→多云
  if (code === 3) return 'overcast';              // 阴
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 99) return 'rain';
  return 'sunny';
}

module.exports = { getGreeting, getTimeSlot, TIME_ONLY, classifyWmoCode };
