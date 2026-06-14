# 数据库初始化指南

## 1. 创建集合 `collection_items`

在微信云开发控制台 → 数据库 → 添加集合，命名为 `collection_items`

## 2. 设置索引

| 索引名称 | 字段 | 方向 |
|---------|------|------|
| idx_userId | userId | 升序 |
| idx_user_category | userId + category | 升序 + 升序 |
| idx_user_created | userId + createdAt | 升序 + 降序 |
| idx_user_status | userId + status | 升序 + 升序 |

## 3. 权限设置

所有集合权限设置为「仅创建者可读写」

## 4. 云存储目录

创建目录 `covers/` 用于存储收藏封面图
