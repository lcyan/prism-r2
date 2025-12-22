import jwt from '@tsndr/cloudflare-worker-jwt';
import { parseCookies } from '../../lib/cookies';
import { errorResponse } from '../../lib/response';
import type { GitHubUser } from '../../types/auth';

interface Env {
  VITE_GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  GITHUB_WHITELIST_IDS: string;
  APP_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // 自动获取当前请求的 origin
  const appUrl = env.APP_URL || `${url.protocol}//${url.host}`;

  // 1. 验证 CSRF state
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  if (!state || state !== cookies.oauth_state) {
    return errorResponse('Invalid state parameter', 400);
  }

  if (!code) {
    return errorResponse('Missing code parameter', 400);
  }

  try {
    // 2. 用 code 换取 access_token
    if (!env.VITE_GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      console.error('[Auth Error] GitHub Client ID or Secret is not configured');
      return errorResponse('Server configuration error: GitHub credentials missing', 500);
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Prism-R2-Auth',
      },
      body: JSON.stringify({
        client_id: env.VITE_GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    // 检查响应状态
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[OAuth Error] GitHub token response:', tokenResponse.status, errorText);
      return errorResponse(`GitHub OAuth failed: ${tokenResponse.status} ${errorText.substring(0, 200)}`, 400);
    }

    const tokenData = await tokenResponse.json() as any;

    // 检查是否有错误信息
    if (tokenData.error) {
      console.error('[OAuth Error] GitHub returned error:', tokenData);
      return errorResponse(`GitHub OAuth error: ${tokenData.error} - ${tokenData.error_description || ''}`, 400);
    }

    if (!tokenData.access_token) {
      console.error('[OAuth Error] No access token in response:', tokenData);
      return errorResponse('Failed to get access token from GitHub', 400);
    }

    // 3. 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'Prism-R2-Auth', // GitHub API 要求必须包含 User-Agent
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('[OAuth Error] GitHub user response:', userResponse.status, errorText);
      return errorResponse(`Failed to get user info from GitHub: ${userResponse.status}`, 400);
    }

    const userData = await userResponse.json() as GitHubUser;

    // 4. 验证白名单
    if (!env.GITHUB_WHITELIST_IDS) {
      console.error('[Auth Error] GITHUB_WHITELIST_IDS is not configured');
      return errorResponse('Server configuration error: Whitelist missing', 500);
    }
    const whitelistIds = env.GITHUB_WHITELIST_IDS.split(',').map(id => id.trim());
    if (!whitelistIds.includes(String(userData.id))) {
      const redirectUrl = new URL(appUrl);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return Response.redirect(redirectUrl.toString(), 302);
    }

    // 5. 生成 JWT (7天过期)
    if (!env.JWT_SECRET) {
      console.error('[Auth Error] JWT_SECRET is not configured');
      return errorResponse('Server configuration error: JWT secret missing', 500);
    }
    const token = await jwt.sign({
      userId: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    }, env.JWT_SECRET);

    // 6. 设置 Cookie 并重定向
    const headers = new Headers();
    headers.set('Location', appUrl);
    headers.append('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`);
    headers.append('Set-Cookie', `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`);

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error: any) {
    console.error('[Auth Error]', error);
    return errorResponse('Authentication failed: ' + error.message, 500);
  }
};
