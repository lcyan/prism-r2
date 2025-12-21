interface Env {
  APP_URL?: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, next, env }) => {
  const url = new URL(request.url);
  
  // 如果设置了 APP_URL 且当前访问的是 .pages.dev 域名
  if (env.APP_URL && url.hostname.endsWith('.pages.dev')) {
    const targetUrl = new URL(env.APP_URL);
    
    // 构造重定向目标 URL，保留路径和查询参数
    const redirectUrl = new URL(url.pathname + url.search, targetUrl.origin);
    
    return Response.redirect(redirectUrl.toString(), 301);
  }

  // 否则继续处理请求
  return next();
};
