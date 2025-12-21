# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Prism R2 是一个用于管理 Cloudflare R2 对象存储的现代化仪表板，基于 React + Vite + TailwindCSS 构建，专为 Cloudflare Pages 部署设计。核心特点是**客户端逻辑**——所有 R2 操作都在浏览器中使用 AWS SDK v3 完成。

该应用现在包含了完整的 GitHub OAuth 2.0 认证系统，替换了之前的简单本地认证机制。

## 常用命令

```bash
# 安装依赖
npm install

# 开发服务器 (http://localhost:5174)
npm run dev

# 构建生产版本
npm run build

# 类型检查 + 构建
tsc -b && vite build

# 代码检查
npm run lint

# 预览构建结果
npm run preview
```

## 核心架构

### 1. 客户端 R2 管理架构

**R2Manager 单例模式** (`src/lib/r2Client.ts`)
- 使用 `@aws-sdk/client-s3` 和 `@aws-sdk/lib-storage` 与 R2 通信
- 所有 S3 操作直接在浏览器中执行 (需要 CORS 配置)
- 必须使用 `forcePathStyle: true` 以兼容 Cloudflare R2 账户级端点
- 支持 KV 同步配置 (通过 `/api/configs` 端点)

**关键点:**
- 端点格式: `https://{accountId}.r2.cloudflarestorage.com`
- 使用 `region: "auto"` 和 path-style 寻址
- 分块上传使用 5MB partSize, 4 并发队列

### 2. 认证系统架构

**GitHub OAuth 2.0 认证** (`functions/api/auth/`)
- 完整的 OAuth 流程：login → callback → session → logout
- 基于 GitHub User ID 的白名单验证（环境变量配置）
- JWT + HttpOnly Cookie 会话管理（7天过期）
- CSRF 保护（state 参数验证）
- 服务端认证中间件保护 API 端点

### 3. 配置管理双重存储

**LocalStorage (主要)**
- `r2_configs`: 所有配置的 JSON 数组
- `r2_active_id`: 当前激活的配置 ID
- `r2_user`: 认证状态 (JWT 解码后的用户信息)
- `r2_skip_guide`: 是否跳过欢迎引导

**Cloudflare KV (可选)**
- 用于预加载配置 (无键入访问)
- Functions 端点: `functions/api/configs.ts`
- KV 绑定: `PRISM_KV` → 键 `R2_CONFIGS`

配置加载优先级: KV > LocalStorage

### 4. 状态管理

使用 React Hooks 进行状态管理,无外部状态库:
- `useR2` hook (`src/hooks/useR2.ts`): 配置和路径管理
- App 组件: 文件列表、上传、删除等业务逻辑

### 5. 功能模块结构

```
src/
  features/
    auth/        - 登录页 (GitHub OAuth 流程)
    config/      - 配置编辑器 (支持导入/导出 JSON)
    dashboard/   - 文件列表 (网格/列表视图,搜索,批量操作)
    upload/      - 拖放上传卡片 (支持 WebP 转换)

  components/
    Layout.tsx   - 全局布局 (导航,状态栏)
    WelcomeGuide.tsx - 首次使用引导

  lib/
    r2Client.ts  - R2Manager 核心逻辑

  types/
    index.ts     - R2File 接口,工具函数 (formatSize 等)

functions/         - Cloudflare Functions (服务端逻辑)
  api/
    auth/        - OAuth 认证端点 (login, callback, session, logout)
    configs.ts   - KV 配置同步端点
  lib/           - 工具函数和认证中间件
  types/         - 认证类型定义
```

## 重要技术细节

### CORS 要求
**必须在 R2 存储桶上配置 CORS**,允许来自部署域的请求:
```json
{
  "AllowedOrigins": ["http://localhost:5174", "https://your-app.pages.dev"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag", "Content-Length"]
}
```

### Node.js Polyfills
使用 `vite-plugin-node-polyfills` 为 AWS SDK 提供浏览器 polyfills:
- Buffer, process, util, stream, events
- 在 `vite.config.ts` 中配置
- 特殊别名: `"./runtimeConfig": "./runtimeConfig.browser"`

### 多配置支持
- 用户可以添加多个 R2 配置并切换
- 每个配置包含: accountId, accessKeyId, secretAccessKey, bucketName, customDomain
- 切换配置会重新初始化 R2Manager 实例

### WebP 转换功能
上传时可选择自动将图片转换为 WebP 格式 (使用 Canvas API,客户端完成)

## 开发注意事项

1. **所有 R2 操作都在客户端** - 不要尝试在服务端执行 R2 SDK 调用 (除了 KV 同步)
2. **错误处理** - 如果操作失败,优先检查 CORS 配置和 R2 凭证
3. **中文界面** - UI 文本主要为中文,新功能应遵循此约定
4. **认证系统** - 当前是基于 GitHub OAuth 的真实认证系统
5. **公共 URL 生成** - 优先使用 `customDomain`,否则回退到默认 R2 域名

## Cloudflare Pages 部署

- 构建命令: `npm run build`
- 输出目录: `dist`
- Functions 目录: `functions/` (自动识别)
- 需要绑定 KV (如果使用配置同步功能)
- 需要环境变量:
  - `VITE_GITHUB_CLIENT_ID`: GitHub OAuth 应用客户端 ID
  - `GITHUB_CLIENT_SECRET`: GitHub OAuth 应用客户端密钥
  - `JWT_SECRET`: JWT 签名密钥
  - `GITHUB_WHITELIST_IDS`: 允许访问的 GitHub 用户 ID 列表
  - `APP_URL`: (可选) 应用 URL，用于 OAuth 回调

## 类型系统

主要类型定义:
- `R2Config` - R2 存储桶配置
- `R2File` - 文件元数据 (name, key, size, lastModified, type)
- 使用 TypeScript 严格模式,配置在 `tsconfig.json`