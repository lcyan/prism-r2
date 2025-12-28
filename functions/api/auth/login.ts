interface Env {
  VITE_GITHUB_CLIENT_ID: string;
  APP_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const state = crypto.randomUUID();

    // 检查环境变量
    if (!env.VITE_GITHUB_CLIENT_ID) {
      console.error('[Auth Error] VITE_GITHUB_CLIENT_ID is not configured in Cloudflare Dashboard');
      return new Response('Configuration Error: VITE_GITHUB_CLIENT_ID is missing in Functions environment variables.', { status: 500 });
    }

    // 自动获取当前请求的 origin
    const requestUrl = new URL(request.url);
    const appUrl = env.APP_URL || `${requestUrl.protocol}//${requestUrl.host}`;

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', env.VITE_GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.set('redirect_uri', `${appUrl}/api/auth/callback`);
    githubAuthUrl.searchParams.set('scope', 'read:user');
    githubAuthUrl.searchParams.set('state', state);

    console.log(`[Auth] Redirecting to GitHub: ${githubAuthUrl.toString()}`);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': githubAuthUrl.toString(),
        'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/`,
      },
    });
  } catch (error: any) {
    console.error('[Auth Error] Login handler failed:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
};
