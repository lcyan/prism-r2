import { authenticate } from '../lib/auth-middleware';
import { errorResponse } from '../lib/response';

interface Env {
    R2_CONFIGS?: string;
    JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // 验证认证
    if (!env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured in environment variables");
        return errorResponse('Server configuration error: JWT_SECRET missing', 500);
    }

    const user = await authenticate(request, env.JWT_SECRET);
    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        // 从环境变量获取配置 (JSON 字符串)
        let configsStr = env.R2_CONFIGS;

        const headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        };

        if (!configsStr) {
            console.warn("R2_CONFIGS environment variable is empty or not set");
            return new Response(JSON.stringify([]), { headers });
        }

        // 处理可能的引号转义或前后空格
        configsStr = configsStr.trim();
        if (configsStr.startsWith('"') && configsStr.endsWith('"')) {
            try {
                configsStr = JSON.parse(configsStr);
            } catch (e) {
                // 如果解析失败，保持原样
            }
        }

        // 验证是否为有效的 JSON
        try {
            JSON.parse(configsStr);
            return new Response(configsStr, { headers });
        } catch (e) {
            console.error("Invalid R2_CONFIGS environment variable format:", e);
            return errorResponse('Invalid R2_CONFIGS configuration format', 500);
        }
    } catch (e: any) {
        return errorResponse(e.message, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    return errorResponse('Configuration is read-only (managed via environment variables)', 403);
};
