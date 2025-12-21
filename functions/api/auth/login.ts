interface Env {
  VITE_GITHUB_CLIENT_ID: string;
  APP_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const state = crypto.randomUUID();

  // 自动获取当前请求的 origin，如果 APP_URL 未设置则使用它
  const requestUrl = new URL(request.url);
  const appUrl = env.APP_URL || `${requestUrl.protocol}//${requestUrl.host}`;

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.VITE_GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${appUrl}/api/auth/callback`);
  githubAuthUrl.searchParams.set('scope', 'read:user');
  githubAuthUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      'Location': githubAuthUrl.toString(),
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/`,
    },
  });
};
