import React from 'react';
import { Database, HardDrive } from 'lucide-react';

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
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    当前 R2对象存储配置
                </h3>
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png" alt="Cloudflare" className="h-6 object-contain opacity-80" />
            </div>

            <div className="space-y-4">
                {/* Bucket Name Selection Style */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">存储桶名称:</label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600">
                            {bucketName}
                        </div>
                        <button onClick={onRefresh} className="p-2.5 rounded-xl border border-blue-200 bg-white text-blue-500 hover:bg-blue-50 transition-all font-black text-[11px] px-4">
                            刷新
                        </button>
                    </div>
                </div>

                {/* Custom Domain Style */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-white/5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">自定义域名:</label>
                    <span className="text-[15px] font-black text-slate-700 dark:text-gray-200">{customDomain || '未设置'}</span>
                </div>

                {/* Stats Section */}
                <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl p-6 relative overflow-hidden group border border-blue-100/50">
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">存储容量:</label>
                            <button onClick={onRefresh} className="text-[10px] font-black text-blue-500 border-b border-blue-500/30 hover:border-blue-500">刷新统计</button>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-orange-500">
                                <Database size={20} />
                                <span className="text-2xl font-black">{fileCount} <small className="text-[11px] opacity-60 ml-0.5">个</small></span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-500">
                                <HardDrive size={20} />
                                <span className="text-2xl font-black">{formatTotalSize(totalSize)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connection Status Style */}
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">连接状态:</label>
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : status === 'offline' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="text-sm font-black text-slate-700 dark:text-gray-200">
                                {status === 'online' ? '正常' : status === 'offline' ? '断开' : '检测中'}
                            </span>
                        </div>
                    </div>
                    <button className="text-[11px] font-black text-gray-400 hover:text-primary transition-all uppercase tracking-widest">重新检测</button>
                </div>
            </div>
        </div>
    );
};
