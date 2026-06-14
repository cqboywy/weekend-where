# 周末去哪儿 P1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建「周末去哪儿」微信小程序 P1「收藏管家」，实现跨平台收藏聚合、地图查看、列表浏览和分享的核心闭环。

**Architecture:** 微信原生小程序 + CloudBase 云开发（云函数/云数据库/云存储）。5个Tab页面（首页/地图/添加/列表/我的），3个共享组件（收藏卡片/骨架屏/空状态），1个云函数（链接解析）。数据通过云数据库JSON集合存储，图片走云存储CDN。

**Tech Stack:** 微信原生框架 + WeUI样式库 + CloudBase JS SDK + 腾讯地图 wx. API

---

## 文件结构总览

```
weekend-where/
├── project.config.json
├── miniprogram/
│   ├── app.js / app.json / app.wxss        # 应用入口 & 全局配置
│   ├── pages/
│   │   ├── index/       # 首页: 快捷入口 + 最近收藏
│   │   ├── map/         # 地图: 收藏标记点浏览
│   │   ├── add/         # 添加: 粘贴链接/手动录入
│   │   ├── list/        # 列表: 瀑布流 + 筛选搜索
│   │   ├── detail/      # 详情: 地点信息 + 导航
│   │   └── mine/        # 我的: 统计 + 设置
│   ├── components/
│   │   ├── collection-card/  # 收藏卡片(列表用)
│   │   ├── skeleton/         # 骨架屏加载占位
│   │   └── empty-state/      # 空数据提示
│   └── utils/
│       ├── cloud.js          # CloudBase 初始化
│       ├── util.js           # 通用工具
│       └── constants.js      # 常量(分类/平台/配色)
├── cloudfunctions/
│   └── parseLink/            # 链接解析云函数
│       ├── index.js
│       └── package.json
└── docs/
```

---

### Task 1: 项目脚手架 & 全局配置

**Files:**
- Create: `project.config.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/utils/cloud.js`
- Create: `miniprogram/utils/constants.js`

- [ ] **Step 1: 创建 project.config.json**

```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "condition": false
  },
  "appid": "YOUR_APPID_HERE",
  "projectname": "weekend-where",
  "libVersion": "3.3.4",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate/",
  "condition": {}
}
```

- [ ] **Step 2: 创建 miniprogram/app.js — 应用入口**

```javascript
// miniprogram/app.js
App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'YOUR_CLOUD_ENV_ID',
        traceUser: true,
      });
    }

    // 获取用户 openid（云开发免登录获取）
    this.getOpenId();
  },

  globalData: {
    openid: '',
    categories: [],
    platforms: [],
  },

  getOpenId: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        this.globalData.openid = res.result.openid;
      },
      fail: err => {
        console.error('获取 openid 失败:', err);
      }
    });
  }
});
```

- [ ] **Step 3: 创建 miniprogram/app.json — 全局配置 & TabBar**

```json
{
  "pages": [
    "pages/index/index",
    "pages/map/map",
    "pages/add/add",
    "pages/list/list",
    "pages/detail/detail",
    "pages/mine/mine"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#FFF8F0",
    "navigationBarTitleText": "周末去哪儿",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#FFF8F0"
  },
  "tabBar": {
    "color": "#8B7355",
    "selectedColor": "#FF9A56",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/tab-home.png",
        "selectedIconPath": "images/tab-home-active.png"
      },
      {
        "pagePath": "pages/map/map",
        "text": "地图",
        "iconPath": "images/tab-map.png",
        "selectedIconPath": "images/tab-map-active.png"
      },
      {
        "pagePath": "pages/add/add",
        "text": "添加",
        "iconPath": "images/tab-add.png",
        "selectedIconPath": "images/tab-add-active.png"
      },
      {
        "pagePath": "pages/list/list",
        "text": "列表",
        "iconPath": "images/tab-list.png",
        "selectedIconPath": "images/tab-list-active.png"
      },
      {
        "pagePath": "pages/mine/mine",
        "text": "我的",
        "iconPath": "images/tab-mine.png",
        "selectedIconPath": "images/tab-mine-active.png"
      }
    ]
  },
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于地图展示附近收藏"
    }
  },
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 4: 创建 miniprogram/app.wxss — 全局样式**

```css
/* miniprogram/app.wxss */

/* 设计系统变量 */
page {
  --color-bg: #FFF8F0;
  --color-primary: #FF9A56;
  --color-accent: #8B9D6B;
  --color-accent-red: #FF6B6B;
  --color-neutral: #E8D5B7;
  --color-text: #4A3728;
  --color-text-light: #8B7355;
  --color-white: #FFFFFF;
  --color-border: #F0E6D8;
  --radius-lg: 20rpx;
  --radius-md: 12rpx;
  --shadow-card: 0 4rpx 20rpx rgba(74, 55, 40, 0.08);
  --shadow-float: 0 8rpx 32rpx rgba(74, 55, 40, 0.12);

  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  line-height: 1.6;
}

/* 通用工具类 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 卡片通用样式 */
.card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* 标签通用样式 */
.tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  line-height: 1.6;
}

.tag-primary {
  background: rgba(255, 154, 86, 0.15);
  color: var(--color-primary);
}

.tag-accent {
  background: rgba(139, 157, 107, 0.15);
  color: var(--color-accent);
}
```

- [ ] **Step 5: 创建 miniprogram/utils/cloud.js — CloudBase 封装**

```javascript
// miniprogram/utils/cloud.js

const db = wx.cloud.database();
const _ = db.command;

/**
 * 获取集合引用
 */
function collection(name) {
  return db.collection(name);
}

/**
 * 添加收藏
 */
async function addCollectionItem(data) {
  try {
    const res = await collection('collection_items').add({
      data: {
        ...data,
        userId: getApp().globalData.openid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
    return { success: true, id: res._id };
  } catch (err) {
    console.error('添加收藏失败:', err);
    return { success: false, error: err };
  }
}

/**
 * 获取收藏列表（分页）
 */
async function getCollections({ category, keyword, status, skip = 0, limit = 20 } = {}) {
  try {
    const userId = getApp().globalData.openid;
    let query = collection('collection_items').where({ userId });

    if (category) {
      query = query.where({ category });
    }
    if (status) {
      query = query.where({ status });
    }
    if (keyword) {
      query = query.where(
        _.or([
          { title: db.RegExp({ regexp: keyword, options: 'i' }) },
          { note: db.RegExp({ regexp: keyword, options: 'i' }) },
          { 'location.name': db.RegExp({ regexp: keyword, options: 'i' }) },
        ])
      );
    }

    const res = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get();

    return { success: true, data: res.data, hasMore: res.data.length === limit };
  } catch (err) {
    console.error('获取收藏列表失败:', err);
    return { success: false, error: err, data: [] };
  }
}

/**
 * 获取所有收藏（地图用，不分页，最多200条）
 */
async function getAllCollections() {
  try {
    const userId = getApp().globalData.openid;
    const res = await collection('collection_items')
      .where({ userId })
      .field({ title: true, 'location.latitude': true, 'location.longitude': true, category: true, coverImage: true })
      .limit(200)
      .get();
    return { success: true, data: res.data };
  } catch (err) {
    console.error('获取全部收藏失败:', err);
    return { success: false, error: err, data: [] };
  }
}

/**
 * 获取单个收藏详情
 */
async function getCollectionDetail(id) {
  try {
    const res = await collection('collection_items').doc(id).get();
    return { success: true, data: res.data };
  } catch (err) {
    console.error('获取收藏详情失败:', err);
    return { success: false, error: err };
  }
}

/**
 * 更新收藏
 */
async function updateCollectionItem(id, data) {
  try {
    await collection('collection_items').doc(id).update({
      data: { ...data, updatedAt: new Date().toISOString() }
    });
    return { success: true };
  } catch (err) {
    console.error('更新收藏失败:', err);
    return { success: false, error: err };
  }
}

/**
 * 删除收藏
 */
async function deleteCollectionItem(id) {
  try {
    await collection('collection_items').doc(id).remove();
    return { success: true };
  } catch (err) {
    console.error('删除收藏失败:', err);
    return { success: false, error: err };
  }
}

/**
 * 获取收藏统计
 */
async function getCollectionStats() {
  try {
    const userId = getApp().globalData.openid;
    const coll = collection('collection_items');

    // 总数
    const totalRes = await coll.where({ userId }).count();

    // 按状态统计
    const wantRes = await coll.where({ userId, status: 'want_to_go' }).count();
    const visitedRes = await coll.where({ userId, status: 'visited' }).count();

    // 按分类统计（聚合）
    const categoryRes = await coll.where({ userId })
      .field({ category: true })
      .limit(200)
      .get();

    const categoryCount = {};
    categoryRes.data.forEach(item => {
      const cat = item.category || '未分类';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return {
      success: true,
      data: {
        total: totalRes.total,
        wantToGo: wantRes.total,
        visited: visitedRes.total,
        byCategory: categoryCount,
      }
    };
  } catch (err) {
    console.error('获取统计失败:', err);
    return { success: false, error: err };
  }
}

module.exports = {
  db,
  _,
  collection,
  addCollectionItem,
  getCollections,
  getAllCollections,
  getCollectionDetail,
  updateCollectionItem,
  deleteCollectionItem,
  getCollectionStats,
};
```

- [ ] **Step 6: 创建 miniprogram/utils/constants.js**

```javascript
// miniprogram/utils/constants.js

/** 预设分类 */
const CATEGORIES = [
  { key: 'hotpot', label: '🍲 火锅', icon: '🍲' },
  { key: 'barbecue', label: '🥩 烧烤', icon: '🥩' },
  { key: 'chinese', label: '🥢 中餐', icon: '🥢' },
  { key: 'japanese', label: '🍣 日料', icon: '🍣' },
  { key: 'korean', label: '🇰🇷 韩餐', icon: '🇰🇷' },
  { key: 'western', label: '🍝 西餐', icon: '🍝' },
  { key: 'cafe', label: '☕ 咖啡', icon: '☕' },
  { key: 'dessert', label: '🍰 甜品', icon: '🍰' },
  { key: 'street', label: '🍢 小吃', icon: '🍢' },
  { key: 'bar', label: '🍸 酒吧', icon: '🍸' },
  { key: 'park', label: '🌳 公园', icon: '🌳' },
  { key: 'museum', label: '🏛️ 博物馆', icon: '🏛️' },
  { key: 'shopping', label: '🛍️ 逛街', icon: '🛍️' },
  { key: 'sports', label: '⚽ 运动', icon: '⚽' },
  { key: 'entertainment', label: '🎮 娱乐', icon: '🎮' },
  { key: 'other', label: '📌 其他', icon: '📌' },
];

/** 来源平台 */
const PLATFORMS = [
  { key: 'xiaohongshu', label: '小红书', color: '#FF2442' },
  { key: 'douyin', label: '抖音', color: '#000000' },
  { key: 'bilibili', label: 'B站', color: '#FB7299' },
  { key: 'dianping', label: '大众点评', color: '#FF9F0A' },
  { key: 'wechat', label: '微信', color: '#07C160' },
  { key: 'other', label: '其他', color: '#999999' },
];

/** 收藏状态 */
const STATUS = [
  { key: 'want_to_go', label: '想去' },
  { key: 'visited', label: '去过' },
];

/** 设计系统颜色（引用 app.wxss 变量值） */
const COLORS = {
  bg: '#FFF8F0',
  primary: '#FF9A56',
  accent: '#8B9D6B',
  accentRed: '#FF6B6B',
  neutral: '#E8D5B7',
  text: '#4A3728',
  textLight: '#8B7355',
  white: '#FFFFFF',
};

module.exports = {
  CATEGORIES,
  PLATFORMS,
  STATUS,
  COLORS,
};
```

- [ ] **Step 7: 验证**

在微信开发者工具中打开项目：
1. 确认 `app.json` 无报错，页面路径正确
2. 确认 Tab 栏显示 5 个 Tab
3. 确认全局背景色为暖白色 `#FFF8F0`
4. 确认控制台无红色报错（除了因云环境未配置导致的 login 错误，可先忽略）

---

### Task 2: CloudBase 云环境 & 数据库初始化

**Files:**
- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/login/package.json`

- [ ] **Step 1: 创建 login 云函数**

```javascript
// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  return { openid: OPENID };
};
```

```json
// cloudfunctions/login/package.json
{
  "name": "login",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 在微信开发者工具中初始化云环境**

1. 点击「云开发」按钮进入云开发控制台
2. 创建环境（建议命名为 `weekend-where`）
3. 在 `app.js` 中替换 `env: 'YOUR_CLOUD_ENV_ID'` 为实际环境ID
4. 右键 `cloudfunctions/login` → 上传并部署：云端安装依赖

- [ ] **Step 3: 创建数据库集合**

在云开发控制台 → 数据库，创建以下集合：

**collection_items 集合：**
```json
{
  "_id": "auto",
  "userId": "string (openid)",
  "title": "string - 地点名称",
  "platform": "string - 来源平台key",
  "platformLabel": "string - 平台中文名",
  "originalUrl": "string - 原始链接",
  "coverImage": "string - 云存储fileID",
  "category": "string - 分类key",
  "tags": ["string"],
  "location": {
    "name": "string",
    "address": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "note": "string - 个人备注",
  "rating": "number - 评分1-5",
  "status": "string - want_to_go | visited",
  "createdAt": "string - ISO时间",
  "updatedAt": "string - ISO时间"
}
```

**设置索引（提升查询性能）：**
- `userId` 升序索引（必设）
- `userId + category` 复合索引
- `userId + createdAt` 复合索引（降序）
- `userId + status` 复合索引

**权限设置：**
- 所有集合权限设置为「仅创建者可读写」

- [ ] **Step 4: 创建云存储目录**

在云开发控制台 → 存储：
1. 创建目录 `covers/`（用于存储收藏封面图）
2. 上传一张默认封面图 `covers/default-cover.png`

- [ ] **Step 5: 验证**

1. 在小程序中调用 `wx.cloud.callFunction({ name: 'login' })`，确认能获取到 openid
2. 在云开发控制台查看 `collection_items` 集合是否存在
3. 在控制台手动插入一条测试数据，确认索引生效

---

### Task 3: 收藏卡片组件 (collection-card)

**Files:**
- Create: `miniprogram/components/collection-card/index.js`
- Create: `miniprogram/components/collection-card/index.json`
- Create: `miniprogram/components/collection-card/index.wxml`
- Create: `miniprogram/components/collection-card/index.wxss`

- [ ] **Step 1: 创建组件 JS**

```javascript
// miniprogram/components/collection-card/index.js
const { PLATFORMS, CATEGORIES } = require('../../utils/constants.js');

Component({
  properties: {
    item: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (newVal) {
          this.processItem(newVal);
        }
      }
    },
    showStatus: {
      type: Boolean,
      value: true,
    }
  },

  data: {
    platformInfo: {},
    categoryInfo: {},
    formattedDate: '',
  },

  methods: {
    processItem(item) {
      // 平台信息
      const platformInfo = PLATFORMS.find(p => p.key === item.platform) || PLATFORMS.find(p => p.key === 'other');
      
      // 分类信息
      const categoryInfo = CATEGORIES.find(c => c.key === item.category) || CATEGORIES.find(c => c.key === 'other');
      
      // 格式化日期
      const date = new Date(item.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      let formattedDate;
      if (diffDays === 0) formattedDate = '今天';
      else if (diffDays === 1) formattedDate = '昨天';
      else if (diffDays < 7) formattedDate = `${diffDays}天前`;
      else formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

      this.setData({ platformInfo, categoryInfo, formattedDate });
    },

    onTap() {
      this.triggerEvent('tap', { item: this.properties.item });
    },

    onLongPress() {
      this.triggerEvent('longpress', { item: this.properties.item });
    },
  }
});
```

- [ ] **Step 2: 创建组件模板**

```xml
<!-- miniprogram/components/collection-card/index.wxml -->
<view class="collection-card card" bindtap="onTap" bindlongpress="onLongPress">
  <!-- 封面图 -->
  <view class="card-cover">
    <image 
      src="{{item.coverImage || '/images/default-cover.png'}}" 
      mode="aspectFill" 
      class="cover-image"
      lazy-load="{{true}}"
    />
    <!-- 平台标签 -->
    <view class="platform-badge" style="background: {{platformInfo.color}};">
      {{platformInfo.label}}
    </view>
    <!-- 状态标签 -->
    <view wx:if="{{showStatus && item.status === 'visited'}}" class="status-badge">
      ✅ 去过
    </view>
  </view>

  <!-- 内容区 -->
  <view class="card-body">
    <view class="card-title ellipsis">{{item.title || '未命名地点'}}</view>
    
    <view class="card-meta">
      <view class="category-tag tag tag-primary">{{categoryInfo.label}}</view>
      <view wx:if="{{item.rating}}" class="rating">
        <text wx:for="{{[1,2,3,4,5]}}" wx:key="*this" 
              style="color: {{index < item.rating ? '#FF9A56' : '#E8D5B7'}};">★</text>
      </view>
    </view>

    <view wx:if="{{item.location && item.location.name}}" class="card-location ellipsis">
      📍 {{item.location.name}}
    </view>

    <view class="card-footer">
      <text class="card-date">{{formattedDate}}</text>
      <view wx:if="{{item.note}}" class="card-note ellipsis">{{item.note}}</view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 创建组件样式**

```css
/* miniprogram/components/collection-card/index.wxss */
.collection-card {
  margin: 16rpx;
  transition: transform 0.2s;
}
.collection-card:active {
  transform: scale(0.98);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 360rpx;
  overflow: hidden;
}
.cover-image {
  width: 100%;
  height: 100%;
}
.platform-badge {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #fff;
}
.status-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
}

.card-body {
  padding: 20rpx;
}
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12rpx;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.rating {
  font-size: 24rpx;
}
.card-location {
  font-size: 24rpx;
  color: var(--color-text-light);
  margin-bottom: 8rpx;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 22rpx;
  color: var(--color-text-light);
}
.card-date {
  color: #B8A99A;
}
.card-note {
  max-width: 60%;
  text-align: right;
}
```

- [ ] **Step 4: 创建组件 JSON**

```json
{
  "component": true,
  "usingComponents": {}
}
```

- [ ] **Step 5: 验证**

在任意页面（如列表页）中引入组件测试：
```json
{ "usingComponents": { "collection-card": "/components/collection-card/index" } }
```
传递测试数据验证卡片渲染正常。

---

### Task 4: 骨架屏 & 空状态组件

**Files:**
- Create: `miniprogram/components/skeleton/index.js`
- Create: `miniprogram/components/skeleton/index.json`
- Create: `miniprogram/components/skeleton/index.wxml`
- Create: `miniprogram/components/skeleton/index.wxss`
- Create: `miniprogram/components/empty-state/index.js`
- Create: `miniprogram/components/empty-state/index.json`
- Create: `miniprogram/components/empty-state/index.wxml`
- Create: `miniprogram/components/empty-state/index.wxss`

- [ ] **Step 1: 骨架屏组件 JS**

```javascript
// miniprogram/components/skeleton/index.js
Component({
  properties: {
    loading: {
      type: Boolean,
      value: true,
    },
    count: {
      type: Number,
      value: 3,  // 默认展示3个骨架卡片
    },
  },
  data: {
    skeletonList: [],
  },
  lifetimes: {
    attached() {
      this.setData({
        skeletonList: Array.from({ length: this.properties.count }, (_, i) => i)
      });
    }
  }
});
```

- [ ] **Step 2: 骨架屏组件模板**

```xml
<!-- miniprogram/components/skeleton/index.wxml -->
<view wx:if="{{loading}}" class="skeleton-container">
  <view class="skeleton-card" wx:for="{{skeletonList}}" wx:key="*this">
    <view class="skeleton-cover shimmer"></view>
    <view class="skeleton-body">
      <view class="skeleton-line w-80 shimmer"></view>
      <view class="skeleton-line w-40 shimmer"></view>
      <view class="skeleton-line w-60 shimmer"></view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 骨架屏组件样式**

```css
/* miniprogram/components/skeleton/index.wxss */
.skeleton-container {
  padding: 16rpx;
}
.skeleton-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  margin-bottom: 24rpx;
  overflow: hidden;
}
.skeleton-cover {
  width: 100%;
  height: 360rpx;
  background: #F0E6D8;
}
.skeleton-body {
  padding: 20rpx;
}
.skeleton-line {
  height: 28rpx;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
  background: #F0E6D8;
}
.skeleton-line.w-80 { width: 80%; }
.skeleton-line.w-60 { width: 60%; }
.skeleton-line.w-40 { width: 40%; }

/* 闪烁动画 */
@keyframes shimmer {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
.shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

- [ ] **Step 4: 空状态组件 JS + 模板 + 样式**

```javascript
// miniprogram/components/empty-state/index.js
Component({
  properties: {
    icon: {
      type: String,
      value: '📭',
    },
    title: {
      type: String,
      value: '还没有收藏哦',
    },
    description: {
      type: String,
      value: '去添加你的第一个美食或游玩地点吧',
    },
    showButton: {
      type: Boolean,
      value: true,
    },
    buttonText: {
      type: String,
      value: '添加收藏',
    },
  },
  methods: {
    onButtonTap() {
      this.triggerEvent('action');
    }
  }
});
```

```xml
<!-- miniprogram/components/empty-state/index.wxml -->
<view class="empty-state">
  <view class="empty-icon">{{icon}}</view>
  <view class="empty-title">{{title}}</view>
  <view class="empty-desc">{{description}}</view>
  <button wx:if="{{showButton}}" class="empty-btn" bindtap="onButtonTap">
    {{buttonText}}
  </button>
</view>
```

```css
/* miniprogram/components/empty-state/index.wxss */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}
.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}
.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12rpx;
}
.empty-desc {
  font-size: 26rpx;
  color: var(--color-text-light);
  text-align: center;
  margin-bottom: 40rpx;
}
.empty-btn {
  background: var(--color-primary);
  color: #fff;
  border-radius: 40rpx;
  padding: 16rpx 60rpx;
  font-size: 28rpx;
  border: none;
}
```

- [ ] **Step 5: 空状态组件 JSON**

```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 6: 验证**

在任意页面引入两个组件，分别测试 loading=true 和空数据状态下的渲染效果。

---

### Task 5: 添加收藏页 (add)

**Files:**
- Create: `miniprogram/pages/add/add.js`
- Create: `miniprogram/pages/add/add.json`
- Create: `miniprogram/pages/add/add.wxml`
- Create: `miniprogram/pages/add/add.wxss`

- [ ] **Step 1: 页面 JS — 核心添加逻辑**

```javascript
// miniprogram/pages/add/add.js
const { addCollectionItem } = require('../../utils/cloud.js');
const { CATEGORIES, PLATFORMS } = require('../../utils/constants.js');

Page({
  data: {
    // 表单数据
    formData: {
      originalUrl: '',
      title: '',
      platform: '',
      category: '',
      locationName: '',
      locationAddress: '',
      latitude: 0,
      longitude: 0,
      note: '',
      rating: 0,
      tags: [],
    },

    // UI 状态
    isParsing: false,
    parseError: '',
    categories: CATEGORIES,
    platforms: PLATFORMS,
    tagInput: '',
    showCategoryPicker: false,
    showPlatformPicker: false,

    // 地图选点
    showMapPicker: false,
    marker: null,

    // 提交状态
    submitting: false,
  },

  onLoad(options) {
    // 如果从剪贴板跳转，预填URL
    if (options.url) {
      this.setData({ 'formData.originalUrl': decodeURIComponent(options.url) });
      this.parseLink(decodeURIComponent(options.url));
    }
  },

  onShow() {
    // 剪贴板检测：如果有链接则询问
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
    } catch (err) {
      // 剪贴板无权限或无内容，静默跳过
    }
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
          'formData.title': data.title || '',
          'formData.platform': data.platform || '',
          'formData.coverImage': data.coverImage || '',
          isParsing: false,
        });

        wx.showToast({ title: '解析成功', icon: 'success' });
      } else {
        this.setData({
          parseError: '链接解析失败，请检查链接是否正确',
          isParsing: false,
        });
      }
    } catch (err) {
      console.error('链接解析失败:', err);
      this.setData({
        parseError: '网络错误，请重试',
        isParsing: false,
      });
    }
  },

  // 输入链接
  onUrlInput(e) {
    this.setData({ 'formData.originalUrl': e.detail.value });
  },

  // 点击解析
  onParseTap() {
    const url = this.data.formData.originalUrl.trim();
    if (!url) {
      wx.showToast({ title: '请先输入链接', icon: 'none' });
      return;
    }
    this.parseLink(url);
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
  },

  // 选择分类
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ 'formData.category': category, showCategoryPicker: false });
  },

  // 选择平台
  onSelectPlatform(e) {
    const platform = e.currentTarget.dataset.platform;
    this.setData({ 'formData.platform': platform, showPlatformPicker: false });
  },

  // 地图选点
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

  // 添加标签
  onTagInput(e) {
    this.setData({ tagInput: e.detail.value });
  },
  onAddTag() {
    const tag = this.data.tagInput.trim();
    if (!tag) return;
    if (this.data.formData.tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    if (this.data.formData.tags.length >= 5) {
      wx.showToast({ title: '最多添加5个标签', icon: 'none' });
      return;
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

  // 评分
  onRate(e) {
    this.setData({ 'formData.rating': e.currentTarget.dataset.rate });
  },

  // 备注
  onNoteInput(e) {
    this.setData({ 'formData.note': e.detail.value });
  },

  // 提交
  async onSubmit() {
    const { formData } = this.data;

    // 校验
    if (!formData.title.trim()) {
      wx.showToast({ title: '请输入地点名称', icon: 'none' });
      return;
    }
    if (!formData.category) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const platformInfo = PLATFORMS.find(p => p.key === formData.platform) || PLATFORMS.find(p => p.key === 'other');
    
    const result = await addCollectionItem({
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
      status: 'want_to_go',
    });

    this.setData({ submitting: false });

    if (result.success) {
      // 成功动效
      wx.vibrateShort({ type: 'light' });
      this.showSuccessAnimation();
      
      wx.showToast({ title: '收藏成功！', icon: 'success', duration: 1500 });
      
      // 延迟返回首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } else {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  showSuccessAnimation() {
    // 简单的成功提示
    wx.showToast({ title: '⭐ 已加入收藏', icon: 'none', duration: 1200 });
  },

  // 重置表单
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
          });
        }
      }
    });
  },
});
```

- [ ] **Step 2: 页面模板**

```xml
<!-- miniprogram/pages/add/add.wxml -->
<view class="page add-page">
  <view class="page-header">
    <view class="header-title">添加收藏</view>
    <view class="header-desc">收藏一个好吃或好玩的地方</view>
  </view>

  <!-- 链接输入区 -->
  <view class="section card">
    <view class="section-title">🔗 粘贴链接（自动识别）</view>
    <view class="url-input-row">
      <input 
        class="url-input" 
        placeholder="粘贴小红书/抖音/B站/大众点评链接..."
        value="{{formData.originalUrl}}"
        bindinput="onUrlInput"
        confirm-type="done"
      />
      <button 
        class="parse-btn {{isParsing ? 'loading' : ''}}" 
        bindtap="onParseTap"
        disabled="{{isParsing}}"
        size="mini"
      >
        {{isParsing ? '解析中...' : '解析'}}
      </button>
    </view>
    <view wx:if="{{parseError}}" class="parse-error">{{parseError}}</view>
  </view>

  <!-- 基本信息区 -->
  <view class="section card">
    <view class="section-title">📝 基本信息</view>
    
    <!-- 标题 -->
    <view class="form-item">
      <view class="form-label">名称 <text class="required">*</text></view>
      <input 
        class="form-input" 
        placeholder="输入地点名称" 
        value="{{formData.title}}"
        bindinput="onTitleInput"
      />
    </view>

    <!-- 平台选择 -->
    <view class="form-item">
      <view class="form-label">来源平台</view>
      <view class="chip-row">
        <block wx:for="{{platforms}}" wx:key="key">
          <view 
            class="chip {{formData.platform === item.key ? 'chip-active' : ''}}"
            data-platform="{{item.key}}"
            bindtap="onSelectPlatform"
            style="{{formData.platform === item.key ? 'background:' + item.color + ';color:#fff;' : ''}}"
          >
            {{item.label}}
          </view>
        </block>
      </view>
    </view>

    <!-- 分类选择 -->
    <view class="form-item">
      <view class="form-label">分类 <text class="required">*</text></view>
      <view class="chip-row chip-row-wrap">
        <block wx:for="{{categories}}" wx:key="key">
          <view 
            class="chip {{formData.category === item.key ? 'chip-active' : ''}}"
            data-category="{{item.key}}"
            bindtap="onSelectCategory"
          >
            {{item.label}}
          </view>
        </block>
      </view>
    </view>

    <!-- 评分 -->
    <view class="form-item">
      <view class="form-label">评分</view>
      <view class="rating-row">
        <text 
          wx:for="{{[1,2,3,4,5]}}" wx:key="*this"
          class="rating-star {{index < formData.rating ? 'active' : ''}}"
          data-rate="{{index + 1}}"
          bindtap="onRate"
        >★</text>
      </view>
    </view>
  </view>

  <!-- 位置信息 -->
  <view class="section card">
    <view class="section-title">📍 位置信息</view>
    <view class="form-item">
      <view class="location-picker" bindtap="onChooseLocation">
        <view wx:if="{{!formData.locationName}}" class="location-placeholder">
          🗺️ 点击选择地点位置
        </view>
        <view wx:else class="location-selected">
          <view class="location-name">📍 {{formData.locationName}}</view>
          <view class="location-addr">{{formData.locationAddress}}</view>
          <view class="location-change">点击更换</view>
        </view>
      </view>
    </view>
  </view>

  <!-- 标签 -->
  <view class="section card">
    <view class="section-title">🏷️ 自定义标签</view>
    <view class="tag-input-row">
      <input 
        class="form-input tag-input" 
        placeholder="添加标签（如：朋友聚会、约会）" 
        value="{{tagInput}}"
        bindinput="onTagInput"
        bindconfirm="onAddTag"
      />
      <button class="tag-add-btn" bindtap="onAddTag" size="mini">添加</button>
    </view>
    <view wx:if="{{formData.tags.length > 0}}" class="tag-list">
      <view wx:for="{{formData.tags}}" wx:key="*this" class="tag-item">
        {{item}}
        <text class="tag-remove" data-index="{{index}}" bindtap="onRemoveTag">✕</text>
      </view>
    </view>
  </view>

  <!-- 备注 -->
  <view class="section card">
    <view class="section-title">📝 备注</view>
    <textarea 
      class="note-input" 
      placeholder="记录一些想说的话（人均消费、推荐菜、备注等）"
      value="{{formData.note}}"
      bindinput="onNoteInput"
      maxlength="200"
      auto-height
    />
  </view>

  <!-- 底部按钮 -->
  <view class="bottom-actions safe-area-bottom">
    <button class="reset-btn" bindtap="onReset">清空</button>
    <button 
      class="submit-btn {{submitting ? 'loading' : ''}}" 
      bindtap="onSubmit"
      disabled="{{submitting}}"
      loading="{{submitting}}"
    >
      {{submitting ? '保存中...' : '⭐ 加入收藏'}}
    </button>
  </view>
</view>
```

- [ ] **Step 3: 页面样式**

```css
/* miniprogram/pages/add/add.wxss */
.add-page {
  padding-bottom: 120rpx;
}

.page-header {
  padding: 40rpx 32rpx 20rpx;
}
.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-text);
}
.header-desc {
  font-size: 26rpx;
  color: var(--color-text-light);
  margin-top: 8rpx;
}

.section {
  margin: 16rpx 24rpx;
  padding: 24rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20rpx;
}

.url-input-row {
  display: flex;
  gap: 12rpx;
}
.url-input {
  flex: 1;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 16rpx 20rpx;
  font-size: 26rpx;
}
.parse-btn {
  white-space: nowrap;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 24rpx;
}
.parse-error {
  color: var(--color-accent-red);
  font-size: 24rpx;
  margin-top: 12rpx;
}

.form-item {
  margin-bottom: 24rpx;
}
.form-label {
  font-size: 26rpx;
  color: var(--color-text);
  margin-bottom: 12rpx;
}
.required {
  color: var(--color-accent-red);
}
.form-input {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  width: 100%;
  box-sizing: border-box;
}

.chip-row {
  display: flex;
  gap: 12rpx;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.chip-row-wrap {
  flex-wrap: wrap;
}
.chip {
  padding: 8rpx 24rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  background: var(--color-bg);
  color: var(--color-text-light);
  white-space: nowrap;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}
.chip-active {
  background: var(--color-primary) !important;
  color: #fff !important;
  font-weight: 500;
}

.rating-row {
  display: flex;
  gap: 8rpx;
}
.rating-star {
  font-size: 48rpx;
  color: var(--color-neutral);
  transition: color 0.2s;
}
.rating-star.active {
  color: var(--color-primary);
}

.location-picker {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 32rpx;
  text-align: center;
  border: 2rpx dashed var(--color-neutral);
}
.location-placeholder {
  color: var(--color-text-light);
  font-size: 26rpx;
}
.location-selected {
  text-align: left;
}
.location-name {
  font-size: 28rpx;
  font-weight: 600;
}
.location-addr {
  font-size: 24rpx;
  color: var(--color-text-light);
  margin-top: 8rpx;
}
.location-change {
  font-size: 22rpx;
  color: var(--color-primary);
  margin-top: 8rpx;
}

.tag-input-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.tag-input {
  flex: 1;
}
.tag-add-btn {
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 24rpx;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tag-item {
  padding: 8rpx 20rpx;
  background: rgba(255, 154, 86, 0.12);
  color: var(--color-primary);
  border-radius: 32rpx;
  font-size: 24rpx;
}
.tag-remove {
  margin-left: 8rpx;
  font-size: 20rpx;
}

.note-input {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid var(--color-border);
}
.reset-btn {
  flex: 1;
  background: var(--color-bg);
  color: var(--color-text-light);
  border-radius: 40rpx;
  font-size: 28rpx;
}
.submit-btn {
  flex: 2;
  background: var(--color-primary);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
```

- [ ] **Step 4: 页面 JSON**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "添加收藏"
}
```

- [ ] **Step 5: 验证**

1. 打开添加页面，输入一个真实链接点击「解析」（需先部署 parseLink 云函数，见 Task 13）
2. 验证分类选择、平台选择交互正常
3. 点击地图选点，授权位置后选择地点
4. 添加标签、评分、备注
5. 点击提交，验证成功提示和页面跳转

---

### Task 6: 列表浏览页 (list)

**Files:**
- Create: `miniprogram/pages/list/list.js`
- Create: `miniprogram/pages/list/list.json`
- Create: `miniprogram/pages/list/list.wxml`
- Create: `miniprogram/pages/list/list.wxss`

- [ ] **Step 1: 页面 JS — 瀑布流 + 筛选 + 搜索**

```javascript
// miniprogram/pages/list/list.js
const { getCollections, deleteCollectionItem, updateCollectionItem } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    // 数据
    items: [],
    loading: true,
    hasMore: true,
    skip: 0,
    refreshTriggered: false,

    // 筛选
    categories: [{ key: '', label: '全部' }, ...CATEGORIES],
    activeCategory: '',
    keyword: '',
    showSearch: false,
    searchValue: '',

    // 排序
    sortBy: 'time', // time | rating
    showSortMenu: false,

    // 操作菜单
    actionItem: null,
    showActionSheet: false,
  },

  onLoad() {
    this.loadData(true);
  },

  async loadData(refresh = false) {
    if (refresh) {
      this.setData({ skip: 0, hasMore: true, items: [], loading: true });
    } else if (!this.data.hasMore || this.data.loading) {
      return;
    }

    this.setData({ loading: true });

    const { activeCategory, keyword, sortBy, skip } = this.data;
    const result = await getCollections({
      category: activeCategory || undefined,
      keyword: keyword || undefined,
      skip: refresh ? 0 : skip,
      limit: 20,
    });

    if (result.success) {
      const items = refresh ? result.data : [...this.data.items, ...result.data];
      this.setData({
        items,
        skip: items.length,
        hasMore: result.hasMore,
        loading: false,
        refreshTriggered: false,
      });
    } else {
      this.setData({ loading: false, refreshTriggered: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ refreshTriggered: true });
    this.loadData(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadData(false);
  },

  // 分类筛选
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category });
    this.loadData(true);
  },

  // 搜索
  onToggleSearch() {
    this.setData({ showSearch: !this.data.showSearch, searchValue: '' });
    if (!this.data.showSearch) {
      this.setData({ keyword: '' });
      this.loadData(true);
    }
  },
  onSearchInput(e) {
    this.setData({ searchValue: e.detail.value });
  },
  onSearchConfirm() {
    this.setData({ keyword: this.data.searchValue.trim() });
    this.loadData(true);
  },

  // 点击卡片 → 详情页
  onCardTap(e) {
    const item = e.detail.item;
    wx.navigateTo({ url: `/pages/detail/detail?id=${item._id}` });
  },

  // 长按卡片 → 操作菜单
  onCardLongPress(e) {
    const item = e.detail.item;
    this.setData({ actionItem: item, showActionSheet: true });
  },

  // 操作菜单
  onAction(e) {
    const action = e.currentTarget.dataset.action;
    const { actionItem } = this.data;
    this.setData({ showActionSheet: false });

    switch (action) {
      case 'toggleStatus':
        this.toggleStatus(actionItem);
        break;
      case 'delete':
        this.deleteItem(actionItem);
        break;
      case 'share':
        this.shareItem(actionItem);
        break;
    }
  },

  async toggleStatus(item) {
    const newStatus = item.status === 'want_to_go' ? 'visited' : 'want_to_go';
    const result = await updateCollectionItem(item._id, { status: newStatus });
    if (result.success) {
      const items = this.data.items.map(i =>
        i._id === item._id ? { ...i, status: newStatus } : i
      );
      this.setData({ items });
      wx.showToast({ title: newStatus === 'visited' ? '标记为已去过' : '标记为想去', icon: 'success' });
    }
  },

  async deleteItem(item) {
    const confirmRes = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: `确定删除「${item.title}」吗？`,
        success: resolve,
      });
    });
    if (!confirmRes.confirm) return;

    const result = await deleteCollectionItem(item._id);
    if (result.success) {
      const items = this.data.items.filter(i => i._id !== item._id);
      this.setData({ items });
      wx.showToast({ title: '已删除', icon: 'success' });
    }
  },

  shareItem(item) {
    // 将在全局 onShareAppMessage 中处理
    wx.showToast({ title: '请点击右上角分享', icon: 'none' });
  },

  // 关闭菜单
  onCloseAction() {
    this.setData({ showActionSheet: false });
  },
});
```

- [ ] **Step 2: 页面模板**

```xml
<!-- miniprogram/pages/list/list.wxml -->
<view class="page list-page">
  <!-- 搜索栏 -->
  <view class="search-bar">
    <view wx:if="{{showSearch}}" class="search-input-row">
      <input 
        class="search-input" 
        placeholder="搜索收藏..." 
        value="{{searchValue}}"
        bindinput="onSearchInput"
        bindconfirm="onSearchConfirm"
        focus="{{true}}"
        confirm-type="search"
      />
      <view class="search-cancel" bindtap="onToggleSearch">取消</view>
    </view>
    <view wx:else class="search-header">
      <view class="search-title">我的收藏</view>
      <view class="search-icon" bindtap="onToggleSearch">🔍</view>
    </view>
  </view>

  <!-- 分类筛选栏 -->
  <scroll-view class="category-bar" scroll-x enable-flex>
    <view 
      wx:for="{{categories}}" wx:key="key"
      class="filter-chip {{activeCategory === item.key ? 'active' : ''}}"
      data-category="{{item.key}}"
      bindtap="onSelectCategory"
    >
      {{item.label}}
    </view>
  </scroll-view>

  <!-- 列表 -->
  <view wx:if="{{!loading && items.length === 0}}" class="list-body">
    <empty-state 
      icon="📭"
      title="还没有收藏"
      description="{{activeCategory ? '该分类下暂无收藏' : '去添加你的第一个好吃好玩的地方吧'}}"
      bind:action="onGoAdd"
    />
  </view>

  <view wx:else class="list-body">
    <collection-card 
      wx:for="{{items}}" 
      wx:key="_id"
      item="{{item}}"
      bind:tap="onCardTap"
      bind:longpress="onCardLongPress"
    />

    <!-- 加载更多 -->
    <view wx:if="{{loading}}" class="loading-more">
      <skeleton loading="{{true}}" count="{{2}}" />
    </view>
    <view wx:elif="{{!hasMore && items.length > 0}}" class="no-more">
      — 已经到底了 —
    </view>
  </view>

  <!-- 操作菜单（底部弹出） -->
  <view wx:if="{{showActionSheet}}" class="action-overlay" bindtap="onCloseAction">
    <view class="action-sheet" catchtap="">
      <view class="action-item" data-action="toggleStatus" bindtap="onAction">
        {{actionItem.status === 'want_to_go' ? '✅ 标记为去过' : '📋 标记为想去'}}
      </view>
      <view class="action-item" data-action="share" bindtap="onAction">
        📤 分享给好友
      </view>
      <view class="action-item action-danger" data-action="delete" bindtap="onAction">
        🗑️ 删除收藏
      </view>
      <view class="action-cancel" bindtap="onCloseAction">取消</view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 页面样式**

```css
/* miniprogram/pages/list/list.wxss */
.list-page {
  padding-bottom: 20rpx;
}

.search-bar {
  padding: 20rpx 24rpx;
  background: var(--color-white);
}
.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text);
}
.search-icon {
  font-size: 40rpx;
  padding: 8rpx;
}
.search-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.search-input {
  flex: 1;
  background: var(--color-bg);
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
}
.search-cancel {
  font-size: 28rpx;
  color: var(--color-primary);
  white-space: nowrap;
}

.category-bar {
  white-space: nowrap;
  padding: 12rpx 24rpx;
  background: var(--color-white);
  border-bottom: 1rpx solid var(--color-border);
}
.filter-chip {
  display: inline-block;
  padding: 8rpx 24rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  background: var(--color-bg);
  color: var(--color-text-light);
  margin-right: 16rpx;
  transition: all 0.2s;
}
.filter-chip.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 500;
}

.loading-more {
  padding: 16rpx;
}
.no-more {
  text-align: center;
  padding: 40rpx;
  font-size: 24rpx;
  color: #B8A99A;
}

/* 操作菜单 */
.action-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}
.action-sheet {
  width: 100%;
  background: var(--color-white);
  border-radius: 24rpx 24rpx 0 0;
  padding: 16rpx;
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.action-item {
  padding: 28rpx;
  text-align: center;
  font-size: 30rpx;
  color: var(--color-text);
  border-bottom: 1rpx solid var(--color-border);
}
.action-danger {
  color: var(--color-accent-red);
}
.action-cancel {
  padding: 28rpx;
  text-align: center;
  font-size: 30rpx;
  color: var(--color-text-light);
  margin-top: 8rpx;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}
```

- [ ] **Step 4: 页面 JSON**

```json
{
  "usingComponents": {
    "collection-card": "/components/collection-card/index",
    "skeleton": "/components/skeleton/index",
    "empty-state": "/components/empty-state/index"
  },
  "navigationBarTitleText": "收藏列表",
  "enablePullDownRefresh": true
}
```

- [ ] **Step 5: 验证**

1. 列表页正常展示收藏卡片
2. 分类筛选切换正确
3. 搜索功能过滤准确
4. 下拉刷新加载最新数据
5. 长按弹出操作菜单，切换状态/删除正常
6. 空状态显示正确

---

### Task 7: 地图页 (map)

**Files:**
- Create: `miniprogram/pages/map/map.js`
- Create: `miniprogram/pages/map/map.json`
- Create: `miniprogram/pages/map/map.wxml`
- Create: `miniprogram/pages/map/map.wxss`

- [ ] **Step 1: 页面 JS**

```javascript
// miniprogram/pages/map/map.js
const { getAllCollections } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    latitude: 39.9042,   // 默认北京
    longitude: 116.4074,
    scale: 13,
    markers: [],
    allItems: [],
    selectedCategory: '',
    showCategoryFilter: false,
    categories: CATEGORIES,

    // 底部卡片
    selectedItem: null,
    showDetailCard: false,
  },

  onLoad() {
    this.loadMarkers();
  },

  onShow() {
    // 每次进入地图页刷新数据
    this.loadMarkers();
  },

  async loadMarkers() {
    const result = await getAllCollections();
    if (result.success && result.data.length > 0) {
      const items = result.data.filter(item => item.location && item.location.latitude);
      
      // 如果用户有收藏，定位到第一个收藏处
      if (items.length > 0 && !this._hasLocated) {
        this._hasLocated = true;
        this.setData({
          latitude: items[0].location.latitude,
          longitude: items[0].location.longitude,
        });
      }

      this.setData({ allItems: items });
      this.updateMarkers();
    }
  },

  updateMarkers() {
    const { allItems, selectedCategory } = this.data;
    const categoryInfo = CATEGORIES.find(c => c.key === selectedCategory);

    let filteredItems = allItems;
    if (selectedCategory) {
      filteredItems = allItems.filter(item => item.category === selectedCategory);
    }

    const markers = filteredItems.map((item, index) => ({
      id: index,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      title: item.title,
      iconPath: '/images/marker-food.png',  // 可替换为分类对应图标
      width: 36,
      height: 36,
      callout: {
        content: item.title,
        color: '#4A3728',
        fontSize: 13,
        borderRadius: 8,
        bgColor: '#FFFFFF',
        padding: 8,
        display: 'BYCLICK',
      },
    }));

    this.setData({ markers });
  },

  // 分类筛选
  onToggleFilter() {
    this.setData({ showCategoryFilter: !this.data.showCategoryFilter });
  },
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category === this.data.selectedCategory ? '' : category,
      showCategoryFilter: false,
    });
    this.updateMarkers();
  },

  // 标记点点击
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const item = this.data.allItems[markerId];
    if (item) {
      this.setData({ selectedItem: item, showDetailCard: true });
    }
  },

  // 查看详情
  onViewDetail() {
    if (this.data.selectedItem) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${this.data.selectedItem._id}` });
    }
  },

  // 关闭底部卡片
  onCloseCard() {
    this.setData({ showDetailCard: false, selectedItem: null });
  },

  // 定位到当前位置
  onMoveToCurrent() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          scale: 14,
        });
      },
      fail: () => {
        wx.showToast({ title: '请授权位置权限', icon: 'none' });
      }
    });
  },
});
```

- [ ] **Step 2: 页面模板**

```xml
<!-- miniprogram/pages/map/map.wxml -->
<view class="page map-page">
  <!-- 地图 -->
  <map 
    id="myMap"
    class="map-container"
    latitude="{{latitude}}"
    longitude="{{longitude}}"
    scale="{{scale}}"
    markers="{{markers}}"
    bindmarkertap="onMarkerTap"
    show-location="{{true}}"
  />

  <!-- 分类筛选 -->
  <view class="map-filter-bar">
    <scroll-view class="map-filter-scroll" scroll-x enable-flex>
      <view 
        wx:for="{{categories}}" wx:key="key"
        wx:if="{{index < 8}}"
        class="map-chip {{selectedCategory === item.key ? 'active' : ''}}"
        data-category="{{item.key}}"
        bindtap="onSelectCategory"
      >
        {{item.icon}} {{item.label}}
      </view>
    </scroll-view>
  </view>

  <!-- 定位按钮 -->
  <view class="locate-btn" bindtap="onMoveToCurrent">
    <text class="locate-icon">📍</text>
  </view>

  <!-- 底部详情卡片 -->
  <view wx:if="{{showDetailCard}}" class="map-detail-card safe-area-bottom">
    <view class="map-detail-header">
      <image 
        src="{{selectedItem.coverImage || '/images/default-cover.png'}}" 
        class="map-detail-cover"
        mode="aspectFill"
      />
      <view class="map-detail-close" bindtap="onCloseCard">✕</view>
    </view>
    <view class="map-detail-body">
      <view class="map-detail-title">{{selectedItem.title}}</view>
      <view class="map-detail-cat">{{selectedItem.category}}</view>
    </view>
    <view class="map-detail-action" bindtap="onViewDetail">
      查看详情 →
    </view>
  </view>
</view>
```

- [ ] **Step 3: 页面样式 + JSON**

```css
/* miniprogram/pages/map/map.wxss */
.map-page {
  position: relative;
  height: 100vh;
}
.map-container {
  width: 100%;
  height: 100%;
}

.map-filter-bar {
  position: absolute;
  top: 20rpx;
  left: 24rpx;
  right: 24rpx;
  z-index: 10;
}
.map-filter-scroll {
  white-space: nowrap;
  background: rgba(255,255,255,0.95);
  border-radius: 32rpx;
  padding: 8rpx 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}
.map-chip {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  color: var(--color-text-light);
  margin-right: 8rpx;
  transition: all 0.2s;
}
.map-chip.active {
  background: var(--color-primary);
  color: #fff;
}

.locate-btn {
  position: absolute;
  right: 24rpx;
  bottom: 280rpx;
  width: 72rpx;
  height: 72rpx;
  background: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-float);
  z-index: 10;
}
.locate-icon {
  font-size: 36rpx;
}

.map-detail-card {
  position: absolute;
  bottom: 0;
  left: 16rpx;
  right: 16rpx;
  background: var(--color-white);
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -4rpx 24rpx rgba(0,0,0,0.1);
  z-index: 20;
}
.map-detail-header {
  position: relative;
}
.map-detail-cover {
  width: 100%;
  height: 200rpx;
  border-radius: 24rpx 24rpx 0 0;
}
.map-detail-close {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}
.map-detail-body {
  padding: 24rpx;
}
.map-detail-title {
  font-size: 32rpx;
  font-weight: 600;
}
.map-detail-cat {
  font-size: 24rpx;
  color: var(--color-text-light);
  margin-top: 8rpx;
}
.map-detail-action {
  padding: 20rpx 24rpx;
  border-top: 1rpx solid var(--color-border);
  text-align: center;
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 500;
}
```

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "收藏地图",
  "disableScroll": true
}
```

- [ ] **Step 4: 验证**

1. 地图页正常显示，标记点正确
2. 点击标记点弹出callout
3. 点击callout底部显示详情卡片
4. 分类筛选标记点变化
5. 定位按钮可跳转当前位置

---

### Task 8: 收藏详情页 (detail)

**Files:**
- Create: `miniprogram/pages/detail/detail.js`
- Create: `miniprogram/pages/detail/detail.json`
- Create: `miniprogram/pages/detail/detail.wxml`
- Create: `miniprogram/pages/detail/detail.wxss`

- [ ] **Step 1: 页面 JS**

```javascript
// miniprogram/pages/detail/detail.js
const { getCollectionDetail, updateCollectionItem, deleteCollectionItem } = require('../../utils/cloud.js');
const { CATEGORIES, PLATFORMS, STATUS } = require('../../utils/constants.js');

Page({
  data: {
    item: null,
    loading: true,
    categoryInfo: null,
    platformInfo: null,
    statusLabel: '',
  },

  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id);
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async loadDetail(id) {
    const result = await getCollectionDetail(id);
    if (result.success && result.data) {
      const item = result.data;
      const categoryInfo = CATEGORIES.find(c => c.key === item.category);
      const platformInfo = PLATFORMS.find(p => p.key === item.platform);
      const statusLabel = STATUS.find(s => s.key === item.status)?.label || '';

      this.setData({ item, categoryInfo, platformInfo, statusLabel, loading: false });
    } else {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 切换状态
  async onToggleStatus() {
    const newStatus = this.data.item.status === 'want_to_go' ? 'visited' : 'want_to_go';
    const result = await updateCollectionItem(this.data.item._id, { status: newStatus });
    if (result.success) {
      const statusLabel = STATUS.find(s => s.key === newStatus).label;
      this.setData({ 'item.status': newStatus, statusLabel });
      wx.showToast({ title: `已标记为「${statusLabel}」`, icon: 'success' });
    }
  },

  // 导航
  onNavigate() {
    const { location } = this.data.item;
    if (!location || !location.latitude) {
      wx.showToast({ title: '未设置位置信息', icon: 'none' });
      return;
    }
    wx.openLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name || this.data.item.title,
      address: location.address || '',
      scale: 16,
    });
  },

  // 复制链接
  onCopyLink() {
    if (this.data.item.originalUrl) {
      wx.setClipboardData({
        data: this.data.item.originalUrl,
        success: () => wx.showToast({ title: '链接已复制', icon: 'success' }),
      });
    }
  },

  // 查看原文
  onOpenOriginal() {
    if (this.data.item.originalUrl) {
      // 小程序内无法直接打开外部链接，复制到剪贴板
      wx.setClipboardData({
        data: this.data.item.originalUrl,
        success: () => {
          wx.showModal({
            title: '链接已复制',
            content: '请在浏览器中打开查看原文',
            showCancel: false,
          });
        }
      });
    }
  },

  // 删除
  async onDelete() {
    const res = await new Promise(r => {
      wx.showModal({
        title: '确认删除',
        content: `确定删除「${this.data.item.title}」吗？此操作不可恢复。`,
        success: r,
      });
    });
    if (!res.confirm) return;

    const result = await deleteCollectionItem(this.data.item._id);
    if (result.success) {
      wx.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `周末去哪儿 — ${this.data.item.title}`,
      path: `/pages/detail/detail?id=${this.data.item._id}`,
      imageUrl: this.data.item.coverImage || '',
    };
  },
});
```

- [ ] **Step 2: 页面模板**

```xml
<!-- miniprogram/pages/detail/detail.wxml -->
<view wx:if="{{!loading && item}}" class="page detail-page">
  <!-- 封面图 -->
  <view class="detail-cover">
    <image 
      src="{{item.coverImage || '/images/default-cover.png'}}" 
      mode="aspectFill"
      class="cover-image"
    />
    <view class="cover-overlay">
      <view class="cover-platform" style="background: {{platformInfo.color || '#999'}};">
        {{platformInfo.label || '其他'}}
      </view>
      <view class="cover-status">{{statusLabel}}</view>
    </view>
  </view>

  <!-- 基本信息 -->
  <view class="detail-section card">
    <view class="detail-title">{{item.title}}</view>
    <view class="detail-meta">
      <view class="category-badge tag tag-primary">{{categoryInfo.label || '未分类'}}</view>
      <view wx:if="{{item.rating}}" class="detail-rating">
        <text wx:for="{{[1,2,3,4,5]}}" wx:key="*this" 
              style="color: {{index < item.rating ? '#FF9A56' : '#E8D5B7'}}; font-size: 32rpx;">★</text>
      </view>
    </view>
    <view wx:if="{{item.tags && item.tags.length > 0}}" class="detail-tags">
      <view wx:for="{{item.tags}}" wx:key="*this" class="tag tag-accent">{{item}}</view>
    </view>
  </view>

  <!-- 位置信息 -->
  <view wx:if="{{item.location && item.location.name}}" class="detail-section card">
    <view class="section-title">📍 位置</view>
    <view class="location-name">{{item.location.name}}</view>
    <view wx:if="{{item.location.address}}" class="location-addr">{{item.location.address}}</view>
    <view class="location-map" bindtap="onNavigate">
      <view class="map-placeholder">🗺️ 点击导航到此处</view>
    </view>
  </view>

  <!-- 备注 -->
  <view wx:if="{{item.note}}" class="detail-section card">
    <view class="section-title">📝 备注</view>
    <view class="note-content">{{item.note}}</view>
  </view>

  <!-- 原始链接 -->
  <view wx:if="{{item.originalUrl}}" class="detail-section card">
    <view class="section-title">🔗 来源</view>
    <view class="link-row" bindtap="onOpenOriginal">
      <view class="link-url ellipsis">{{item.originalUrl}}</view>
      <view class="link-arrow">→</view>
    </view>
  </view>

  <!-- 底部操作栏 -->
  <view class="detail-actions safe-area-bottom">
    <button class="action-btn" bindtap="onToggleStatus">
      {{item.status === 'want_to_go' ? '✅ 标记去过' : '📋 标记想去'}}
    </button>
    <button class="action-btn primary" bindtap="onNavigate">🧭 导航</button>
    <button class="action-btn" open-type="share">📤 分享</button>
  </view>
</view>

<!-- 加载中 -->
<view wx:elif="{{loading}}">
  <skeleton loading="{{true}}" count="{{1}}" />
</view>
```

- [ ] **Step 3: 页面样式 + JSON**

```css
/* miniprogram/pages/detail/detail.wxss */
.detail-page {
  padding-bottom: 140rpx;
}

.detail-cover {
  position: relative;
  width: 100%;
  height: 480rpx;
}
.cover-image {
  width: 100%;
  height: 100%;
}
.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 40rpx 24rpx 24rpx;
  background: linear-gradient(transparent, rgba(0,0,0,0.4));
}
.cover-platform {
  padding: 6rpx 20rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #fff;
}
.cover-status {
  font-size: 24rpx;
  color: #fff;
}

.detail-section {
  margin: 16rpx 24rpx;
  padding: 24rpx;
}
.detail-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16rpx;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.detail-rating {
  display: flex;
  gap: 4rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16rpx;
}
.location-name {
  font-size: 30rpx;
  font-weight: 500;
  margin-bottom: 8rpx;
}
.location-addr {
  font-size: 24rpx;
  color: var(--color-text-light);
  margin-bottom: 16rpx;
}
.location-map {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 40rpx;
  text-align: center;
}
.map-placeholder {
  font-size: 28rpx;
  color: var(--color-primary);
}

.note-content {
  font-size: 28rpx;
  color: var(--color-text);
  line-height: 1.8;
}

.link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.link-url {
  font-size: 24rpx;
  color: var(--color-accent);
}
.link-arrow {
  font-size: 28rpx;
  color: var(--color-text-light);
}

.detail-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid var(--color-border);
}
.action-btn {
  flex: 1;
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 40rpx;
  font-size: 26rpx;
  padding: 0;
  line-height: 76rpx;
  border: none;
}
.action-btn.primary {
  background: var(--color-primary);
  color: #fff;
}
```

```json
{
  "usingComponents": {
    "skeleton": "/components/skeleton/index"
  },
  "navigationBarTitleText": "收藏详情"
}
```

- [ ] **Step 4: 验证**

1. 从列表页点击卡片进入详情页
2. 封面、标题、分类、标签、评分显示正确
3. 点击导航可打开微信地图
4. 切换状态（想去/去过）正常
5. 复制链接/查看原文功能正常
6. 分享按钮可用

---

### Task 9: 首页 (index)

**Files:**
- Create: `miniprogram/pages/index/index.js`
- Create: `miniprogram/pages/index/index.json`
- Create: `miniprogram/pages/index/index.wxml`
- Create: `miniprogram/pages/index/index.wxss`

- [ ] **Step 1: 页面 JS**

```javascript
// miniprogram/pages/index/index.js
const { getCollections, getCollectionStats } = require('../../utils/cloud.js');

Page({
  data: {
    recentItems: [],
    stats: null,
    loading: true,
    greeting: '',
    currentDate: '',
  },

  onLoad() {
    this.setGreeting();
    this.loadData();
  },

  onShow() {
    // 每次回到首页刷新
    this.loadData();
  },

  setGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 6) greeting = '夜深了 🌙';
    else if (hour < 9) greeting = '早上好 ☀️';
    else if (hour < 12) greeting = '上午好 🌤️';
    else if (hour < 14) greeting = '中午好 ☀️';
    else if (hour < 18) greeting = '下午好 🌈';
    else greeting = '晚上好 🌆';

    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`;

    this.setData({ greeting, currentDate: dateStr });
  },

  async loadData() {
    this.setData({ loading: true });

    // 并行加载
    const [recentResult, statsResult] = await Promise.all([
      getCollections({ limit: 6 }),
      getCollectionStats(),
    ]);

    this.setData({
      recentItems: recentResult.success ? recentResult.data : [],
      stats: statsResult.success ? statsResult.data : null,
      loading: false,
    });
  },

  // 跳转到添加页
  onGoAdd() {
    wx.switchTab({ url: '/pages/add/add' });
  },

  // 跳转到列表
  onGoList(e) {
    const category = e.currentTarget.dataset.category || '';
    wx.switchTab({ url: '/pages/list/list' });
    // 通过全局事件通道传分类
    if (category) {
      getApp().globalData.listFilter = category;
    }
  },

  // 跳转地图
  onGoMap() {
    wx.switchTab({ url: '/pages/map/map' });
  },

  // 查看详情
  onViewDetail(e) {
    const item = e.detail.item;
    wx.navigateTo({ url: `/pages/detail/detail?id=${item._id}` });
  },
});
```

- [ ] **Step 2: 页面模板**

```xml
<!-- miniprogram/pages/index/index.wxml -->
<view class="page index-page">
  <!-- 顶部问候 -->
  <view class="hero-section">
    <view class="greeting">{{greeting}}</view>
    <view class="current-date">{{currentDate}}</view>
    <view class="hero-subtitle">去哪吃？去哪玩？看看收藏就有灵感 ✨</view>
  </view>

  <!-- 快捷操作 -->
  <view class="quick-actions card">
    <view class="quick-action" bindtap="onGoAdd">
      <view class="quick-icon">⭐</view>
      <view class="quick-label">添加收藏</view>
    </view>
    <view class="quick-action" bindtap="onGoMap">
      <view class="quick-icon">🗺️</view>
      <view class="quick-label">地图浏览</view>
    </view>
    <view class="quick-action" bindtap="onGoList">
      <view class="quick-icon">🔍</view>
      <view class="quick-label">搜索查找</view>
    </view>
  </view>

  <!-- 数据统计 -->
  <view wx:if="{{stats}}" class="stats-section card">
    <view class="stats-title">📊 我的收藏统计</view>
    <view class="stats-grid">
      <view class="stat-item">
        <view class="stat-num">{{stats.total}}</view>
        <view class="stat-label">总收藏</view>
      </view>
      <view class="stat-item">
        <view class="stat-num">{{stats.wantToGo}}</view>
        <view class="stat-label">想去</view>
      </view>
      <view class="stat-item">
        <view class="stat-num">{{stats.visited}}</view>
        <view class="stat-label">去过</view>
      </view>
    </view>
    <!-- 分类分布（简易） -->
    <view wx:if="{{stats.byCategory}}" class="stats-categories">
      <view wx:for="{{stats.byCategory}}" wx:key="*this" wx:if="{{index < 6}}" 
            class="stat-cat-item">
        <view class="stat-cat-label">{{item[0]}}</view>
        <view class="stat-cat-bar">
          <view class="stat-cat-fill" style="width: {{item[1] / stats.total * 100}}%;"></view>
        </view>
        <view class="stat-cat-count">{{item[1]}}</view>
      </view>
    </view>
  </view>

  <!-- 最近收藏 -->
  <view class="recent-section">
    <view class="recent-header">
      <view class="recent-title">🕐 最近收藏</view>
      <view class="recent-more" bindtap="onGoList">查看全部 →</view>
    </view>

    <view wx:if="{{loading}}">
      <skeleton loading="{{true}}" count="{{2}}" />
    </view>
    <view wx:elif="{{recentItems.length === 0}}">
      <empty-state bind:action="onGoAdd" />
    </view>
    <view wx:else>
      <collection-card 
        wx:for="{{recentItems}}" wx:key="_id"
        item="{{item}}"
        bind:tap="onViewDetail"
      />
    </view>
  </view>
</view>
```

- [ ] **Step 3: 页面样式 + JSON**

```css
/* miniprogram/pages/index/index.wxss */
.index-page {
  padding-bottom: 40rpx;
}

.hero-section {
  padding: 48rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE0CC 100%);
}
.greeting {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-text);
}
.current-date {
  font-size: 26rpx;
  color: var(--color-text-light);
  margin-top: 8rpx;
}
.hero-subtitle {
  font-size: 28rpx;
  color: var(--color-primary);
  margin-top: 16rpx;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  margin: -20rpx 32rpx 16rpx;
  padding: 0;
  position: relative;
  z-index: 2;
}
.quick-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28rpx 0;
}
.quick-icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}
.quick-label {
  font-size: 24rpx;
  color: var(--color-text);
  font-weight: 500;
}

.stats-section {
  margin: 16rpx 32rpx;
  padding: 24rpx;
}
.stats-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}
.stats-grid {
  display: flex;
  margin-bottom: 24rpx;
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-num {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.stat-label {
  font-size: 24rpx;
  color: var(--color-text-light);
}

.stats-categories {
  border-top: 1rpx solid var(--color-border);
  padding-top: 16rpx;
}
.stat-cat-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.stat-cat-label {
  width: 100rpx;
  font-size: 22rpx;
  color: var(--color-text-light);
}
.stat-cat-bar {
  flex: 1;
  height: 12rpx;
  background: var(--color-bg);
  border-radius: 6rpx;
  overflow: hidden;
}
.stat-cat-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}
.stat-cat-count {
  width: 40rpx;
  text-align: right;
  font-size: 22rpx;
  color: var(--color-text);
}

.recent-section {
  margin: 0 32rpx;
}
.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.recent-title {
  font-size: 30rpx;
  font-weight: 600;
}
.recent-more {
  font-size: 26rpx;
  color: var(--color-primary);
}
```

```json
{
  "usingComponents": {
    "collection-card": "/components/collection-card/index",
    "skeleton": "/components/skeleton/index",
    "empty-state": "/components/empty-state/index"
  },
  "navigationStyle": "custom"
}
```

- [ ] **Step 4: 验证**

1. 首页显示个性化问候语和日期
2. 快捷操作按钮可正常跳转
3. 统计数据与实际收藏数量一致
4. 最近收藏展示最新收藏（最多6条）
5. 空状态提示正确

---

### Task 10: 我的页 (mine)

**Files:**
- Create: `miniprogram/pages/mine/mine.js`
- Create: `miniprogram/pages/mine/mine.json`
- Create: `miniprogram/pages/mine/mine.wxml`
- Create: `miniprogram/pages/mine/mine.wxss`

- [ ] **Step 1: 页面 JS**

```javascript
// miniprogram/pages/mine/mine.js
const { getCollectionStats } = require('../../utils/cloud.js');
const { CATEGORIES } = require('../../utils/constants.js');

Page({
  data: {
    stats: null,
    loading: true,
  },

  onShow() {
    this.loadStats();
  },

  async loadStats() {
    this.setData({ loading: true });
    const result = await getCollectionStats();
    if (result.success) {
      this.setData({ stats: result.data, loading: false });
    } else {
      this.setData({ loading: false });
    }
  },

  // 导出收藏
  onExport() {
    wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' });
  },

  // 关于
  onAbout() {
    wx.showModal({
      title: '周末去哪儿',
      content: 'v1.0.0\n聚合你的美食与游玩灵感\n告别周末选择困难',
      showCancel: false,
    });
  },

  // 分类管理
  onManageCategories() {
    wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' });
  },

  // 意见反馈
  onFeedback() {
    wx.showToast({ title: '功能开发中，敬请期待', icon: 'none' });
  },
});
```

- [ ] **Step 2: 页面模板 + 样式**

```xml
<!-- miniprogram/pages/mine/mine.wxml -->
<view class="page mine-page">
  <!-- 头部 -->
  <view class="mine-header">
    <view class="avatar">🍜</view>
    <view class="nickname">美食探险家</view>
    <view class="bio">收藏 {{stats ? stats.total : '...'}} 个好吃好玩的地方</view>
  </view>

  <!-- 统计数据 -->
  <view wx:if="{{stats}}" class="stats-section card">
    <view class="stats-row">
      <view class="stat-item">
        <view class="stat-num">{{stats.total}}</view>
        <view class="stat-label">总收藏</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <view class="stat-num">{{stats.wantToGo}}</view>
        <view class="stat-label">想去</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <view class="stat-num">{{stats.visited}}</view>
        <view class="stat-label">去过</view>
      </view>
    </view>
  </view>

  <!-- 功能列表 -->
  <view class="menu-section card">
    <view class="menu-item" bindtap="onManageCategories">
      <view class="menu-icon">🏷️</view>
      <view class="menu-text">分类管理</view>
      <view class="menu-arrow">›</view>
    </view>
    <view class="menu-item" bindtap="onExport">
      <view class="menu-icon">📦</view>
      <view class="menu-text">导出收藏</view>
      <view class="menu-arrow">›</view>
    </view>
    <view class="menu-item" bindtap="onFeedback">
      <view class="menu-icon">💬</view>
      <view class="menu-text">意见反馈</view>
      <view class="menu-arrow">›</view>
    </view>
    <view class="menu-item" bindtap="onAbout">
      <view class="menu-icon">ℹ️</view>
      <view class="menu-text">关于</view>
      <view class="menu-arrow">›</view>
    </view>
  </view>
</view>
```

```css
/* miniprogram/pages/mine/mine.wxss */
.mine-page {
  min-height: 100vh;
}

.mine-header {
  padding: 60rpx 32rpx 40rpx;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE0CC 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  background: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  box-shadow: var(--shadow-float);
  margin-bottom: 20rpx;
}
.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text);
}
.bio {
  font-size: 26rpx;
  color: var(--color-text-light);
  margin-top: 8rpx;
}

.stats-section {
  margin: -20rpx 32rpx 16rpx;
  padding: 32rpx;
  position: relative;
  z-index: 2;
}
.stats-row {
  display: flex;
  align-items: center;
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: var(--color-border);
}
.stat-num {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.stat-label {
  font-size: 24rpx;
  color: var(--color-text-light);
  margin-top: 4rpx;
}

.menu-section {
  margin: 16rpx 32rpx;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid var(--color-border);
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-icon {
  font-size: 36rpx;
  width: 56rpx;
}
.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-text);
}
.menu-arrow {
  font-size: 36rpx;
  color: #B8A99A;
  font-weight: 300;
}
```

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "我的"
}
```

- [ ] **Step 3: 验证**

1. 我的页面显示收藏统计数据
2. 数据与实际收藏一致
3. 菜单项点击有响应

---

### Task 11: 链接解析云函数 (parseLink)

**Files:**
- Create: `cloudfunctions/parseLink/index.js`
- Create: `cloudfunctions/parseLink/package.json`

- [ ] **Step 1: 云函数代码**

```javascript
// cloudfunctions/parseLink/index.js
const cloud = require('wx-server-sdk');
const https = require('https');
const http = require('http');
const { URL } = require('url');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

/**
 * 根据URL判断来源平台
 */
function detectPlatform(url) {
  const host = url.toLowerCase();
  if (host.includes('xiaohongshu.com') || host.includes('xhslink.com')) return 'xiaohongshu';
  if (host.includes('douyin.com') || host.includes('tiktok.com')) return 'douyin';
  if (host.includes('bilibili.com') || host.includes('b23.tv')) return 'bilibili';
  if (host.includes('dianping.com') || host.includes('meituan.com')) return 'dianping';
  if (host.includes('weixin.qq.com') || host.includes('mp.weixin.qq.com')) return 'wechat';
  return 'other';
}

/**
 * HTTP请求封装
 */
function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const mod = url.protocol === 'https:' ? https : http;
    
    const req = mod.get(urlString, { timeout: 8000 }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, url: res.url || urlString }));
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * 从HTML提取OG标签 (Open Graph)
 */
function extractOGTags(html) {
  const tags = {};
  
  // og:title
  const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)
    || html.match(/<meta[^>]+name="og:title"[^>]+content="([^"]*)"/i);
  tags.title = titleMatch ? titleMatch[1] : '';

  // og:description
  const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i);
  tags.description = descMatch ? descMatch[1] : '';

  // og:image
  const imgMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
  tags.image = imgMatch ? imgMatch[1] : '';

  // 若OG标签未提取到title，使用<title>
  if (!tags.title) {
    const tMatch = html.match(/<title>([^<]*)<\/title>/i);
    tags.title = tMatch ? tMatch[1].trim() : '';
  }

  return tags;
}

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { url } = event;
  
  if (!url) {
    return { success: false, error: '缺少url参数' };
  }

  try {
    const platform = detectPlatform(url);
    const { html } = await fetchUrl(url);
    const ogTags = extractOGTags(html);

    return {
      success: true,
      data: {
        title: ogTags.title || '',
        description: ogTags.description || '',
        coverImage: ogTags.image || '',
        platform: platform,
      }
    };
  } catch (err) {
    console.error('链接解析失败:', err.message);
    return {
      success: false,
      error: err.message,
      data: {
        title: '',
        description: '',
        coverImage: '',
        platform: detectPlatform(url),
      }
    };
  }
};
```

- [ ] **Step 2: package.json**

```json
{
  "name": "parseLink",
  "version": "1.0.0",
  "description": "解析外部链接，提取标题/封面/平台",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: 部署 & 验证**

1. 右键 `cloudfunctions/parseLink` → 上传并部署：云端安装依赖
2. 在云开发控制台 → 云函数 → parseLink → 测试
3. 输入测试参数：`{ "url": "https://www.xiaohongshu.com/explore/xxxxx" }`
4. 验证返回的 title、description、coverImage、platform 字段正确
5. 在添加页面输入真实链接测试完整流程

---

### Task 12: 全局分享 & 最后整合

**Files:**
- Modify: `miniprogram/app.js` — 添加全局分享配置
- Modify: `miniprogram/app.wxss` — 补充通用工具样式
- Create: `miniprogram/utils/util.js` — 通用工具函数

- [ ] **Step 1: 创建通用工具函数**

```javascript
// miniprogram/utils/util.js

/**
 * 格式化时间
 */
function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 防抖
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流
 */
function throttle(fn, delay = 300) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 获取星期几
 */
function getDayOfWeek(date) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return '星期' + days[date.getDay()];
}

module.exports = {
  formatTime,
  debounce,
  throttle,
  getDayOfWeek,
};
```

- [ ] **Step 2: 补充全局样式**

在 `miniprogram/app.wxss` 末尾追加：

```css
/* 补充通用样式 */
.page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* 加载动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 图片默认占位 */
image {
  background: #F0E6D8;
}

/* 安全区域适配 */
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
```

- [ ] **Step 3: 验证完整流程**

端到端验证 P1 全部功能：

1. **首页** → 问候语 + 统计 + 最近收藏正常
2. **添加** → 粘贴链接解析 → 选择分类 → 填写信息 → 提交成功
3. **列表** → 查看所有收藏 → 分类筛选 → 搜索 → 长按操作
4. **详情** → 查看完整信息 → 导航 → 切换状态
5. **地图** → 标记点展示 → 筛选 → 点击查看
6. **分享** → 详情页分享卡片可正常打开
7. **我的** → 数据统计正确

### Task 13: Tab图标资源准备

- [ ] **Step 1: 准备 Tab 图标**

创建 `miniprogram/images/` 目录，放入以下图标（40x40px PNG，可先用纯色占位图）：

| 文件 | 用途 |
|------|------|
| `tab-home.png` | 首页-默认 |
| `tab-home-active.png` | 首页-选中 |
| `tab-map.png` | 地图-默认 |
| `tab-map-active.png` | 地图-选中 |
| `tab-add.png` | 添加-默认（突出设计） |
| `tab-add-active.png` | 添加-选中 |
| `tab-list.png` | 列表-默认 |
| `tab-list-active.png` | 列表-选中 |
| `tab-mine.png` | 我的-默认 |
| `tab-mine-active.png` | 我的-选中 |
| `default-cover.png` | 默认封面图（750x500） |
| `marker-food.png` | 地图标记图标（36x36） |

图标可从 iconfont 或 Figma 导出，建议使用清新美食风配色。

---

## 验证总结

完成所有 Task 后，执行以下端到端验证：

| # | 验证项 | 标准 |
|---|--------|------|
| 1 | 添加收藏 | ≤3步完成（粘贴→确认→保存） |
| 2 | 链接解析 | 主流平台链接可提取标题和封面 |
| 3 | 列表浏览 | 瀑布流展示 + 筛选 + 搜索正常 |
| 4 | 地图标记 | 所有收藏点正确展示 |
| 5 | 详情页 | 信息完整，导航可用 |
| 6 | 分享 | 好友可正常打开分享卡片 |
| 7 | 多机型 | iOS/Android 主流机型渲染正常 |

---

## 备忘

- **CloudBase 环境ID** 需在 `app.js` 和 `project.config.json` 中替换
- **AppID** 需在微信公众平台注册小程序后获取
- **云函数** 每次修改后需重新上传部署
- **数据库权限** 务必设置为「仅创建者可读写」
- **地图API** 需在微信公众平台申请开通
- **图片资源** 可先用纯色占位图，后期替换设计素材
