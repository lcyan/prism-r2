import jwt from '@tsndr/cloudflare-worker-jwt';
import { parseCookies } from '../../lib/cookies';
import { errorResponse } from '../../lib/response';
import type { GitHubUser } from '../../types/auth';

interface Env {
  VITE_GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  GITHUB_WHITELIST_IDS: string;
  APP_URL: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

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
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.VITE_GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as any;
    if (!tokenData.access_token) {
      return errorResponse('Failed to get access token', 400);
    }

    // 3. 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const userData = await userResponse.json() as GitHubUser;

    // 4. 验证白名单
    const whitelistIds = env.GITHUB_WHITELIST_IDS.split(',').map(id => id.trim());
    if (!whitelistIds.includes(String(userData.id))) {
      return errorResponse('您的账号未被授权访问此系统，请联系管理员', 403);
    }

    // 5. 生成 JWT (7天过期)
    const token = await jwt.sign({
      userId: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    }, env.JWT_SECRET);

    // 6. 设置 Cookie 并重定向
    return new Response(null, {
      status: 302,
      headers: {
        'Location': env.APP_URL,
        'Set-Cookie': [
          `auth_token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
          `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`,
        ].join(', '),
      },
    });
  } catch (error: any) {
    console.error('[Auth Error]', error);
    return errorResponse('Authentication failed: ' + error.message, 500);
  }
};
