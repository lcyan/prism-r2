# Development Mode Setup

For local development, you can auto-load R2 credentials from environment variables:

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your R2 credentials in `.env.local`

3. Restart dev server:
   ```bash
   npm run dev
   ```

Your R2 config will be automatically loaded without needing to log in or manually configure.

If no environment variables are provided, you'll need to configure R2 manually in the UI.
