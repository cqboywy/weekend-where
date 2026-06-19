# 周末去哪儿 — 技术架构

## 技术栈

- **前端框架**: 微信小程序原生（WXML + WXSS + JS）
- **后端服务**: 微信云开发 CloudBase
  - 云数据库（NoSQL）
  - 云存储（图片上传）
  - 云函数（Node.js）
- **字体**: Noto Serif SC（标题）+ Noto Sans SC（正文），通过 `wx.loadFontFace` 加载
- **图标**: 自定义 Lucide SVG 图标组件（20 个图标，1.5px 细描边）

## 项目结构

```
weekend-where/
├── miniprogram/                # 小程序前端
│   ├── app.js / .json / .wxss  # 全局配置
│   ├── pages/                  # 页面
│   │   ├── splash/             # 启动页
│   │   ├── index/              # 首页
│   │   ├── map/                # 地图页
│   │   ├── add/                # 添加页
│   │   ├── list/               # 列表页
│   │   ├── detail/             # 详情页
│   │   ├── mine/               # 我的页
│   │   └── category-manage/    # 分类管理
│   ├── components/
│   │   ├── collection-card/    # 收藏卡片组件
│   │   └── lucide-icon/        # SVG 图标组件
│   ├── utils/
│   │   ├── cloud.js            # 云开发操作封装
│   │   └── constants.js        # 常量 + 封面生成
│   └── images/                 # 图标资源（Tab 图标、App 图标）
├── cloudfunctions/             # 云函数
│   ├── login/                  # 获取微信 OpenID
│   └── parseLink/              # 链接 OG 标签解析
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
| platform | string | 来源平台 key |
| platformLabel | string | 来源平台显示名 |
| originalUrl | string | 原始链接 |
| coverImage | string | 封面（cloud:// 或 https://） |
| tags | string[] | 标签数组（最多 10 个） |
| location | object | `{ name, address, latitude, longitude }` |
| rating | number | 评分 1-5 |
| note | string | 备注（最多 200 字） |
| status | string | 'want_to_go' / 'visited' |
| createdAt | string | ISO 时间戳 |
| updatedAt | string | ISO 时间戳 |

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
返回当前用户的微信 OpenID。

### parseLink
解析 URL 的 Open Graph 标签，返回 `{ title, description, coverImage, platform }`。自动识别小红书、抖音、B站、大众点评、微信等平台。

## 全局状态

通过 `getApp().globalData` 管理：

| 字段 | 说明 |
|------|------|
| openid | 用户 OpenID |
| categories | 分类列表缓存 |
| editItemId | 编辑收藏时传递 ID |
| statusFilter | 从首页跳转列表的状态筛选 |
| tagFilter | 从标签统计跳转列表的标签筛选 |
| categoryFilter | 从分类管理跳转列表的分类筛选 |

## 封面生成

`generateCategoryCover(color)` — 生成 SVG data URI：
- 径向渐变底色（主色 → 深色）
- 4 个半透明白色椭圆光斑，位置/大小/角度由颜色 RGB 值确定性生成
- 每种颜色独一无二，无需预定义图标库
