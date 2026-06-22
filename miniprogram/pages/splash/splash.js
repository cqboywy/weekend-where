// 七日刊 — 每天不同的杂志封面
const DAILY = [
  {
    day: 1,
    label: '周一刊',
    bg: ['#FF9A8B', '#FFB8A9'],
    accent: '#FFFFFF',
    tagline: '新的一周，新的发现',
    mark: 'line-v',
  },
  {
    day: 2,
    label: '周二刊',
    bg: ['#7ECB9A', '#A8DFB9'],
    accent: '#FFFFFF',
    tagline: '节奏渐起，灵感在路上',
    mark: 'lines-h',
  },
  {
    day: 3,
    label: '周三刊',
    bg: ['#FFD166', '#FFE099'],
    accent: '#4A3728',
    tagline: '半周已过，发现美好',
    mark: 'circle',
  },
  {
    day: 4,
    label: '周四刊',
    bg: ['#C3A6D8', '#DBBFEB'],
    accent: '#FFFFFF',
    tagline: '临近周末，蠢蠢欲动',
    mark: 'diagonal',
  },
  {
    day: 5,
    label: '周五刊',
    bg: ['#FF8A80', '#FFB3A8'],
    accent: '#FFFFFF',
    tagline: '周末前夜，计划启程',
    mark: 'cross',
  },
  {
    day: 6,
    label: '周六刊',
    bg: ['#F7A06B', '#FBBF8E'],
    accent: '#FFFFFF',
    tagline: '今天的每一刻都值得收藏',
    mark: 'dot',
  },
  {
    day: 0,
    label: '周日刊',
    bg: ['#81CFD0', '#ADE3E4'],
    accent: '#2C2416',
    tagline: '慢下来，回味这一周',
    mark: 'dots',
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
