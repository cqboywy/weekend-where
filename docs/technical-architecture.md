# 周末去哪儿 — 技术架构

## 技术栈

- **前端框架**: 微信小程序原生（WXML + WXSS + JS）
- **后端服务**: 微信云开发 CloudBase
  - 云数据库（NoSQL）
  - 云存储（图片上传）
  - 云函数（Node.js）
- **天气数据**: Open-Meteo 免费 API（`api.open-meteo.com`），客户端直连无需密钥
- **字体**: Noto Serif SC（标题）+ Noto Sans SC（正文），通过 `wx.loadFontFace` 加载
- **图标**: 自定义 Lucide SVG 图标组件（21 个图标，1.5px 细描边）

## 项目结构

```
weekend-where/
├── miniprogram/                # 小程序前端
│   ├── app.js / .json / .wxss  # 全局配置
│   ├── pages/                  # 页面
│   │   ├── splash/             # 启动页（七日刊）
│   │   ├── index/              # 首页 · 每日精选 + 藏本
│   │   ├── map/                # 地图浏览
│   │   ├── add/                # 添加收藏
│   │   ├── list/               # 收藏列表
│   │   ├── detail/             # 收藏详情
│   │   ├── mine/               # 我的
│   │   ├── category-manage/    # 分类管理
│   │   └── tag-manage/         # 标签管理
│   ├── components/
│   │   ├── collection-card/    # 收藏卡片组件
│   │   ├── lucide-icon/        # SVG 图标组件
│   │   └── empty-state/        # 空状态组件
│   ├── utils/
│   │   ├── cloud.js            # 云开发操作封装
│   │   ├── constants.js        # 常量 + 分类信息 + 封面生成
│   │   └── weather-greeting.js # 天气感知问候语映射表
│   └── images/                 # 图标资源（Tab 图标、App 图标）
├── cloudfunctions/             # 云函数
│   └── login/                  # 获取微信 OpenID
├── scripts/                    # 工具脚本
│   ├── gen-tab-icons.js        # Tab 图标生成
│   ├── gen-app-icon.js         # App 图标生成
│   └── thin-icons.js           # 图标描边细化
└── docs/                       # 文档
```

## 数据模型

### collection_items（收藏表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| userId | string | 用户 OpenID |
| title | string | 地点名称 |
| category | string | 分类 key |
| coverImage | string | 封面（cloud:// 或 https://） |
| tags | string[] | 标签数组（最多 10 个） |
| location | object | `{ name, address, latitude, longitude }` |
| rating | number | 评分 1-5 |
| note | string | 备注（最多 200 字） |
| status | string | 'want_to_go' / 'visited' |
| createdAt | string | ISO 时间戳 |
| updatedAt | string | ISO 时间戳 |

> 注：v1.2 起已移除 `platform`、`platformLabel`、`originalUrl` 字段，收藏不再记录来源平台。

### categories（分类表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| userId | string | 用户 OpenID |
| key | string | 唯一标识 |
| label | string | 显示名称 |
| color | string | 分类颜色 hex |
| icon | string | 图标名 |
| isDefault | boolean | 是否默认分类 |
| order | number | 排序 |
| createdAt | string | ISO 时间戳 |

## 云函数

### login
返回当前用户的微信 OpenID。小程序启动时调用，结果缓存在 `globalData.openid`。

### parseLink（已移除）
~~解析 URL 的 Open Graph 标签~~。v1.2 起移除链接解析功能，改为纯手动录入。

## 云数据库操作

封装在 `utils/cloud.js`，所有方法通过 `ensureOpenId()` 确保用户身份。

| 方法 | 说明 |
|------|------|
| `addCollectionItem(data)` | 添加收藏 |
| `getCollections({ category, keyword, status, skip, limit })` | 分页查询收藏，支持分类/关键词/状态筛选 |
| `getAllCollections()` | 获取全部收藏（地图用，限 200 条） |
| `getCollectionDetail(id)` | 获取单条收藏详情 |
| `updateCollectionItem(id, data)` | 更新收藏 |
| `deleteCollectionItem(id)` | 删除收藏 |
| `getCollectionStats()` | 统计总数、想去、去过、各分类数量 |
| `getTagStats()` | 聚合全部标签出现次数 |
| `uploadImage(filePath)` | 上传封面图片到云存储 |
| `getCategories()` | 获取用户分类列表 |
| `addCategory(data)` / `updateCategory(id, data)` / `deleteCategory(id)` | 分类 CRUD |
| `seedDefaultCategories(defaults)` | 新用户初始化默认分类（16 个） |
| `renameTagInCollections(oldTag, newTag)` | 标签重命名，更新所有相关收藏 |
| `removeTagFromAllCollections(tag)` | 删除标签，从所有收藏中移除 |

## 全局状态

通过 `getApp().globalData` 实现跨页面数据桥：

| 字段 | 说明 |
|------|------|
| `openid` | 用户 OpenID 缓存 |
| `categories` | 分类列表缓存（首页/列表/详情/添加共享） |
| `editItemId` | 详情页 → 添加页编辑模式传递 ID |
| `statusFilter` | 首页统计点击 → 列表筛选想去/去过 |
| `tagFilter` | 标签统计点击 → 列表搜索该标签 |
| `categoryFilter` | 分类管理点击 → 列表筛选该分类 |
| `listNeedsRefresh` | 编辑/删除/改状态后标记列表需刷新 |
| `_weatherCache` | 天气数据缓存 `{ weatherType, temp, ts }`，30 分钟 TTL |

## 天气感知问候语

首页 Hero 问候语结合时间和实时天气生成诗意短语。

**流程**：
1. `index.onLoad()` → 先用纯时间短语占位
2. `wx.getLocation()` → 获取用户位置
3. `wx.request()` → 直连 Open-Meteo API（`api.open-meteo.com`）
4. `classifyWmoCode()` → WMO 天气码映射为 7 种天气类型
5. `getGreeting(hour, weatherType)` → 查表返回匹配短语

**映射体系**（`utils/weather-greeting.js`）：

- 8 个时段 × 7 种天气 = **56 个诗意短语**
- 时段：夜深 / 拂晓 / 晨间 / 上午 / 正午 / 午后 / 黄昏 / 入夜
- 天气：晴 / 多云 / 阴 / 雨 / 雪 / 雾 / 风
- 降级：位置/网络/API 任意环节失败 → 回退纯时间短语

**缓存**：`globalData._weatherCache`，30 分钟内不重复请求。

## 标签系统

### 标签添加
- 添加页手动输入，最多 10 个
- 已有标签快速点击添加（`getTagStats()` 获取历史标签）
- 标签在 JS 端实时过滤已选/未选

### 标签管理（`pages/tag-manage/`）
- 查看全部标签及使用次数
- **重命名**：调用 `renameTagInCollections(oldTag, newTag)`，遍历所有收藏替换
- **删除**：调用 `removeTagFromAllCollections(tag)`，直接移除无限制
- 点击标签跳转列表搜索

### 标签搜索
- 列表页支持模糊搜索标题、标签、备注、位置名称
- 搜索条件通过 CloudBase `db.RegExp` 实现，大小写不敏感
- 标签/分类/状态三种筛选互斥，切换时自动清空其他条件

## 封面生成

`generateCategoryCover(color)` — 生成 SVG data URI：
- 径向渐变底色（主色 → 深色 35%）
- 4 个半透明白色椭圆光斑，位置/大小/角度由颜色 RGB 值确定性生成（Mulberry32 PRNG）
- 每种颜色独一无二，无图片时自动使用

## 筛选互斥机制

列表页三种筛选方式互斥，避免交叉筛选造成空结果：

| 操作来源 | 应用的筛选 | 清空的筛选 |
|---------|-----------|-----------|
| 标签统计点击 | 标签关键词 | 分类 + 状态 |
| 分类管理点击 | 分类 | 搜索词 + 状态 |
| 首页统计点击 | 想去/去过 | 分类 + 搜索词 |
