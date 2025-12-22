import React, { useState, useEffect } from 'react';
import { Github, Zap, ShieldCheck, Globe, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
    onLogin: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        if (errorParam === 'unauthorized') {
            setError('您的账号未被授权访问此系统，请联系管理员');
            // 清除 URL 中的错误参数，避免刷新页面时一直显示
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleGithubLogin = () => {
        setIsLoading(true);
        // 重定向到后端 OAuth 登录端点
        window.location.href = '/api/auth/login';
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-black flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 shadow-3xl border border-black/5 relative overflow-hidden">
                    {/* GitHub Logo Header */}
                    <div className="flex flex-col items-center text-center space-y-6 mb-12">
                        <div className="w-20 h-20 rounded-[2rem] bg-black dark:bg-white flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                            <Github size={44} className="text-white dark:text-black" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">欢迎回来</h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">请关联您的 GitHub 账户以继续管理 R2</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-[1.5rem] flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-red-700 dark:text-red-300">登录失败</span>
                                <span className="text-[11px] font-bold text-red-600/70 dark:text-red-400/70">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 gap-4 mb-10">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                <Zap size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-gray-700 dark:text-gray-200">极速响应</span>
                                <span className="text-[11px] font-bold text-gray-400">基于 Cloudflare 全球网络</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-gray-700 dark:text-gray-200">安全合规</span>
                                <span className="text-[11px] font-bold text-gray-400">本地存储配置，不经过后端</span>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        disabled={isLoading}
                        onClick={handleGithubLogin}
                        className={`w-full group relative overflow-hidden bg-black dark:bg-white py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-black/20 ${isLoading ? 'opacity-70 pointer-events-none' : 'hover:shadow-black/40'}`}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-3 border-white/20 border-t-white dark:border-black/20 dark:border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Github size={22} className="text-white dark:text-black" />
                                <span className="text-[15px] font-black text-white dark:text-black">通过 GitHub 继续</span>
                                <ArrowRight size={18} className="text-white/40 dark:text-black/40 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="mt-8 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 leading-relaxed">
                        点击登录即表示您同意本系统的 <span className="text-primary cursor-pointer hover:underline">使用协议</span> 与 <span className="text-primary cursor-pointer hover:underline">隐私政策</span>
                    </p>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                    <div className="flex items-center gap-2">
                        <Globe size={14} />
                        <span>Powered by R2 Manager</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>v2.0.0</span>
                </div>
            </div>
        </div>
    );
};
