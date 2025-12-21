import jwt from '@tsndr/cloudflare-worker-jwt';
import { parseCookies } from '../../lib/cookies';
import { jsonResponse } from '../../lib/response';
import type { JWTPayload } from '../../types/auth';

interface Env {
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return jsonResponse({ authenticated: false }, 401);
  }

  try {
    const isValid = await jwt.verify(token, env.JWT_SECRET);
    if (!isValid) {
      return jsonResponse({ authenticated: false, error: 'Invalid token' }, 401);
    }

    const { payload } = jwt.decode(token) as { payload: JWTPayload };

    // 检查过期时间
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return jsonResponse({ authenticated: false, error: 'Token expired' }, 401);
    }

    return jsonResponse({
      authenticated: true,
      user: {
        id: payload.userId,
        login: payload.login,
        name: payload.name,
        avatar: payload.avatar,
      },
    });
  } catch (error: any) {
    return jsonResponse({ authenticated: false, error: 'Invalid token' }, 401);
  }
};
