import { jsonResponse } from '../../lib/response';

export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `auth_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`,
    },
  });
};
