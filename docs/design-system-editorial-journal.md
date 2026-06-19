# 周末去哪儿 — Editorial Journal 设计系统 v6

**方向**: 编辑室 · Editorial Journal  
**对标**: Kinfolk / Cereal 杂志  
**定位**: 像翻一本纸质的私人旅行美食手记  
**日期**: 2026-06-19

---

## 配色

| Token | 值 | 用途 |
|-------|------|------|
| `--color-bg` | `#FAF8F5` | 暖象牙白（像书页），全局背景 |
| `--color-text` | `#2C2416` | 暖墨色，正文 |
| `--color-primary` | `#C2674A` | 铁锈红，唯一强调色 |
| `--color-primary-soft` | `#F5EDE6` | 暖灰底，标签/头像背景 |
| `--color-surface` | `#F3EFEA` | 暖灰调卡片底 |
| `--color-border` | `#E8E2D8` | 暖灰边框 |
| `--color-accent` | `#B88A5C` | 暖铜色点缀 |
| `--color-accent-soft` | `#F4EDE3` | 暖底标签 |
| `--color-white` | `#FFFFFF` | 纯白卡片 |
| `--color-success` | `#7C9A7E` | 沉绿成功态 |
| `--color-danger` | `#C46A5A` | 铁锈红危险态 |
| `--color-muted` | `#9E9688` | 灰褐弱文字 |

**原则**: 铁锈红作为全 App 唯一的强调色，不出现其他艳色。

---

## 字体

| 角色 | 字体 | 字重 | 加载方式 |
|------|------|------|----------|
| 标题 | **Noto Serif SC**（思源宋体） | 700 Bold, 900 Black | `wx.loadFontFace` |
| 正文 | **Noto Sans SC**（思源黑体） | 300 Light, 400 Regular, 500 Medium | `wx.loadFontFace` |

**标题用衬线体**——这是整个设计系统最具辨识度的特征。在中文 App 里几乎见不到衬线标题，这让「周末去哪儿」一眼就与众不同。

**Fallback**:
- 标题: `"Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif`
- 正文: `"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif`

---

## 形状与圆角

| 级别 | 值 | 用途 |
|------|-----|------|
| `--radius-sm` | `8rpx` | 小元素 |
| `--radius-md` | `12rpx` | 输入框、标签 |
| `--radius-lg` | `16rpx` | 卡片、面板 |
| `--radius-xl` | `24rpx` | 大卡片、底部弹窗 |
| `--radius-full` | `9999rpx` | 按钮、chip、pill |

**原则**: 圆角比之前大幅减小，卡片更方正，像书页印刷卡片，不追求圆润可爱感。

---

## 阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-card` | `0 2rpx 12rpx rgba(44,36,22,0.04)` | 普通卡片 |
| `--shadow-elevated` | `0 4rpx 20rpx rgba(44,36,22,0.06)` | 浮层卡片 |
| `--shadow-float` | `0 8rpx 32rpx rgba(44,36,22,0.08)` | 弹窗 |
| `--shadow-button` | `0 2rpx 10rpx rgba(194,103,74,0.18)` | 主按钮 |

**原则**: 阴影大幅减弱——编辑室风格靠留白和线条区分层级，不靠投影。

---

## 字号

| Token | 值 | 用途 |
|-------|-----|------|
| `--text-xs` | `20rpx` | 标签、辅助文字 |
| `--text-sm` | `24rpx` | 按钮、二级文字 |
| `--text-base` | `28rpx` | 正文 |
| `--text-md` | `32rpx` | 卡片标题 |
| `--text-lg` | `40rpx` | 区块标题 |
| `--text-xl` | `52rpx` | 页面大标题 |
| `--text-2xl` | `68rpx` | 页面主标题 |
| `--text-3xl` | `84rpx` | Hero 标题 |

---

## 按钮系统

| 层级 | 样式 | 使用场景 |
|------|------|----------|
| **Primary** | 铁锈红填充 + 白色文字 + 微阴影 | 主 CTA（提交、保存、添加） |
| **Secondary** | `1.5px solid` 边框 + 透明底 + 墨色文字 | 取消、清空、辅助操作 |
| **Tertiary** | 纯文字，无边框无底 | 返回、更多、链接 |

**原则**: 一个屏幕只有一个 Primary 按钮，其余全部降级为 Secondary/Tertiary。之前全是填充按钮的问题已经修正。

---

## 布局原则

- **留白优先**: 区块间距比之前增大 1.2-1.4x，让内容"呼吸"
- **不对称**: 标题左对齐，不居中（除 splash 页）
- **卡片方正**: 圆角减小，更像印刷排版中的卡片
- **线条分割**: 优先用 `1rpx border` 而非阴影来区分层级
- **无渐变按钮**: 所有渐变按钮改为纯色（铁锈红）

---

## 涵盖文件

| 文件 | 变更内容 |
|------|----------|
| `app.wxss` | 全局 token、字体、圆角、阴影、基础样式 |
| `app.js` | 字体加载切换为思源宋体+思源黑体 |
| `app.json` | 导航栏背景色、tab 栏选中色 |
| `pages/splash/splash.wxss` | 字体跟随全局 |
| `pages/index/index.wxss` | Hero badge 改下划线、间距加大 |
| `pages/list/list.wxss` | header 间距、action 遮罩色 |
| `pages/add/add.wxss` | 底部栏色、按钮改框线、评分星色 |
| `pages/map/map.wxss` | 弹窗遮罩色 |
| `pages/detail/detail.wxss` | 底部栏色、星色、删除色、渐变遮罩 |
| `pages/mine/mine.wxss` | 菜单间距、区块间距 |
| `pages/category-manage/category-manage.wxss` | 底部栏色、按钮去渐变、弹窗遮罩 |
| `components/collection-card/index.wxss` | 卡片圆角、间距、过渡曲线 |
