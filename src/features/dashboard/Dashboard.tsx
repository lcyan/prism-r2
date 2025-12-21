import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid, List, Copy, Download, Trash2, Folder, File as FileIcon, Check, Eye, RotateCw, ImageIcon } from 'lucide-react';
import type { R2File } from '../../types';
import { formatSize } from '../../types';
import { format } from 'date-fns';
import { FilePreview } from './FilePreview';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
    files: R2File[];
    directories: string[];
    onRefresh: () => void;
    onDelete: (key: string) => void;
    onDownload: (file: R2File) => void;
    onCopyLink: (file: R2File) => void;
    publicUrlGetter: (key: string) => string;
    onBulkDelete: (keys: string[]) => void;
}

type CopyFormat = 'url' | 'html' | 'markdown' | 'bbcode';

const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext || '');
};

export const Dashboard: React.FC<DashboardProps> = ({
    files,
    directories,
    onRefresh,
    onDelete,
    onDownload,
    onCopyLink: _onCopyLink,
    publicUrlGetter,
    onBulkDelete
}) => {
    const [activeDirectory, setActiveDirectory] = useState('ROOT');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [previewFile, setPreviewFile] = useState<R2File | null>(null);
    const [globalFormat, setGlobalFormat] = useState<CopyFormat>('url');
    const [showToast, setShowToast] = useState(false);

    // 当文件列表变化时，自动清除已不存在的选中项
    useEffect(() => {
        if (selectedKeys.length > 0) {
            setSelectedKeys(prev => prev.filter(key => files.some(f => f.key === key)));
        }
    }, [files]);

    // 当目录结构变化时，如果当前目录已不存在，则返回根目录
    useEffect(() => {
        if (activeDirectory !== 'ROOT' && !directories.includes(activeDirectory)) {
            setActiveDirectory('ROOT');
        }
    }, [directories, activeDirectory]);

    const getFormattedLink = (url: string, format: CopyFormat) => {
        switch (format) {
            case 'html': return `<img src="${url}" alt="image">`;
            case 'markdown': return `![image](${url})`;
            case 'bbcode': return `[img]${url}[/img]`;
            default: return url;
        }
    };

    const handleCopy = (url: string, format: CopyFormat) => {
        const text = getFormattedLink(url, format);
        navigator.clipboard.writeText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const filteredFiles = files.filter(file => {
        const isRoot = activeDirectory === 'ROOT';
        const dirMatch = isRoot || file.key.startsWith(activeDirectory + '/');
        const searchMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return dirMatch && searchMatch;
    });

    const sortedFiles = useMemo(() => {
        return [...filteredFiles].sort((a, b) => {
            if (sortBy === 'name') {
                const res = a.name.localeCompare(b.name);
                return sortOrder === 'asc' ? res : -res;
            } else {
                const dateA = a.lastModified?.getTime() || 0;
                const dateB = b.lastModified?.getTime() || 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
        });
    }, [filteredFiles, sortBy, sortOrder]);

    const toggleSelect = (key: string) => {
        setSelectedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const selectAll = () => {
        if (selectedKeys.length === filteredFiles.length && filteredFiles.length > 0) {
            setSelectedKeys([]);
        } else {
            setSelectedKeys(filteredFiles.map(f => f.key));
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed top-24 right-10 z-[100] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-green-400 font-black text-sm"
                    >
                        <Check size={18} />
                        已成功复制到剪贴板
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-black/5 dark:border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100">全部文件</h2>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <ImageIcon className="text-blue-500" size={24} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                placeholder="搜索文件..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-gray-400'}`}><List size={18} /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-gray-400'}`}><Grid size={18} /></button>
                        </div>
                        <button 
                            onClick={() => {
                                onRefresh();
                                setSelectedKeys([]);
                            }} 
                            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-primary transition-all active:rotate-180 duration-500"
                        >
                            <RotateCw size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[13px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">目录节点</h3>
                            <div className="flex items-center gap-2">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'date')} className="bg-transparent text-[11px] font-black text-gray-500 focus:outline-none cursor-pointer hover:text-primary border border-gray-100 dark:border-white/5 rounded-lg px-2 py-1"><option value="date">按创建时间</option><option value="name">按文件名</option></select>
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className="bg-transparent text-[11px] font-black text-gray-500 focus:outline-none cursor-pointer hover:text-primary border border-gray-100 dark:border-white/5 rounded-lg px-2 py-1"><option value="desc">降序</option><option value="asc">升序</option></select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                        <button onClick={() => setActiveDirectory('ROOT')} className={`px-4 py-2 rounded-xl border transition-all text-[11px] font-black flex items-center gap-2 ${activeDirectory === 'ROOT' ? 'bg-primary text-white border-primary border-none shadow-lg' : 'bg-white dark:bg-zinc-900 border-gray-100 text-gray-400 hover:border-primary/30'}`}>
                            <Folder size={12} /> 全部显示
                        </button>
                        {directories.map(dir => (
                            <button key={dir} onClick={() => setActiveDirectory(dir)} className={`px-4 py-2 rounded-xl whitespace-nowrap text-[11px] font-black transition-all flex items-center gap-2 group flex-shrink-0 border ${activeDirectory === dir ? 'bg-primary text-white border-none shadow-lg' : 'bg-white dark:bg-zinc-900 border-gray-100 text-gray-500 hover:border-primary/30'}`}>
                                <Folder size={12} />
                                {dir}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6 px-4 py-1.5 bg-gray-50 dark:bg-white/2 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <button onClick={selectAll} className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${selectedKeys.length === filteredFiles.length && filteredFiles.length > 0 ? 'bg-primary text-white border-none' : 'bg-white dark:bg-zinc-800 border-[1.5px] border-gray-200 dark:border-white/10 text-transparent'}`}><Check size={12} /></button>
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">选中全部 {filteredFiles.length} 项</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-black">1</button>
                    </div>
                </div>

                <div className="space-y-6">
                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            {sortedFiles.map(file => {
                                const dirPath = file.key.split('/').slice(0, -1).join('/');
                                return (
                                    <div key={file.key} className="group relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="mt-1 flex-shrink-0">
                                                    <button onClick={() => toggleSelect(file.key)} className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${selectedKeys.includes(file.key) ? 'bg-primary text-white border-none' : 'bg-gray-50 dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 text-transparent group-hover:border-primary/50'}`}><Check size={12} /></button>
                                                </div>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shadow-inner" onClick={() => setPreviewFile(file)}>{isImage(file.name) ? (<img src={publicUrlGetter(file.key)} alt={file.name} className="w-full h-full object-cover" loading="lazy" />) : (<FileIcon size={24} className="text-amber-500" />)}</div>
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <h4 className="text-[14px] font-black text-gray-800 dark:text-gray-100 truncate max-w-[400px]" title={file.key}>{file.key}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-gray-400">大小: {formatSize(file.size)}</span>
                                                            {dirPath && <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-500 rounded uppercase tracking-tighter">{dirPath}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setPreviewFile(file)} className="p-2.5 rounded-xl text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-all"><Eye size={18} /></button>
                                                <button onClick={() => onDownload(file)} className="p-2.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><Download size={18} /></button>
                                                <button onClick={() => handleCopy(publicUrlGetter(file.key), 'url')} className="p-2.5 rounded-xl text-gray-400 hover:text-primary hover:bg-blue-50 transition-all"><Copy size={18} /></button>
                                                <button onClick={() => onDelete(file.key)} className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
                            {sortedFiles.map(file => {
                                const currentUrl = publicUrlGetter(file.key);
                                const activeFormat = globalFormat;
                                return (
                                    <div key={file.key} className="group flex flex-col animate-slide-up">
                                        {/* Card Body */}
                                        <div className="w-full bg-white dark:bg-zinc-900 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-4 group-hover:shadow-2xl group-hover:-translate-y-1 transition-all relative">
                                            {/* Thumbnail Container */}
                                            <div className="w-full aspect-video rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden ring-1 ring-black/5">
                                                {isImage(file.name) ? (
                                                    <img src={currentUrl} alt={file.name} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" onClick={() => setPreviewFile(file)} />
                                                ) : (
                                                    <FileIcon size={40} className="text-amber-500" />
                                                )}

                                                {/* Overlays */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.key); }}
                                                    className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all z-10 ${selectedKeys.includes(file.key) ? 'bg-primary text-white shadow-lg' : 'bg-black/20 backdrop-blur-md text-transparent opacity-0 group-hover:opacity-100 border border-white/20'}`}
                                                >
                                                    <Check size={14} />
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(file.key); }}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-400/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all shadow-lg"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Info Section */}
                                            <div className="space-y-0.5 px-0.5">
                                                <h4 className="text-[14px] font-bold text-gray-700 dark:text-gray-200 truncate" title={file.key}>{file.name}</h4>
                                                <p className="text-[11px] font-medium text-gray-400">
                                                    {file.lastModified ? format(file.lastModified, 'yyyy/MM/dd') : '-'}
                                                </p>
                                            </div>

                                            {/* Code Input Box - Click to Copy */}
                                            <div className="relative">
                                                <input
                                                    readOnly
                                                    value={getFormattedLink(currentUrl, activeFormat)}
                                                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-[10px] font-medium text-gray-500 outline-none truncate cursor-pointer hover:border-[#4DFF88] focus:border-[#4DFF88] transition-all"
                                                    onClick={(e) => {
                                                        (e.target as HTMLInputElement).select();
                                                        handleCopy(currentUrl, activeFormat);
                                                    }}
                                                />
                                            </div>

                                            {/* Actions Row - Multi-Color Jelly Style */}
                                            <div className="relative flex items-center justify-between w-full px-1 py-1">
                                                {(['url', 'html', 'markdown', 'bbcode'] as const).map((fmt) => {
                                                    const activeColors = {
                                                        url: 'from-[#86EFAC] to-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.4)] border-green-200/30',
                                                        html: 'from-[#FDE047] to-[#FACC15] shadow-[0_0_15px_rgba(250,204,21,0.4)] border-yellow-200/30',
                                                        markdown: 'from-[#93C5FD] to-[#60A5FA] shadow-[0_0_15px_rgba(96,165,250,0.4)] border-blue-200/30',
                                                        bbcode: 'from-[#FDA4AF] to-[#FB7185] shadow-[0_0_15px_rgba(251,113,133,0.4)] border-rose-200/30'
                                                    };

                                                    return (
                                                        <button
                                                            key={fmt}
                                                            onClick={() => setGlobalFormat(fmt)}
                                                            className={`relative flex-1 flex items-center justify-center py-2 text-sm font-medium transition-colors duration-200 z-10 ${activeFormat === fmt ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                            title={fmt.toUpperCase()}
                                                        >
                                                            {activeFormat === fmt && (
                                                                <motion.div
                                                                    layoutId={`pill-${file.key}`}
                                                                    className={`absolute inset-0 bg-gradient-to-br ${activeColors[fmt]} rounded-xl border -z-10`}
                                                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                                                />
                                                            )}
                                                            <span className="relative z-10 flex items-center justify-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                                                                {fmt === 'url' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16" className="fill-current"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6c-31.5-31.5-31.5-82.5 0-114L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" /></svg>
                                                                )}
                                                                {fmt === 'html' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16" className="fill-current"><path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z" /></svg>
                                                                )}
                                                                {fmt === 'markdown' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16" className="fill-current"><path d="M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5v104.6h61.5L473.8 363.7z" /></svg>
                                                                )}
                                                                {fmt === 'bbcode' && <span className="text-[12px] font-black tracking-tighter font-sans">[BB]</span>}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedKeys.length > 0 && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-white dark:bg-zinc-900 px-8 py-5 rounded-[2.5rem] flex items-center gap-10 shadow-3xl border border-black/5">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black">{selectedKeys.length}</div><p className="text-sm font-black text-gray-700 dark:text-gray-200">项已选中</p></div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={async () => {
                                    await onBulkDelete(selectedKeys);
                                    setSelectedKeys([]);
                                }} 
                                className="px-6 py-2.5 bg-red-500 text-white rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"
                            >
                                <Trash2 size={18} /> 批量删除
                            </button>
                            <button onClick={() => setSelectedKeys([])} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">取消选项</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <FilePreview
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                publicUrl={previewFile ? publicUrlGetter(previewFile.key) : ''}
                onDownload={() => previewFile && onDownload(previewFile)}
                onCopyLink={() => {
                    if (previewFile) {
                        handleCopy(publicUrlGetter(previewFile.key), 'url');
                    }
                }}
            />
        </div>
    );
};
