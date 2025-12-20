import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Globe, Check, Cloud, RotateCw, Zap } from 'lucide-react';

interface UploadTask {
    file: File;
    progress: number;
    speed: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    processedName?: string;
}

interface UploadCardProps {
    onUpload: (file: File, subPath: string, onProgress: (p: number, s: number) => void) => Promise<any>;
    onUploadComplete?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onUpload, onUploadComplete }) => {
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [subPath, setSubPath] = useState('');
    const [useWebP, setUseWebP] = useState(true);
    const [webpQuality, _setWebpQuality] = useState(0.8);
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

            await onUpload(fileToUpload, subPath, (progress, speed) => {
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
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                        上传目录 (可选)
                    </label>
                    <div
                        onClick={() => setUseWebP(!useWebP)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all border ${useWebP ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        title="开启后，图片将自动无损压缩转为 WebP 格式上传，大幅节省存储空间"
                    >
                        <Zap size={10} className={useWebP ? 'fill-current' : ''} />
                        <span className="text-[9px] font-black uppercase">WebP 压缩</span>
                    </div>
                </div>
                <div className="relative group">
                    <input
                        className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-100 dark:border-white/5 rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                        placeholder="留空则直接上传到根目录"
                        value={subPath}
                        onChange={e => setSubPath(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                        <Globe size={18} />
                    </div>
                </div>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 transition-all duration-300 cursor-pointer group ${isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-blue-100 hover:border-blue-300 bg-gray-50/30'
                    }`}
            >
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex flex-col items-center justify-center gap-1 text-blue-100 group-hover:scale-110 transition-transform">
                    {isUploading ? (
                        <RotateCw className="animate-spin text-blue-500" size={28} />
                    ) : (
                        <>
                            <Cloud size={28} className="fill-current text-blue-100" />
                            <span className="text-[10px] font-black text-blue-500">选择图片</span>
                        </>
                    )}
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[14px] font-black text-gray-700">拖拽图片到这里或</p>
                    <p className="text-xs font-bold text-gray-400">支持批量上传 & 预览</p>
                </div>
            </div>

            <button
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 ${isUploading
                    ? 'bg-white border-blue-100 text-blue-500 animate-pulse'
                    : 'bg-white border-blue-500 text-blue-500 hover:bg-blue-50 shadow-lg shadow-blue-500/10'}`}
            >
                {isUploading ? <RotateCwIcon className="animate-spin" size={18} /> : <UploadIcon size={18} />}
                {isUploading ? '正在处理并上传...' : '开始上传'}
            </button>

            {tasks.length > 0 && (
                <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                    {tasks.slice(-3).map((task, i) => (
                        <div key={i} className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-gray-500 truncate max-w-[150px]">
                                    {task.processedName || task.file.name}
                                </span>
                                {task.status === 'completed' && <Check size={12} className="text-green-500" />}
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${task.progress}%` }} />
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
