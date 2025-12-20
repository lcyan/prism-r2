# Prism R2 - 高级 Cloudflare R2 对象存储管理面板

Prism R2 是一个现代、美观且安全的 Cloudflare R2 对象存储管理仪表盘。基于 React、Vite 和 TailwindCSS 构建，专为 Cloudflare Pages 的即时部署而设计。

[English README](README.md)

## ✨ 主要特性

- **🎨 高级 UI 设计**: 采用玻璃拟态（Glassmorphism）设计，拥有流畅的动画和完美的响应式布局。
- **🚀 智能上传**: 支持拖拽上传，并提供 **WebP 自动转换** 选项，优化图片体积。
- **📂 文件管理**: 支持网格/列表视图切换、搜索过滤、目录导航以及批量操作（删除）。
- **🔗 快捷操作**: 一键复制 URL、Markdown、HTML 和 BBCode 格式链接。
- **☁️ 云端配置同步**: 支持通过 Cloudflare KV 自动加载存储桶配置，实现免配置登录。
- **🔒 安全隐私**: 核心逻辑完全在浏览器端运行（客户端），不经由第三方服务器中转密钥。

## 🛠️ 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 🚀 部署指南

### 第一步：部署到 Cloudflare Pages
1. 将此代码推送到您的 GitHub 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages**。
3. 点击 **Create Application** > **Connect to Git** > 选择您的仓库。
4. 配置构建设置 (Build Settings):
   - **Framework Preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 **Save and Deploy**。

### 第二步：配置 CORS (至关重要 ⚠️)
由于 Prism R2 是纯前端应用，您**必须**在 R2 存储桶设置中配置跨域资源共享 (CORS) 策略，允许您的 Pages 域名访问。

进入 **R2** > **您的存储桶** > **Settings** > **CORS Policy**，添加以下配置：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5174",
      "https://您的项目名.pages.dev",
      "https://您的自定义域名.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

### 第三步：(可选) 通过 KV 预加载配置
您可以使用 Cloudflare KV 来存储您的存储桶凭证，这样当您打开仪表盘时，系统会自动加载这些配置（实现“无密钥”访问体验）。

1. **创建 KV 命名空间**:
   - 在 Cloudflare Dashboard 中，进入 **Workers & Pages** > **KV**。
   - 创建一个名为 `PRISM_KV` 的命名空间。

2. **绑定 TV 到 Pages**:
   - 进入您的 Pages 项目 > **Settings** > **Functions**。
   - 滚动到 **KV Namespace Bindings** > **Add Binding**。
   - **Variable name (变量名)**: `PRISM_KV` (注意大小写)。
   - **KV namespace**: 选择刚才创建的 `PRISM_KV`。
   - **重新部署** 您的项目以使设置生效。

3. **添加配置数据**:
   - 进入您刚才创建的 KV 命名空间。
   - 添加一个新的键值对 (Key-Value pair):
     - **Key**: `R2_CONFIGS`
     - **Value**: 一个包含您存储桶配置的 JSON 数组（参见下方格式）。

#### `R2_CONFIGS` JSON 格式示例
```json
[
  {
    "id": "1",
    "name": "公开静态资源",
    "accountId": "f123456789...",
    "accessKeyId": "YOUR_ACCESS_KEY_ID",
    "secretAccessKey": "YOUR_SECRET_ACCESS_KEY",
    "bucketName": "my-bucket-name",
    "customDomain": "https://cdn.example.com",
    "endpoint": "https://<accountid>.r2.cloudflarestorage.com"
  }
]
```

> ⚠️ **安全警告**: 如果您使用 KV 功能存储了 accessKeyId 和 secretAccessKey，任何拥有您网站访问权限的人都可以加载这些凭证。强烈建议使用 **Cloudflare Access (Zero Trust)** 来保护您的 Prism R2 仪表盘，确保只有授权用户（及团队成员）可以访问该站点。

## 📄 开源协议
MIT
