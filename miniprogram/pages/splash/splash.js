const SEASONS = [
  { name: 'spring', months: [3,4,5], bg: ['#F2DFDF','#E8D0D0'], accent: '#C08888', tagline: '万物复苏，出发吧', symbol: 'cherry' },
  { name: 'summer', months: [6,7,8], bg: ['#D8EBF0','#C8DFEB'], accent: '#7EB8C9', tagline: '夏日悠长，去探索', symbol: 'wave' },
  { name: 'autumn', months: [9,10,11], bg: ['#F2E4D4','#E8D4C0'], accent: '#C89878', tagline: '秋高气爽，好时节', symbol: 'leaf' },
  { name: 'winter', months: [12,1,2], bg: ['#EDEFF5','#D8DCE8'], accent: '#98A8C0', tagline: '冬日暖阳，别辜负', symbol: 'snow' },
];

Page({
  data: {
    season: null,
    fadeIn: false,
  },

  onLoad() {
    const month = new Date().getMonth() + 1;
    const season = SEASONS.find(s => s.months.includes(month)) || SEASONS[2]; // default autumn
    this.setData({ season });

    // Fade-in
    setTimeout(() => this.setData({ fadeIn: true }), 100);

    // Navigate to home after 2.2s
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 2200);
  },
});
