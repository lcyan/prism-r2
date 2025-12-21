import jwt from '@tsndr/cloudflare-worker-jwt';
import { parseCookies } from './cookies';
import type { JWTPayload } from '../types/auth';

export async function authenticate(request: Request, jwtSecret: string): Promise<JWTPayload | null> {
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) return null;

  try {
    const isValid = await jwt.verify(token, jwtSecret);
    if (!isValid) return null;

    const { payload } = jwt.decode(token) as { payload: JWTPayload };

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
