const { addCollectionItem, updateCollectionItem, getCollectionDetail, uploadImage, getTagStats } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    formData: {
      title: '', category: '',
      locationName: '', locationAddress: '',
      latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
      coverImage: '',
    },
    coverImageTemp: '',
    isUploading: false,
    categories: CATEGORIES,
    tagInput: '',
    existingTags: [],
    allTags: [],
    submitting: false,
    isEditing: false,
    editId: '',
  },

  onLoad(options) {
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
            title: item.title || '',
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

    // Load existing tags for quick-add suggestions
    this.loadExistingTags();

    // Check for edit mode triggered from detail page via globalData bridge
    if (app.globalData.editItemId) {
      const editId = app.globalData.editItemId;
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
    this.setData({ 'formData.category': e.currentTarget.dataset.category });
  },
  onChooseLocation() {
    // 先确保有位置权限，再打开地图选择器
    wx.getLocation({
      type: 'wgs84',
      success: () => {
        this.openLocationPicker();
      },
      fail: () => {
        // 无权限时直接弹设置引导
        wx.showModal({
          title: '需要位置权限',
          content: '请在设置中允许小程序使用位置信息',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) wx.openSetting();
          },
        });
      },
    });
  },

  openLocationPicker() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.locationName': res.name || '',
          'formData.locationAddress': res.address || '',
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude,
        });
      },
      fail: (err) => {
        console.log('chooseLocation fail:', err);
        wx.showToast({ title: '选择位置失败', icon: 'none' });
      },
    });
  },
  onTagInput(e) { this.setData({ tagInput: e.detail.value }); },
  onAddTag() {
    const tag = this.data.tagInput.trim();
    if (!tag) return;
    if (this.data.formData.tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' }); return;
    }
    if (this.data.formData.tags.length >= 10) {
      wx.showToast({ title: '最多添加10个标签', icon: 'none' }); return;
    }
    this.setData({
      'formData.tags': [...this.data.formData.tags, tag],
      tagInput: '',
    });
  },

  async loadExistingTags() {
    const res = await getTagStats();
    if (res.success && res.data.length > 0) {
      const allTags = res.data.map(t => t.tag);
      this.setData({ allTags, existingTags: allTags });
    }
  },

  refreshAvailableTags() {
    const added = this.data.formData.tags;
    this.setData({
      existingTags: this.data.allTags.filter(t => added.indexOf(t) === -1),
    });
  },

  onTapExistingTag(e) {
    const tag = e.currentTarget.dataset.tag;
    if (this.data.formData.tags.includes(tag)) return;
    if (this.data.formData.tags.length >= 10) {
      wx.showToast({ title: '最多添加10个标签', icon: 'none' });
      return;
    }
    const tags = [...this.data.formData.tags, tag];
    this.setData({ 'formData.tags': tags });
    this.refreshAvailableTags();
  },

  onRemoveTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.formData.tags];
    tags.splice(index, 1);
    this.setData({ 'formData.tags': tags });
    this.refreshAvailableTags();
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
    let coverImage = formData.coverImage;
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

    const payload = {
      title: formData.title.trim(),
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

    this.setData({ submitting: false, isUploading: false });
    if (result.success) {
      wx.vibrateShort({ type: 'light' });
      wx.showToast({ title: isEditing ? '已更新收藏' : '已加入收藏', icon: 'success', duration: 1500 });

      // Clear form for both add and edit — ready for next use
      const emptyForm = {
        title: '', category: '',
        locationName: '', locationAddress: '',
        latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
        coverImage: '',
      };
      if (isEditing) {
        getApp().globalData.editItemId = null;
        wx.setNavigationBarTitle({ title: '添加收藏' });
        this.setData({ isEditing: false, editId: '', coverImageTemp: '', tagInput: '', formData: emptyForm });
        setTimeout(() => { wx.switchTab({ url: '/pages/list/list' }); }, 800);
      } else {
        this.setData({ coverImageTemp: '', tagInput: '', formData: emptyForm });
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
          getApp().globalData.editItemId = null;
          wx.setNavigationBarTitle({ title: '添加收藏' });
          this.setData({
            formData: {
              title: '', category: '',
              locationName: '', locationAddress: '',
              latitude: 0, longitude: 0, note: '', rating: 0, tags: [],
              coverImage: '',
            },
            coverImageTemp: '',
            tagInput: '',
            isEditing: false,
            editId: '',
          });
        }
      }
    });
  },
});
