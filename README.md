# Prism R2 - Premium Cloudflare R2 Dashboard

Prism R2 is a modern, beautiful, and secure dashboard for managing your Cloudflare R2 Object Storage. Built with React, Vite, and TailwindCSS, it is designed to be deployed instantly on Cloudflare Pages.

## ✨ Features

- **🎨 Premium UI**: Glassmorphism design, smooth animations, and responsive layout.
- **🚀 Smart Upload**: Drag & Drop support with **Automatic WebP Conversion** options.
- **📂 File Management**: Grid/List views, search filtering, directory navigation, and bulk operations.
- **🔗 Quick Actions**: One-click copy for URL, Markdown, HTML, and BBCode formats.
- **☁️ Cloud Config**: Auto-load multiple storage configurations using environment variables.
- **🔒 Secure**: Core logic runs entirely in your browser (Client-Side).

## 🛠️ Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment Guide

### Step 1: Deploy to Cloudflare Pages
1. Push this code to your GitHub repository.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages**.
3. Click **Create Application** > **Connect to Git** > Select your repository.
4. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

### Step 2: Configure CORS (Crucial)
Since Prism R2 runs in the browser, you **MUST** configure CORS on your R2 buckets to allow cross-origin requests.

Go to **R2** > **Your Bucket** > **Settings** > **CORS Policy** and add:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5174",
      "https://your-project.pages.dev",
      "https://your-custom-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 3: (Optional) Pre-load Configurations via Environment Variables
You can use Cloudflare Pages environment variables to store your bucket credentials, so the dashboard automatically loads them when opened (Keyless entry for users).

1. **Configure Environment Variables**:
   - Go to your Pages project > **Settings** > **Environment variables**.
   - Click **Add variables**.
   - **Variable name**: `R2_CONFIGS`.
   - **Value**: A JSON array string containing your bucket configurations (see format below).
   - **Redeploy** your project for the settings to take effect.

#### `R2_CONFIGS` JSON Format Example
```json
[
  {
    "id": "1",
    "name": "Public Assets",
    "accountId": "f123456789...",
    "accessKeyId": "YOUR_ACCESS_KEY_ID",
    "secretAccessKey": "YOUR_SECRET_ACCESS_KEY",
    "bucketName": "my-bucket-name",
    "customDomain": "https://cdn.example.com",
    "endpoint": "https://<accountid>.r2.cloudflarestorage.com",
    "isDefault": true
  }
]
```

> ⚠️ **Security Warning**: If you use environment variables to store credentials, anyone with access to your site can load them. It is highly recommended to use **GitHub OAuth** (built-in) or **Cloudflare Access (Zero Trust)** to protect your Prism R2 dashboard.

## 📄 License
MIT
