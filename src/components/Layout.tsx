import React from 'react';
import { LayoutDashboard, Settings, LogOut, Box, RefreshCw, User, Bell } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'files' | 'config';
    onTabChange: (tab: 'files' | 'config') => void;
    onRefresh?: () => void;
    onLogout?: () => void;
    connectionStatus: 'online' | 'offline' | 'checking';
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onRefresh,
    onLogout,
    connectionStatus: _connectionStatus
}) => {
    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-black font-sans flex flex-col">
            {/* Top Header */}
            <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-xl p-2 shadow-sm">
                            <Box size={20} color="white" />
                        </div>
                        <h1 className="text-lg font-black tracking-tight text-gray-800 dark:text-white">Cloudflare R2 对象存储增强管理</h1>
                    </div>

                    <nav className="flex items-center gap-1 ml-4 py-1.5 px-1.5 bg-gray-100 dark:bg-white/5 rounded-xl">
                        <button
                            onClick={() => onTabChange('files')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'files' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            <LayoutDashboard size={14} />
                            数据中心
                        </button>
                        <button
                            onClick={() => onTabChange('config')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'config' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            <Settings size={14} />
                            存储配置
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {onRefresh && activeTab === 'files' && (
                        <button
                            onClick={onRefresh}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-primary transition-all active:scale-90"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}

                    <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1" />

                    <div className="flex items-center gap-3 py-1 pl-1 pr-3 rounded-full bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                            <User size={14} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-gray-400">欢迎，</span>
                                <span className="text-[11px] font-black text-primary">yanleichang</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all">
                        <Bell size={18} />
                    </button>

                    <button
                        onClick={onLogout}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                        title="退出登录"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 w-full max-w-[1700px] mx-auto p-6 md:p-8">
                {children}
            </main>
        </div>
    );
};
