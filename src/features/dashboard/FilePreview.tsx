import React from 'react';
import { X, Copy, Download, ExternalLink, FileText, Image as ImageIcon, Video, Music, Info, Globe, Calendar, HardDrive, Check } from 'lucide-react';
import type { R2File } from '../../types';
import { formatSize } from '../../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface FilePreviewProps {
    file: R2File | null;
    isOpen: boolean;
    onClose: () => void;
    publicUrl: string;
    onDownload: () => void;
    onCopyLink: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
    file,
    isOpen,
    onClose,
    publicUrl,
    onDownload,
    onCopyLink
}) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        onCopyLink();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!file) return null;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension || '');
    const isAudio = ['mp3', 'wav', 'ogg', 'aac'].includes(extension || '');
    const isPdf = extension === 'pdf';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="ios-glass w-full max-w-5xl h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row relative shadow-4xl border-none"
                    >
                        {/* Left side: Preview Area */}
                        <div className="flex-1 bg-gray-100/50 dark:bg-zinc-950/30 flex items-center justify-center relative overflow-hidden group">
                            {isImage ? (
                                <img
                                    src={publicUrl}
                                    alt={file.name}
                                    className="max-w-[95%] max-h-[95%] object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : isVideo ? (
                                <video controls className="max-w-[95%] max-h-[95%] rounded-xl shadow-2xl">
                                    <source src={publicUrl} />
                                    Your browser does not support the video tag.
                                </video>
                            ) : isAudio ? (
                                <audio controls className="w-[80%]">
                                    <source src={publicUrl} />
                                    Your browser does not support the audio tag.
                                </audio>
                            ) : isPdf ? (
                                <iframe src={publicUrl} className="w-full h-full border-none" title={file.name} />
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-zinc-800 flex items-center justify-center shadow-xl">
                                        <FileText size={64} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">暂不支持预览该格式</p>
                                    <button onClick={() => window.open(publicUrl, '_blank')} className="btn-ios-glass flex items-center gap-2">
                                        <ExternalLink size={18} />
                                        在新窗口打开
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-lg active:scale-90 sm:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Right side: Sidebar Info */}
                        <div className="w-full sm:w-80 h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-l border-white/20 flex flex-col">
                            {/* Header */}
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Info size={20} className="text-primary" />
                                    </div>
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">文件属性</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="hidden sm:flex w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 items-center justify-center text-gray-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                                {/* File Identity */}
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                                        {isImage ? <ImageIcon className="text-blue-500" /> : isVideo ? <Video className="text-purple-500" /> : isAudio ? <Music className="text-pink-500" /> : <FileText className="text-orange-500" />}
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white break-all leading-tight">
                                        {file.name}
                                    </h4>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg w-fit text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        {extension || 'FILE'} FORMAT
                                    </div>
                                </div>

                                {/* Detail List */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                            <HardDrive size={10} /> 文件容量
                                        </p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatSize(file.size)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                            <Calendar size={10} /> 修改日期
                                        </p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            {file.lastModified ? format(file.lastModified, 'yyyy-MM-dd HH:mm:ss') : '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                            <Globe size={10} /> 公开链接
                                        </p>
                                        <div
                                            className={`p-3 rounded-xl border flex items-center gap-3 group cursor-pointer transition-all ${isCopied ? 'bg-green-50 border-green-200' : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/5'}`}
                                            onClick={handleCopy}
                                        >
                                            <p className={`text-[10px] font-bold truncate flex-1 ${isCopied ? 'text-green-600' : 'text-gray-400'}`}>{publicUrl}</p>
                                            {isCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-300 group-hover:text-primary transition-colors" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 space-y-3">
                                <button
                                    onClick={onDownload}
                                    className="w-full btn-ios-primary flex items-center justify-center gap-2 h-14 rounded-2xl font-black transition-all"
                                >
                                    <Download size={18} />
                                    立即下载
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className={`w-full flex items-center justify-center gap-2 h-14 rounded-2xl font-black transition-all border ${isCopied ? 'bg-green-500 text-white border-transparent shadow-lg shadow-green-500/30' : 'btn-ios-glass hover:bg-gray-50'}`}
                                >
                                    {isCopied ? (
                                        <>
                                            <Check size={18} />
                                            已成功复制
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            复制外链
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
