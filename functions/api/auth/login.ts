interface Env {
  VITE_GITHUB_CLIENT_ID: string;
  APP_URL: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const state = crypto.randomUUID();

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.VITE_GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${env.APP_URL}/api/auth/callback`);
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
