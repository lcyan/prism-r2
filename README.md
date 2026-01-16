# Prism R2

![Prism R2 Dashboard](https://socialify.git.ci/lcyan/prism-r2/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto)

> ✨ **极致优雅、沉浸式的 Cloudflare R2 对象存储管理面板**

Prism R2 是一个基于 React 19 和 Chakra UI v3 构建的现代 R2 管理仪表盘。它专为追求极致视觉体验和高效操作的用户设计，提供了玻璃拟态风格的 UI、流畅的交互动画以及强大的文件管理功能。

## 📸 预览

_(在此处添加您的截图 - 建议替换为最新界面的截图)_

## ✨ 核心特性

- **💎 沉浸式设计**: 深度定制的玻璃拟态 (Glassmorphism) 界面，配合 `framer-motion` 带来的丝滑交互动效。
- **🚀 极速文件管理**:
  - **拖拽上传**: 支持侧边栏及主区域拖拽上传。
  - **响应式布局**: 智能适配移动端、平板及超大宽屏 (最高支持 5 列网格)。
  - **批量操作**: 支持多选文件进行批量删除。
  - **视图切换**: 灵活切换网格 (Grid) 与列表 (List) 视图。
- **⚡️ 高效生产力**:
  - **一键复制**: 专为创作者设计的格式化复制按钮，支持 URL、HTML、Markdown、BBCode 四种格式。
  - **格式色彩**: 独创的格式色彩系统 (Lime/Blue/Purple/Orange) 帮助快速识别。
- **🔐 安全可靠**:
  - **GitHub OAuth**: 内置安全的 GitHub 登录流程 (基于 Cloudflare Pages Functions)。
  - **本地/KV 配置**: 支持通过 Cloudflare KV 或本地配置管理多个 Bucket 凭证。
  - **直连 R2**: 核心文件操作基于 AWS SDK 直接与 R2 交互，无需中转服务器。

## 🛠 技术栈

- **前端框架**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **UI 组件库**: [Chakra UI v3](https://chakra-ui.com/)
- **数据状态**: [TanStack Query](https://tanstack.com/query/latest)
- **图标库**: [Lucide React](https://lucide.dev/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **部署平台**: Cloudflare Pages + Functions

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm / npm / yarn

### 本地开发

1. **克隆项目**

   ```bash
   git clone https://github.com/yourusername/prism-r2.git
   cd prism-r2
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 📦 部署指南 (Cloudflare Pages)

Prism R2 专为 Cloudflare Pages 设计，支持开箱即用的零配置部署。

1. **Fork 本仓库** 到您的 GitHub。
2. 登录 **Cloudflare Dashboard** > **Workers & Pages**。
3. 创建新应用 -> **Connect to Git** -> 选择本仓库。
4. **构建配置**:
   - **Framework Preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **环境变量配置** (可选):
   您可以在 Pages 后台配置 `R2_CONFIGS` 环境变量来预设存储桶信息。

### 权限与 CORS 配置

为了让前端能直接访问您的 R2 存储桶，请务必在 **R2 Bucket Settings** -> **CORS Policy** 中添加允许规则：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://your-project.pages.dev"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

## 🧩 配置说明

### 添加存储桶 (Buckets)

您可以通过以下两种方式添加 R2 存储桶：

1. **UI 界面添加**: 登录后点击侧边栏的 "存储桶配置"，手动输入 `Access Key ID`, `Secret Access Key`, `Bucket Name` 等信息。配置将加密存储在本地。
2. **Cloudflare KV (推荐)**: 在 Cloudflare 后台绑定 KV Namespace，并通过 Key `R2_CONFIGS` 注入 JSON 配置。

## 📄 开源协议

MIT LicenseRequest
