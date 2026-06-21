// 七日刊 — 每天不同的杂志封面
const DAILY = [
  {
    day: 1,
    label: '周一刊',
    bg: ['#1C232B', '#2E3A46'],
    accent: '#D4C5B9',
    tagline: '新的一周，新的发现',
    mark: 'line-v',
  },
  {
    day: 2,
    label: '周二刊',
    bg: ['#4A6B5F', '#5B8070'],
    accent: '#F2E8DC',
    tagline: '节奏渐起，灵感在路上',
    mark: 'lines-h',
  },
  {
    day: 3,
    label: '周三刊',
    bg: ['#7B2D3B', '#5C2330'],
    accent: '#E8C4A0',
    tagline: '半周已过，发现美好',
    mark: 'circle',
  },
  {
    day: 4,
    label: '周四刊',
    bg: ['#3D5A4B', '#2E4639'],
    accent: '#F0D9B5',
    tagline: '临近周末，蠢蠢欲动',
    mark: 'diagonal',
  },
  {
    day: 5,
    label: '周五刊',
    bg: ['#C2674A', '#9E4A32'],
    accent: '#FFE8D6',
    tagline: '周末前夜，计划启程',
    mark: 'cross',
  },
  {
    day: 6,
    label: '周六刊',
    bg: ['#4A3E5C', '#5C4F72'],
    accent: '#F2E0C8',
    tagline: '今天的每一刻都值得收藏',
    mark: 'dot',
  },
  {
    day: 0,
    label: '周日刊',
    bg: ['#8BA4B5', '#A3BCCC'],
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
