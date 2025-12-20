# Prism R2 - Premium Cloudflare R2 Dashboard

Prism R2 is a modern, beautiful, and secure dashboard for managing your Cloudflare R2 Object Storage. Built with React, Vite, and TailwindCSS, it is designed to be deployed instantly on Cloudflare Pages.

## ✨ Features

- **🎨 Premium UI**: Glassmorphism design, smooth animations, and responsive layout.
- **🚀 Smart Upload**: Drag & Drop support with **Automatic WebP Conversion** options.
- **📂 File Management**: Grid/List views, search filtering, directory navigation, and bulk operations.
- **🔗 Quick Actions**: One-click copy for URL, Markdown, HTML, and BBCode formats.
- **☁️ Cloud Config**: Auto-load storage configurations using Cloudflare KV.
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

### Step 3: (Optional) Pre-load Configurations via KV
You can use Cloudflare KV to store your bucket credentials, so the dashboard automatically loads them when opened (Keyless entry for users).

1. **Create KV Namespace**:
   - In Cloudflare Dashboard, go to **Workers & Pages** > **KV**.
   - Create a namespace named `PRISM_KV`.

2. **Bind KV to Pages**:
   - Go to your Pages Project > **Settings** > **Functions**.
   - Scroll to **KV Namespace Bindings** > **Add Binding**.
   - **Variable name**: `PRISM_KV` (Case sensitive).
   - **KV namespace**: Select `PRISM_KV`.
   - **Re-deploy** your project for settings to take effect.

3. **Add Configuration Data**:
   - Go to the KV Namespace you created.
   - Add a new Key-Value pair:
     - **Key**: `R2_CONFIGS`
     - **Value**: A JSON Array of your bucket configs (see format below).

#### `R2_CONFIGS` JSON Format
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
    "endpoint": "https://<accountid>.r2.cloudflarestorage.com"
  }
]
```

> ⚠️ **Security Warning**: If you use the KV feature, anyone accessing your site can load these credentials. It is highly recommended to protect your Prism R2 Dashboard using **Cloudflare Access (Zero Trust)** to ensure only authorized users can visit the site.

## 📄 License
MIT
