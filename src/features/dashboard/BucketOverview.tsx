import React from 'react';
import { Database, HardDrive, RotateCw, Activity } from 'lucide-react';

interface BucketOverviewProps {
    bucketName: string;
    customDomain?: string;
    fileCount: number;
    totalSize: number;
    onRefresh: () => void;
    status: 'online' | 'offline' | 'checking';
}

export const BucketOverview: React.FC<BucketOverviewProps> = ({
    bucketName,
    customDomain,
    fileCount,
    totalSize,
    onRefresh,
    status
}) => {
    const formatTotalSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Log(bytes) / Log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const Log = Math.log;

    return (
        <div className="bg-white/90 dark:bg-zinc-900/90 rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/20 dark:border-white/5 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        存储概览
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Storage Overview</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png" alt="Cloudflare" className="h-4 object-contain brightness-0 invert" />
                </div>
            </div>

            <div className="space-y-6">
                {/* Bucket Name Selection Style */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">当前存储桶</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-inner">
                            {bucketName}
                        </div>
                        <button 
                            onClick={onRefresh} 
                            className="group relative flex items-center justify-center w-12 h-12 bg-white dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-2xl text-primary hover:text-white transition-all duration-500 overflow-hidden shadow-sm active:scale-90"
                        >
                            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <RotateCw size={18} className="relative z-10 group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                    </div>
                </div>

                {/* Custom Domain Style */}
                <div className="relative group overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02] rounded-[2rem] p-6 border border-white/20 dark:border-white/5 transition-all hover:shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <HardDrive size={64} />
                    </div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">访问域名</label>
                    <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight break-all">{customDomain || '未设置'}</span>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-500/10 dark:bg-orange-500/20 rounded-[2rem] p-6 border border-orange-200/30 dark:border-orange-500/20 space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Database size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[22px] font-black text-orange-600 dark:text-orange-400 tracking-tighter">{fileCount}</p>
                            <p className="text-[10px] font-black text-orange-500/60 uppercase">文件总数</p>
                        </div>
                    </div>
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-[2rem] p-6 border border-blue-200/30 dark:border-primary/20 space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <HardDrive size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[22px] font-black text-primary tracking-tighter">{formatTotalSize(totalSize)}</p>
                            <p className="text-[10px] font-black text-primary/60 uppercase">已用空间</p>
                        </div>
                    </div>
                </div>

                {/* Connection Status Style */}
                <div className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-white/20 dark:border-white/5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            <Activity size={20} className={status === 'online' ? 'animate-pulse' : ''} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-black text-gray-800 dark:text-white">
                                {status === 'online' ? '连接正常' : status === 'offline' ? '连接断开' : '正在检测...'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</p>
                        </div>
                    </div>
                    <button 
                        onClick={onRefresh}
                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-white/20 transition-all active:scale-90 shadow-sm"
                    >
                        <RotateCw size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
