const { addCollectionItem, updateCollectionItem, getCollectionDetail } = require('../../utils/cloud.js');
const { CATEGORIES, PLATFORMS } = require('../../utils/constants.js');

Page({
  data: {
    formData: {
      originalUrl: '', title: '', platform: '', category: '',
      locationName: '', locationAddress: '',
      latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
    },
    isParsing: false,
    parseError: '',
    categories: CATEGORIES,
    platforms: PLATFORMS,
    tagInput: '',
    showCategoryPicker: false,
    showPlatformPicker: false,
    showMapPicker: false,
    marker: null,
    submitting: false,
    isEditing: false,
    editId: '',
  },

  onLoad(options) {
    if (options.url) {
      this.setData({ 'formData.originalUrl': decodeURIComponent(options.url) });
      this.parseLink(decodeURIComponent(options.url));
    }

    // Edit mode: load existing data from DB
    if (options.edit === '1' && options.id) {
      wx.setNavigationBarTitle({ title: '编辑收藏' });
      this.setData({ isEditing: true, editId: options.id });
      this.loadEditData(options.id);
    }
  },

  async loadEditData(id) {
    try {
      const result = await getCollectionDetail(id);
      if (result.success && result.data) {
        const item = result.data;
        this.setData({
          formData: {
            originalUrl: item.originalUrl || '',
            title: item.title || '',
            platform: item.platform || '',
            category: item.category || '',
            locationName: (item.location && item.location.name) || '',
            locationAddress: (item.location && item.location.address) || '',
            latitude: (item.location && item.location.latitude) || 0,
            longitude: (item.location && item.location.longitude) || 0,
            note: item.note || '',
            rating: item.rating || 0,
            tags: item.tags || [],
          },
        });
      } else {
        wx.showToast({ title: '加载数据失败', icon: 'none' });
      }
    } catch (err) {
      console.error('加载编辑数据失败:', err);
      wx.showToast({ title: '加载数据失败', icon: 'none' });
    }
  },

  onShow() {
    // Check for edit mode triggered from detail page via globalData bridge
    const app = getApp();
    if (app.globalData.editItemId) {
      const editId = app.globalData.editItemId;
      app.globalData.editItemId = null; // consume once
      wx.setNavigationBarTitle({ title: '编辑收藏' });
      this.setData({ isEditing: true, editId });
      this.loadEditData(editId);
      return;
    }

    if (!this.data.isEditing) {
      this.checkClipboard();
    }
  },

  async checkClipboard() {
    try {
      const res = await wx.getClipboardData();
      const content = res.data || '';
      const urlMatch = content.match(/https?:\/\/[^\s]+/);
      if (urlMatch && !this.data.formData.originalUrl) {
        wx.showModal({
          title: '检测到链接',
          content: '剪贴板中有链接，是否添加收藏？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.setData({ 'formData.originalUrl': urlMatch[0] });
              this.parseLink(urlMatch[0]);
            }
          }
        });
      }
    } catch (err) { /* clipboard permission denied, skip silently */ }
  },

  async parseLink(url) {
    if (!url) return;
    this.setData({ isParsing: true, parseError: '' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'parseLink',
        data: { url }
      });
      if (res.result && res.result.success) {
        const data = res.result.data;
        this.setData({
          'formData.title': data.title || this.data.formData.title,
          'formData.platform': data.platform || this.data.formData.platform,
          isParsing: false,
        });
        wx.showToast({ title: '解析成功', icon: 'success' });
      } else {
        this.setData({ parseError: '链接解析失败，请检查链接是否正确', isParsing: false });
      }
    } catch (err) {
      console.error('链接解析失败:', err);
      this.setData({ parseError: '网络错误，请重试', isParsing: false });
    }
  },

  onUrlInput(e) { this.setData({ 'formData.originalUrl': e.detail.value }); },
  onParseTap() {
    const url = this.data.formData.originalUrl.trim();
    if (!url) { wx.showToast({ title: '请先输入链接', icon: 'none' }); return; }
    this.parseLink(url);
  },
  onTitleInput(e) { this.setData({ 'formData.title': e.detail.value }); },
  onSelectCategory(e) {
    this.setData({ 'formData.category': e.currentTarget.dataset.category, showCategoryPicker: false });
  },
  onSelectPlatform(e) {
    this.setData({ 'formData.platform': e.currentTarget.dataset.platform, showPlatformPicker: false });
  },
  onChooseLocation() {
    const that = this;
    wx.chooseLocation({
      success(res) {
        that.setData({
          'formData.locationName': res.name || '',
          'formData.locationAddress': res.address || '',
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude,
        });
      },
      fail(err) {
        if (err.errMsg.indexOf('auth deny') > -1) {
          wx.showToast({ title: '请授权位置权限', icon: 'none' });
        }
      }
    });
  },
  onTagInput(e) { this.setData({ tagInput: e.detail.value }); },
  onAddTag() {
    const tag = this.data.tagInput.trim();
    if (!tag) return;
    if (this.data.formData.tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' }); return;
    }
    if (this.data.formData.tags.length >= 5) {
      wx.showToast({ title: '最多添加5个标签', icon: 'none' }); return;
    }
    this.setData({
      'formData.tags': [...this.data.formData.tags, tag],
      tagInput: '',
    });
  },
  onRemoveTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.formData.tags];
    tags.splice(index, 1);
    this.setData({ 'formData.tags': tags });
  },
  onRate(e) {
    const rate = parseInt(e.currentTarget.dataset.rate) || 0;
    this.setData({ 'formData.rating': rate });
  },
  onNoteInput(e) { this.setData({ 'formData.note': e.detail.value }); },

  async onSubmit() {
    const { formData, isEditing, editId } = this.data;
    if (!formData.title.trim()) { wx.showToast({ title: '请输入地点名称', icon: 'none' }); return; }
    if (!formData.category) { wx.showToast({ title: '请选择分类', icon: 'none' }); return; }

    this.setData({ submitting: true });
    const platformInfo = PLATFORMS.find(p => p.key === formData.platform) || PLATFORMS.find(p => p.key === 'other');

    const payload = {
      title: formData.title.trim(),
      platform: formData.platform || 'other',
      platformLabel: platformInfo.label,
      originalUrl: formData.originalUrl,
      category: formData.category,
      tags: formData.tags,
      location: {
        name: formData.locationName,
        address: formData.locationAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      note: formData.note,
      rating: formData.rating,
    };

    let result;
    if (isEditing) {
      result = await updateCollectionItem(editId, payload);
    } else {
      payload.status = 'want_to_go';
      result = await addCollectionItem(payload);
    }

    this.setData({ submitting: false });
    if (result.success) {
      wx.vibrateShort({ type: 'light' });
      wx.showToast({ title: isEditing ? '已更新收藏' : '已加入收藏', icon: 'success', duration: 1500 });
      if (isEditing) {
        setTimeout(() => { wx.navigateBack(); }, 800);
      } else {
        // Auto-clear form for next addition
        this.setData({
          formData: {
            originalUrl: '', title: '', platform: '', category: '',
            locationName: '', locationAddress: '',
            latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
          },
          parseError: '',
          tagInput: '',
        });
      }
    } else {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  onReset() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空已填写的内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            formData: {
              originalUrl: '', title: '', platform: '', category: '',
              locationName: '', locationAddress: '',
              latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
            },
            parseError: '',
            tagInput: '',
          });
        }
      }
    });
  },
});
