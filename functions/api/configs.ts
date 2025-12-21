import { authenticate } from '../lib/auth-middleware';
import { errorResponse } from '../lib/response';

interface Env {
    R2_CONFIGS?: string;
    JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // 验证认证
    const user = await authenticate(request, env.JWT_SECRET);
    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        // 从环境变量获取配置 (JSON 字符串)
        const configsStr = env.R2_CONFIGS;

        const headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        };

        if (!configsStr) {
            return new Response(JSON.stringify([]), { headers });
        }

        // 验证是否为有效的 JSON
        try {
            JSON.parse(configsStr);
            return new Response(configsStr, { headers });
        } catch (e) {
            console.error("Invalid R2_CONFIGS environment variable:", e);
            return errorResponse('Invalid R2_CONFIGS configuration', 500);
        }
    } catch (e: any) {
        return errorResponse(e.message, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    return errorResponse('Configuration is read-only (managed via environment variables)', 403);
};
