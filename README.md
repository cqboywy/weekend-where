# 周末去哪儿

微信小程序 · 收藏美食与出游灵感，像翻一本私人的旅行杂志。

## 功能

- 添加收藏 — 粘贴链接自动解析，或手动录入地点、分类、标签、评分、备注
- 封面图片 — 拍照或相册上传，无图时自动生成分类光斑封面
- 地图浏览 — 在地图上查看所有收藏，按分类和标签筛选
- 分类管理 — 自定义分类名称和颜色，自由排序
- 标签系统 — 每个收藏可打 10 个标签，搜索时标签和名称同时匹配
- 标签统计 — 查看最常出现的标签，点击即可筛选
- 瀑布流首页 — 每日精选 + 往期收藏双列画报
- 七日刊启动页 — 每天不同的杂志封面风格
- 编辑室设计 — 思源宋体标题、暖纸配色、极简几何装饰

## 技术栈

- 微信小程序原生框架
- 微信云开发（CloudBase）— 云数据库 + 云存储 + 云函数
- 纯 CSS / SVG 图标系统

## 项目结构

```
miniprogram/
├── pages/
│   ├── splash/           # 七日刊启动页
│   ├── index/            # 首页 · 每日精选 + 藏本
│   ├── map/              # 地图浏览
│   ├── add/              # 添加收藏
│   ├── list/             # 收藏列表
│   ├── detail/           # 收藏详情
│   ├── mine/             # 我的
│   └── category-manage/  # 分类管理
├── components/
│   └── collection-card/  # 收藏卡片
├── utils/
│   ├── cloud.js          # 云数据库操作
│   └── constants.js      # 常量 + 封面生成
└── images/               # 图标资源
cloudfunctions/
├── login/                # 获取 OpenID
└── parseLink/            # 链接解析（OG 标签）
```

## 文档

| 文档 | 说明 |
|------|------|
| [产品概述](docs/product-overview.md) | 产品定位、使用场景、功能清单、页面结构 |
| [技术架构](docs/technical-architecture.md) | 技术栈、数据模型、云函数、全局状态 |
| [设计系统](docs/design-system-editorial-journal.md) | 配色、字体、圆角、阴影、按钮、布局原则 |
| [更新日志](docs/changelog.md) | v1.0 / v1.1 完整更新记录 |
| [图标指南](docs/icon-guide.md) | 图标系统使用说明 |
| [使用指南](docs/app-guide.md) | 给朋友的介绍文档，每页截图+简要说明 |

## 开始使用

1. 克隆仓库
2. 微信开发者工具导入 `miniprogram/` 目录
3. 开通云开发，创建 `collection_items` 和 `categories` 集合
4. 上传 `cloudfunctions/` 下的云函数
5. 编译运行

## License

MIT
