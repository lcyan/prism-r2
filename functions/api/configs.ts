import { authenticate } from '../lib/auth-middleware';
import { errorResponse } from '../lib/response';

interface Env {
    PRISM_KV: KVNamespace;
    JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // 验证认证
    const user = await authenticate(request, env.JWT_SECRET);
    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    // 原有逻辑
    try {
        const configs = await env.PRISM_KV.get("R2_CONFIGS");

        const headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        };

        if (!configs) {
            return new Response(JSON.stringify([]), { headers });
        }

        return new Response(configs, { headers });
    } catch (e: any) {
        return errorResponse(e.message, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const user = await authenticate(request, env.JWT_SECRET);
    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        const configs = await request.json();
        await env.PRISM_KV.put("R2_CONFIGS", JSON.stringify(configs));
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return errorResponse(e.message, 500);
    }
};
