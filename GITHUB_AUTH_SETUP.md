# GitHub OAuth 登录配置指南

GitHub OAuth 登录功能已完成实施。按照以下步骤完成配置。

## 一、获取你的 GitHub User ID

在命令行运行（将 `your-username` 替换为你的 GitHub 用户名）：

```bash
curl https://api.github.com/users/your-username
```

在返回的 JSON 中找到 `"id"` 字段，这就是你的 GitHub User ID（数字）。

## 二、生成 JWT 密钥

在命令行运行：

```bash
openssl rand -base64 32
```

复制生成的随机字符串，用于 JWT 签名。

## 三、配置本地开发环境

### 1. 更新 `.env.local` 文件

打开 `D:\code\prism-r2\.env.local`，填写以下值：

```bash
# GitHub OAuth App Client ID（已有，无需修改）
VITE_GITHUB_CLIENT_ID=xxxxxxxxxxxxx

# GitHub OAuth App Client Secret
# 在 https://github.com/settings/developers 找到你的 OAuth App，复制 Client Secret
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxx

# JWT 签名密钥
# 使用上一步生成的随机字符串
JWT_SECRET=你生成的随机密钥

# GitHub 白名单（你的 User ID）
# 使用第一步获取的数字 ID
GITHUB_WHITELIST_IDS=你的_github_user_id

# 应用 URL（本地开发无需修改）
APP_URL=http://localhost:5174
```

### 2. 配置 GitHub OAuth App 回调 URL

访问 https://github.com/settings/developers，找到你的 OAuth App：

- 点击 **Edit** 编辑应用设置
- 在 **Authorization callback URL** 中添加：
  ```
  http://localhost:5174/api/auth/callback
  ```
- 点击 **Update application** 保存

## 四、测试本地开发

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试登录流程

1. 访问 http://localhost:5174
2. 点击"通过 GitHub 继续"按钮
3. 应该重定向到 GitHub 授权页面
4. 授权后应返回首页并显示已登录状态

### 3. 验证会话

- 打开浏览器开发者工具 → Application → Cookies
- 应该看到 `auth_token` Cookie（HttpOnly 属性）
- 刷新页面，应保持登录状态

### 4. 测试登出

- 点击退出登录按钮
- Cookie 应被清除
- 应重定向到登录页

## 五、配置 Cloudflare Pages 生产环境

### 1. 更新 GitHub OAuth App

在 https://github.com/settings/developers 的同一个 OAuth App 中：

- 在 **Authorization callback URL** 中添加生产环境回调（保留本地开发的回调）：
  ```
  http://localhost:5174/api/auth/callback
  https://your-project.pages.dev/api/auth/callback
  ```
  将 `your-project.pages.dev` 替换为你的实际域名

### 2. 配置 Cloudflare Pages 环境变量

访问 Cloudflare Dashboard → Workers & Pages → 你的项目 → Settings → Environment Variables

添加以下环境变量（**Production** 环境）：

| 变量名 | 值 | 说明 |
|-------|-----|------|
| `VITE_GITHUB_CLIENT_ID` | `xxxxxxxxxxxx` | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | `ghp_xxxxxxxxxxxx` | GitHub OAuth Client Secret |
| `JWT_SECRET` | 你生成的随机密钥 | JWT 签名密钥（至少 32 字符） |
| `GITHUB_WHITELIST_IDS` | `你的_user_id` | 允许的 GitHub User ID（逗号分隔多个） |
| `APP_URL` | `https://your-project.pages.dev` | 应用 URL |

**重要提示**：
- 确保每个变量都正确保存
- 环境变量修改后需要重新部署才能生效

### 3. 重新部署

推送代码到 GitHub 触发自动部署，或在 Cloudflare Dashboard 手动触发部署。

### 4. 验证生产环境

1. 访问 `https://your-project.pages.dev`
2. 测试完整的登录流程
3. 验证白名单功能（使用不在白名单的 GitHub 账号尝试登录应显示 403 错误）

## 六、安全提示

1. **不要提交敏感信息到代码库**
   - `.env.local` 已被 `.gitignore` 忽略
   - 永远不要将 `GITHUB_CLIENT_SECRET` 和 `JWT_SECRET` 提交到 Git

2. **定期更换密钥**
   - 建议定期更换 JWT_SECRET
   - 如果怀疑密钥泄露，立即更换

3. **保护 Cloudflare Dashboard 访问**
   - 使用强密码和 2FA
   - 限制团队成员访问权限

4. **监控异常登录**
   - 在 Cloudflare Dashboard → Workers & Pages → Logs 查看认证日志
   - 留意异常的 403 错误（可能是未授权访问尝试）

## 七、常见问题

### Q: 本地开发时提示 "Invalid state parameter"
A: 这通常是 Cookie 问题。确保：
- 浏览器允许第三方 Cookie
- 本地开发时使用 HTTP（生产环境必须使用 HTTPS）
- 如果问题持续，清除浏览器 Cookie 后重试

### Q: 生产环境 Cookie 未设置
A: 确保：
- GitHub OAuth App 的回调 URL 正确配置为 HTTPS
- Cloudflare Pages 环境变量 `APP_URL` 使用 HTTPS
- 浏览器允许 Secure Cookie（生产环境需要 HTTPS）

### Q: 白名单验证失败
A: 检查：
- 使用的是 GitHub User ID（数字），不是用户名
- 环境变量 `GITHUB_WHITELIST_IDS` 格式正确（逗号分隔，无空格）
- 多个 ID 的格式：`1234567,7654321,9876543`

### Q: 会话经常过期
A: 当前会话有效期为 7 天。如需调整，修改：
- `functions/api/auth/callback.ts` 第 72 行的过期时间

## 八、文件清单

### 新建文件（8 个）
- `functions/lib/cookies.ts` - Cookie 解析工具
- `functions/lib/response.ts` - 响应工具函数
- `functions/lib/auth-middleware.ts` - 认证中间件
- `functions/types/auth.ts` - 认证类型定义
- `functions/api/auth/login.ts` - OAuth 登录端点
- `functions/api/auth/callback.ts` - OAuth 回调端点
- `functions/api/auth/session.ts` - 会话验证端点
- `functions/api/auth/logout.ts` - 登出端点

### 修改文件（4 个）
- `src/features/auth/LoginPage.tsx` - 使用真实 OAuth
- `src/App.tsx` - 认证检查和登出逻辑
- `src/lib/r2Client.ts` - Cookie 认证
- `functions/api/configs.ts` - 添加认证保护

### 配置文件
- `package.json` - 添加了 `@tsndr/cloudflare-worker-jwt` 依赖
- `.env.local` - 环境变量配置

---

**下一步**：填写 `.env.local` 中的真实值，然后运行 `npm run dev` 测试登录流程！
