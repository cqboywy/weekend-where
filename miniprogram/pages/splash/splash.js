// 七日刊 — 每天不同的杂志封面
const DAILY = [
  {
    day: 1,
    label: '周一刊',
    bg: ['#F0EDE8', '#E8E4DE'],
    accent: '#8C7B6A',
    tagline: '新的一周，新的发现',
    mark: 'line-v', // thin vertical line
  },
  {
    day: 2,
    label: '周二刊',
    bg: ['#EDEBE8', '#E3E0DA'],
    accent: '#9E9284',
    tagline: '节奏渐起，灵感在路上',
    mark: 'lines-h', // two thin horizontal lines
  },
  {
    day: 3,
    label: '周三刊',
    bg: ['#ECEAE5', '#DEDBD3'],
    accent: '#8A9E8C',
    tagline: '半周已过，发现美好',
    mark: 'circle', // small open circle
  },
  {
    day: 4,
    label: '周四刊',
    bg: ['#EFEBE4', '#E5DFD4'],
    accent: '#C2986A',
    tagline: '临近周末，蠢蠢欲动',
    mark: 'diagonal', // thin diagonal line
  },
  {
    day: 5,
    label: '周五刊',
    bg: ['#F2EBE5', '#E8DBD0'],
    accent: '#C2674A',
    tagline: '周末前夜，计划启程',
    mark: 'cross', // two crossed thin lines
  },
  {
    day: 6,
    label: '周六刊',
    bg: ['#F4EDE4', '#EBDFD2'],
    accent: '#B8784A',
    tagline: '今天的每一刻都值得收藏',
    mark: 'dot', // small filled circle
  },
  {
    day: 0,
    label: '周日刊',
    bg: ['#F3F0EC', '#E8E5DF'],
    accent: '#A89880',
    tagline: '慢下来，回味这一周',
    mark: 'dots', // three dots
  },
];

Page({
  data: {
    issue: null,
    fadeIn: false,
  },

  onLoad() {
    const dow = new Date().getDay(); // 0=Sun, 1=Mon, ...
    const issue = DAILY.find(d => d.day === dow) || DAILY[6];
    this.setData({ issue });

    setTimeout(() => this.setData({ fadeIn: true }), 100);
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 2200);
  },
});
