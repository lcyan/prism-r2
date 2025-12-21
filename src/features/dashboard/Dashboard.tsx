import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Grid, List, Copy, Download, Trash2, Folder, File as FileIcon, Check, Eye, RotateCw, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
}

type CopyFormat = 'url' | 'html' | 'markdown' | 'bbcode';

const ACTIVE_COLORS = {
    url: 'from-[#86EFAC] to-[#4ADE80] shadow-[0_4px_12px_rgba(74,222,128,0.3)] border-white/20',
    html: 'from-[#FDE047] to-[#FACC15] shadow-[0_4px_12px_rgba(250,204,21,0.3)] border-white/20',
    markdown: 'from-[#93C5FD] to-[#60A5FA] shadow-[0_4px_12px_rgba(96,165,250,0.3)] border-white/20',
    bbcode: 'from-[#FDA4AF] to-[#FB7185] shadow-[0_4px_12px_rgba(251,113,133,0.3)] border-white/20'
};

const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext || '');
};

interface FileCardProps {
    file: R2File;
    activeFormat: CopyFormat;
    currentUrl: string;
    isSelected: boolean;
    onToggleSelect: (key: string) => void;
    onDelete: (key: string) => void;
    onPreview: (file: R2File) => void;
    onCopy: (url: string, format: CopyFormat) => void;
    onFormatChange: (format: CopyFormat) => void;
    getFormattedLink: (url: string, format: CopyFormat) => string;
}

const FileCard = React.memo(({
    file,
    activeFormat,
    currentUrl,
    isSelected,
    onToggleSelect,
    onDelete,
    onPreview,
    onCopy,
    onFormatChange,
    getFormattedLink
}: FileCardProps) => {
    return (
        <div className="group flex flex-col animate-slide-up">
            {/* Card Body */}
            <div className="w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-5 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] border border-white/20 dark:border-white/5 flex flex-col gap-5 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 relative">
                {/* Thumbnail Container */}
                <div className="w-full aspect-video rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden ring-1 ring-black/5 shadow-inner">
                    {isImage(file.name) ? (
                        <img src={currentUrl} alt={file.name} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-700" onClick={() => onPreview(file)} loading="lazy" decoding="async" />
                    ) : (
                        <FileIcon size={48} className="text-amber-500/80" />
                    )}

                    {/* Overlays */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(file.key); }}
                        className={`absolute top-4 left-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all z-10 ${isSelected ? 'bg-primary text-white shadow-lg scale-110' : 'bg-black/40 text-transparent opacity-0 group-hover:opacity-100 border border-white/20'}`}
                    >
                        <Check size={16} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(file.key); }}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Info Section */}
                <div className="space-y-1 px-1">
                    <h4 className="text-[15px] font-black text-gray-900 dark:text-white truncate" title={file.key}>{file.name}</h4>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {file.lastModified ? format(new Date(file.lastModified), 'yyyy.MM.dd') : '-'}
                        </p>
                        <span className="text-[10px] font-black text-primary/60">{formatSize(file.size)}</span>
                    </div>
                </div>

                {/* Code Input Box - Click to Copy */}
                <div className="relative">
                    <input
                        readOnly
                        value={getFormattedLink(currentUrl, activeFormat)}
                        className="w-full bg-gray-100/50 dark:bg-white/5 border border-transparent rounded-xl py-3 px-4 text-[10px] font-bold text-gray-500 outline-none truncate cursor-pointer hover:bg-white dark:hover:bg-zinc-800 hover:border-primary/30 transition-all shadow-inner"
                        onClick={(e) => {
                            (e.target as HTMLInputElement).select();
                            onCopy(currentUrl, activeFormat);
                        }}
                    />
                </div>

                {/* Actions Row - Multi-Color Jelly Style */}
                <div className="relative flex items-center justify-between w-full p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-gray-200/30 dark:border-white/5 overflow-hidden">
                    {/* Animated Background Pill */}
                    <motion.div
                        className={`absolute top-1 bottom-1 left-1 w-[calc(25%-2px)] bg-gradient-to-br ${ACTIVE_COLORS[activeFormat]} rounded-xl border -z-0`}
                        initial={false}
                        animate={{
                            x: (['url', 'html', 'markdown', 'bbcode'].indexOf(activeFormat)) * 100 + '%',
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />

                    {(['url', 'html', 'markdown', 'bbcode'] as const).map((fmt) => {
                        return (
                            <button
                                key={fmt}
                                onClick={() => onFormatChange(fmt)}
                                className={`relative flex-1 flex items-center justify-center py-2.5 text-[10px] font-black transition-colors duration-300 z-10 ${activeFormat === fmt ? 'text-white' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title={fmt.toUpperCase()}
                            >
                                <span className="relative z-10 flex items-center justify-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                                    {fmt === 'url' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="14" height="14" className="fill-current"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6c-31.5-31.5-31.5-82.5 0-114L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" /></svg>
                                    )}
                                    {fmt === 'html' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="14" height="14" className="fill-current"><path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z" /></svg>
                                    )}
                                    {fmt === 'markdown' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="14" height="14" className="fill-current"><path d="M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5v104.6h61.5L473.8 363.7z" /></svg>
                                    )}
                                    {fmt === 'bbcode' && <span className="text-[11px] font-black tracking-tighter font-sans">[BB]</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

interface FileRowProps {
    file: R2File;
    isSelected: boolean;
    onToggleSelect: (key: string) => void;
    onDelete: (key: string) => void;
    onPreview: (file: R2File) => void;
    onDownload: (file: R2File) => void;
    onCopy: (url: string, format: CopyFormat) => void;
    publicUrl: string;
}

const FileRow = React.memo(({
    file,
    isSelected,
    onToggleSelect,
    onDelete,
    onPreview,
    onDownload,
    onCopy,
    publicUrl
}: FileRowProps) => {
    const dirPath = file.key.split('/').slice(0, -1).join('/');
    return (
        <div className="group relative bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/5 rounded-[2rem] p-5 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 flex-shrink-0">
                        <button onClick={() => onToggleSelect(file.key)} className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-primary text-white border-none shadow-md' : 'bg-gray-100 dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 text-transparent group-hover:border-primary/50'}`}><Check size={14} /></button>
                    </div>
                    <div className="flex items-center gap-5 flex-1">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-primary/20 transition-all shadow-inner border border-white/20" onClick={() => onPreview(file)}>{isImage(file.name) ? (<img src={publicUrl} alt={file.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />) : (<FileIcon size={32} className="text-amber-500" />)}</div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <h4 className="text-[15px] font-black text-gray-900 dark:text-white truncate max-w-[400px]" title={file.key}>{file.key}</h4>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-gray-400 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    {formatSize(file.size)}
                                </span>
                                {dirPath && <span className="text-[9px] font-black px-2.5 py-1 bg-primary/10 text-primary rounded-lg uppercase tracking-tighter border border-primary/10">{dirPath}</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onPreview(file)} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"><Eye size={18} /></button>
                    <button onClick={() => onDownload(file)} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"><Download size={18} /></button>
                    <button onClick={() => onCopy(publicUrl, 'url')} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"><Copy size={18} /></button>
                    <button onClick={() => onDelete(file.key)} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><Trash2 size={18} /></button>
                </div>
            </div>
        </div>
    );
});

export const Dashboard: React.FC<DashboardProps> = ({
    files,
    directories,
    onRefresh,
    onDelete,
    onDownload,
    onCopyLink: _onCopyLink,
    publicUrlGetter,
    onBulkDelete,
    hasMore,
    onLoadMore,
    isLoadingMore
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // 当目录或搜索变化时重置页码
    useEffect(() => {
        setCurrentPage(1);
    }, [activeDirectory, searchQuery]);

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

    const getFormattedLink = useCallback((url: string, format: CopyFormat) => {
        switch (format) {
            case 'html': return `<img src="${url}" alt="image">`;
            case 'markdown': return `![image](${url})`;
            case 'bbcode': return `[img]${url}[/img]`;
            default: return url;
        }
    }, []);

    const handleCopy = useCallback((url: string, format: CopyFormat) => {
        const text = getFormattedLink(url, format);
        navigator.clipboard.writeText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    }, [getFormattedLink]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const isRoot = activeDirectory === 'ROOT';
            const dirMatch = isRoot || file.key.startsWith(activeDirectory + '/');
            const searchMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            return dirMatch && searchMatch;
        });
    }, [files, activeDirectory, searchQuery]);

    const sortedFiles = useMemo(() => {
        return [...filteredFiles].sort((a, b) => {
            if (sortBy === 'name') {
                const res = a.name.localeCompare(b.name);
                return sortOrder === 'asc' ? res : -res;
            } else {
                const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
        });
    }, [filteredFiles, sortBy, sortOrder]);

    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
    const paginatedFiles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedFiles.slice(start, start + itemsPerPage);
    }, [sortedFiles, currentPage, itemsPerPage]);

    const toggleSelect = useCallback((key: string) => {
        setSelectedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    }, []);

    const selectAll = () => {
        if (selectedKeys.length === paginatedFiles.length && paginatedFiles.length > 0) {
            setSelectedKeys([]);
        } else {
            setSelectedKeys(paginatedFiles.map(f => f.key));
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed top-24 right-10 z-[100] bg-green-500/90 backdrop-blur-md text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-3 border border-white/20 font-black text-sm"
                    >
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Check size={14} />
                        </div>
                        已成功复制到剪贴板
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white/90 dark:bg-zinc-900/90 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/20 dark:border-white/5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-10">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                            <ImageIcon className="text-white" size={24} />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">全部文件</h2>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">All Assets Library</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <div className="relative group flex-1 min-w-[200px] md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                className="w-full md:w-64 bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-2xl py-2.5 md:py-3 pl-12 pr-4 text-xs font-bold focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-inner"
                                placeholder="搜索文件..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-white/5">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-primary shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}><List size={18} /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-primary shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}><Grid size={18} /></button>
                        </div>
                        <button 
                            onClick={() => {
                                onRefresh();
                                setSelectedKeys([]);
                            }} 
                            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all active:scale-90 shadow-sm"
                        >
                            <RotateCw size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 md:space-y-8 mb-8 md:mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">目录节点 / Directories</h3>
                            <div className="hidden xs:block h-px w-8 md:w-12 bg-gray-200 dark:bg-white/10" />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'date')} className="flex-1 sm:flex-none bg-gray-100/50 dark:bg-white/5 text-[10px] font-black text-gray-500 dark:text-gray-400 focus:outline-none cursor-pointer hover:text-primary border border-transparent hover:border-primary/20 rounded-xl px-2.5 md:px-3 py-1.5 transition-all">
                                <option value="date">按创建时间</option>
                                <option value="name">按文件名</option>
                            </select>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className="flex-1 sm:flex-none bg-gray-100/50 dark:bg-white/5 text-[10px] font-black text-gray-500 dark:text-gray-400 focus:outline-none cursor-pointer hover:text-primary border border-transparent hover:border-primary/20 rounded-xl px-2.5 md:px-3 py-1.5 transition-all">
                                <option value="desc">降序排列</option>
                                <option value="asc">升序排列</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                        <button 
                            onClick={() => setActiveDirectory('ROOT')} 
                            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl border transition-all duration-300 text-[10px] md:text-[11px] font-black flex items-center gap-2 flex-shrink-0 ${activeDirectory === 'ROOT' ? 'bg-primary text-white border-transparent shadow-lg shadow-primary/25 scale-105' : 'bg-white/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:border-primary/30 hover:text-primary'}`}
                        >
                            <Folder size={14} /> 全部显示
                        </button>
                        {directories.map(dir => (
                            <button 
                                key={dir} 
                                onClick={() => setActiveDirectory(dir)} 
                                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl whitespace-nowrap text-[10px] md:text-[11px] font-black transition-all duration-300 flex items-center gap-2 group flex-shrink-0 border ${activeDirectory === dir ? 'bg-primary text-white border-transparent shadow-lg shadow-primary/25 scale-105' : 'bg-white/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:border-primary/30 hover:text-primary'}`}
                            >
                                <Folder size={14} className={activeDirectory === dir ? 'text-white' : 'text-primary/40 group-hover:text-primary'} />
                                {dir}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6 md:mb-8 px-4 md:px-6 py-3 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl md:rounded-[1.5rem] border border-gray-100 dark:border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4 md:gap-5">
                        <button 
                            onClick={selectAll} 
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 ${selectedKeys.length === filteredFiles.length && filteredFiles.length > 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-white/10 text-transparent'}`}
                        >
                            <Check className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[10px] md:text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-widest">选中全部项目</span>
                            <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Total {paginatedFiles.length} items in current page</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            {paginatedFiles.map(file => (
                                <FileRow
                                    key={file.key}
                                    file={file}
                                    isSelected={selectedKeys.includes(file.key)}
                                    onToggleSelect={toggleSelect}
                                    onDelete={onDelete}
                                    onPreview={setPreviewFile}
                                    onDownload={onDownload}
                                    onCopy={handleCopy}
                                    publicUrl={publicUrlGetter(file.key)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                            {paginatedFiles.map(file => (
                                <FileCard
                                    key={file.key}
                                    file={file}
                                    activeFormat={globalFormat}
                                    currentUrl={publicUrlGetter(file.key)}
                                    isSelected={selectedKeys.includes(file.key)}
                                    onToggleSelect={toggleSelect}
                                    onDelete={onDelete}
                                    onPreview={setPreviewFile}
                                    onCopy={handleCopy}
                                    onFormatChange={setGlobalFormat}
                                    getFormattedLink={getFormattedLink}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination UI */}
                <div className="mt-8 md:mt-12 flex flex-col items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                            <ChevronLeft className="w-4.5 h-4.5 md:w-5 md:h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = currentPage;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else {
                                    if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl text-xs md:text-sm font-black transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-110' : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                            <ChevronRight className="w-4.5 h-4.5 md:w-5 md:h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages || 1} — Total {sortedFiles.length} Files
                        </p>
                        {hasMore && (
                            <button
                                onClick={onLoadMore}
                                disabled={isLoadingMore}
                                className="mt-2 px-6 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                            >
                                {isLoadingMore ? '正在加载更多...' : '从 R2 加载更多数据'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedKeys.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0, x: '-50%' }} 
                        animate={{ y: 0, opacity: 1, x: '-50%' }} 
                        exit={{ y: 100, opacity: 0, x: '-50%' }} 
                        className="fixed bottom-10 left-1/2 z-[60] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-ios px-10 py-6 rounded-[3rem] flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/30 dark:border-white/10"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/30 animate-pulse">
                                {selectedKeys.length}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">项已选中</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Selected Items</p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-200 dark:bg-white/10" />
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={async () => {
                                    await onBulkDelete(selectedKeys);
                                    setSelectedKeys([]);
                                }} 
                                className="px-8 py-3.5 bg-red-500 text-white rounded-[1.5rem] flex items-center gap-3 font-black shadow-xl shadow-red-500/25 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Trash2 size={20} /> 批量删除
                            </button>
                            <button 
                                onClick={() => setSelectedKeys([])} 
                                className="px-8 py-3.5 bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-[1.5rem] font-black hover:bg-white dark:hover:bg-white/10 border border-gray-100 dark:border-white/10 transition-all"
                            >
                                取消选项
                            </button>
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
