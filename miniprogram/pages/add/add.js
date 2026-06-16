const { addCollectionItem, updateCollectionItem, getCollectionDetail, uploadImage } = require('../../utils/cloud.js');
const { CATEGORIES, PLATFORMS } = require('../../utils/constants.js');

Page({
  data: {
    formData: {
      originalUrl: '', title: '', platform: '', category: '',
      locationName: '', locationAddress: '',
      latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
      coverImage: '',
    },
    coverImageTemp: '',
    isParsing: false,
    parseError: '',
    isUploading: false,
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
            coverImage: item.coverImage || '',
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
    // Refresh categories from globalData (fallback to constants)
    const app = getApp();
    const cats = (app.globalData.categories && app.globalData.categories.length > 0)
      ? app.globalData.categories
      : CATEGORIES;
    this.setData({ categories: cats });

    // Check for edit mode triggered from detail page via globalData bridge
    if (app.globalData.editItemId) {
      const editId = app.globalData.editItemId;
      // Don't consume editItemId here — onShow may fire multiple times
      // (WeChat tab lifecycle). Only clear it after save or explicit reset.
      if (this.data.editId !== editId) {
        wx.setNavigationBarTitle({ title: '编辑收藏' });
        this.setData({ isEditing: true, editId });
        this.loadEditData(editId);
      }
      return;
    }

    // Reset edit state when entering without editItemId
    if (this.data.isEditing) {
      wx.setNavigationBarTitle({ title: '添加收藏' });
      this.setData({ isEditing: false, editId: '' });
    }

    this.checkClipboard();
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

  async parseLink(url, shareHint = '') {
    if (!url) return;
    this.setData({ isParsing: true, parseError: '' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'parseLink',
        data: { url }
      });
      if (res.result && res.result.success) {
        const data = res.result.data;
        // Use OG title if available, fallback to share text hint
        const title = data.title || shareHint || this.data.formData.title;
        this.setData({
          'formData.title': title,
          'formData.platform': data.platform || this.data.formData.platform,
          'formData.coverImage': data.coverImage || this.data.formData.coverImage,
          isParsing: false,
        });
        wx.showToast({ title: title ? '解析成功' : '仅识别平台，请手动填写标题', icon: 'success' });
      } else {
        // Cloud function failed, use share hint as fallback
        if (shareHint) {
          this.setData({
            'formData.title': shareHint,
            isParsing: false,
          });
          wx.showToast({ title: '已从分享文字提取标题', icon: 'success' });
        } else {
          this.setData({ parseError: '链接解析失败，请检查链接是否正确', isParsing: false });
        }
      }
    } catch (err) {
      console.error('链接解析失败:', err);
      if (shareHint) {
        this.setData({ 'formData.title': shareHint, isParsing: false });
        wx.showToast({ title: '已从分享文字提取标题', icon: 'success' });
      } else {
        this.setData({ parseError: '网络错误，请重试', isParsing: false });
      }
    }
  },

  onUrlInput(e) { this.setData({ 'formData.originalUrl': e.detail.value }); },
  onParseTap() {
    const raw = this.data.formData.originalUrl.trim();
    if (!raw) { wx.showToast({ title: '请先粘贴链接或分享文字', icon: 'none' }); return; }

    // Extract URL from share text (e.g. Douyin share format)
    const urlMatch = raw.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : raw;
    if (!url.startsWith('http')) {
      wx.showToast({ title: '未检测到有效链接', icon: 'none' });
      return;
    }

    // Extract title hints from share text (e.g. 看看【作者】描述...)
    let shareHint = '';
    const authorMatch = raw.match(/看看【(.+?)的作品】/);
    if (authorMatch) shareHint = authorMatch[1];

    this.parseLink(url, shareHint);
  },

  onChooseCover() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType,
          success: (chooseRes) => {
            this.setData({ coverImageTemp: chooseRes.tempFilePaths[0] });
          },
        });
      },
    });
  },

  onRemoveCover() {
    this.setData({ coverImageTemp: '', 'formData.coverImage': '' });
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
    const { formData, isEditing, editId, coverImageTemp } = this.data;
    if (!formData.title.trim()) { wx.showToast({ title: '请输入地点名称', icon: 'none' }); return; }
    if (!formData.category) { wx.showToast({ title: '请选择分类', icon: 'none' }); return; }

    this.setData({ submitting: true, isUploading: false });

    // Upload cover image if user picked a new one
    let coverImage = formData.coverImage; // existing URL/fileID
    if (coverImageTemp) {
      this.setData({ isUploading: true });
      const uploadRes = await uploadImage(coverImageTemp);
      if (uploadRes.success) {
        coverImage = uploadRes.fileID;
      } else {
        this.setData({ submitting: false, isUploading: false });
        wx.showToast({ title: '封面上传失败，请重试', icon: 'none' });
        return;
      }
    }

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
      coverImage,
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
        // Consume editItemId now that save is complete
        getApp().globalData.editItemId = null;
        wx.setNavigationBarTitle({ title: '添加收藏' });
        this.setData({ isEditing: false, editId: '' });
        setTimeout(() => { wx.switchTab({ url: '/pages/list/list' }); }, 800);
      } else {
        // Auto-clear form for next addition
        this.setData({
          formData: {
            originalUrl: '', title: '', platform: '', category: '',
            locationName: '', locationAddress: '',
            latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
            coverImage: '',
          },
          coverImageTemp: '',
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
          // Also clear any pending edit mode
          getApp().globalData.editItemId = null;
          wx.setNavigationBarTitle({ title: '添加收藏' });
          this.setData({
            formData: {
              originalUrl: '', title: '', platform: '', category: '',
              locationName: '', locationAddress: '',
              latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
              coverImage: '',
            },
            coverImageTemp: '',
            parseError: '',
            tagInput: '',
            isEditing: false,
            editId: '',
          });
        }
      }
    });
  },
});
