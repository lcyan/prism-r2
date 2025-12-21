import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Check, Cloud, RotateCw, Zap, Folder, X, LayoutGrid, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadTask {
    file: File;
    progress: number;
    speed: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    processedName?: string;
}

interface UploadCardProps {
    directories: string[];
    onUpload: (file: File, subPath: string, onProgress: (p: number, s: number) => void) => Promise<any>;
    onUploadComplete?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ directories, onUpload, onUploadComplete }) => {
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [subPath, setSubPath] = useState('');
    const [useWebP, setUseWebP] = useState(true);
    const [webpQuality, _setWebpQuality] = useState(0.8);
    const [showDirSelector, setShowDirSelector] = useState(false);
    const [newDirName, setNewDirName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = async (file: File): Promise<File> => {
        if (!useWebP || !file.type.startsWith('image/') || file.type === 'image/webp') {
            return file;
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(file);

                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) return resolve(file);
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            const newFile = new File([blob], newFileName, { type: 'image/webp' });
                            resolve(newFile);
                        },
                        'image/webp',
                        webpQuality
                    );
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;

        const fileList = Array.from(files);
        const newTasks: UploadTask[] = fileList.map(file => ({
            file,
            progress: 0,
            speed: 0,
            status: 'pending' as const
        }));

        setTasks(prev => [...prev, ...newTasks]);

        for (const task of newTasks) {
            uploadTask(task);
        }
    };

    const uploadTask = async (task: UploadTask) => {
        try {
            setTasks(prev => prev.map(t => t.file === task.file ? { ...t, status: 'uploading' as const } : t));

            // Apply compression if it's an image
            let fileToUpload = task.file;
            if (useWebP && task.file.type.startsWith('image/')) {
                fileToUpload = await compressImage(task.file);
                setTasks(prev => prev.map(t => t.file === task.file ? { ...t, processedName: fileToUpload.name } : t));
            }

            await onUpload(fileToUpload, subPath || 'drafts', (progress, speed) => {
                setTasks(prev => prev.map(t => t.file === task.file ? { ...t, progress, speed } : t));
            });

            setTasks(prev => prev.map(t => t.file === task.file ? { ...t, status: 'completed' as const, progress: 100 } : t));
            if (onUploadComplete) onUploadComplete();
        } catch (e) {
            setTasks(prev => prev.map(t => t.file === task.file ? { ...t, status: 'error' as const } : t));
        }
    };

    const isUploading = tasks.some(t => t.status === 'uploading');

    return (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-ios rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/20 dark:border-white/5 space-y-8">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">上传资源</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Upload Assets</p>
                    </div>
                    <div
                        onClick={() => setUseWebP(!useWebP)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer transition-all border backdrop-blur-md shadow-sm ${useWebP ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-gray-100/50 border-gray-200/50 text-gray-400'}`}
                        title="开启后，图片将自动无损压缩转为 WebP 格式上传"
                    >
                        <Zap size={12} className={useWebP ? 'fill-current' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-wider">WebP</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">目标目录</label>
                    <div className="relative group">
                        <input
                            className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-[1.5rem] py-4 px-6 text-xs font-bold focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 shadow-inner"
                            placeholder="留空则默认上传到 drafts 目录"
                            value={subPath}
                            onChange={e => setSubPath(e.target.value)}
                        />
                        <div 
                            onClick={() => setShowDirSelector(!showDirSelector)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-primary cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                            <LayoutGrid size={20} />
                        </div>

                        <AnimatePresence>
                            {showDirSelector && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/5 z-[60] overflow-hidden"
                                >
                                    <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">选择目录</span>
                                        <button onClick={() => setShowDirSelector(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600"><X size={14} /></button>
                                    </div>
                                    
                                    <div className="p-5 space-y-4">
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="输入新目录名称"
                                                value={newDirName}
                                                onChange={e => setNewDirName(e.target.value)}
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (newDirName) {
                                                        setSubPath(newDirName);
                                                        setNewDirName('');
                                                        setShowDirSelector(false);
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </div>

                                        <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
                                            <button 
                                                onClick={() => { setSubPath(''); setShowDirSelector(false); }}
                                                className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3"
                                            >
                                                <Folder size={14} /> 根目录 (/)
                                            </button>
                                            {directories.map(dir => (
                                                <button 
                                                    key={dir}
                                                    onClick={() => { setSubPath(dir); setShowDirSelector(false); }}
                                                    className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3"
                                                >
                                                    <Folder size={14} /> {dir}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 transition-all duration-500 cursor-pointer group overflow-hidden ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-white/10 hover:border-primary/50 bg-gray-50/30 dark:bg-white/[0.02]'
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                <div className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-zinc-800 shadow-2xl flex flex-col items-center justify-center gap-1 text-primary group-hover:scale-110 transition-transform duration-500 relative z-10">
                    {isUploading ? (
                        <RotateCw className="animate-spin" size={32} />
                    ) : (
                        <>
                            <Cloud size={32} className="fill-current opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Drop</span>
                        </>
                    )}
                </div>
                <div className="text-center space-y-2 relative z-10">
                    <p className="text-base font-black text-gray-800 dark:text-white">拖拽图片到这里</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Drag & Drop Assets</p>
                </div>
            </div>

            <button
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden shadow-xl active:scale-[0.98] ${isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white shadow-primary/25 hover:shadow-primary/40'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                {isUploading ? <RotateCw className="animate-spin" size={20} /> : <UploadIcon size={20} />}
                <span className="relative z-10">{isUploading ? '正在处理并上传...' : '开始上传'}</span>
            </button>

            {tasks.length > 0 && (
                <div className="mt-4 space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                    {tasks.slice(-3).map((task, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                                    {task.processedName || task.file.name}
                                </span>
                                {task.status === 'completed' ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <Check size={12} />
                                    </div>
                                ) : task.status === 'error' ? (
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                                        <X size={12} />
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black text-primary">{task.progress}%</span>
                                )}
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${task.status === 'error' ? 'bg-red-500' : 'bg-primary'}`} 
                                    style={{ width: `${task.progress}%` }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RotateCwIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <path d="M21 3v9h-9" />
    </svg>
);
