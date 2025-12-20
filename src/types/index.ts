export interface R2File {
    name: string;
    key: string;
    size: number;
    lastModified: Date | undefined;
    type: 'file' | 'folder';
    extension?: string;
}

export const getFileCategory = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return '图片';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return '视频';
    if (['mp3', 'wav', 'm4a', 'flac', 'aac'].includes(ext)) return '音频';
    if (['pdf', 'txt', 'md', 'json', 'csv'].includes(ext)) return '文档';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'Office';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '压缩包';
    if (['js', 'ts', 'html', 'css', 'py', 'go', 'java', 'c', 'cpp'].includes(ext)) return '脚本';

    return '其他';
};

export const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatSpeed = (bytesPerSec: number): string => {
    return formatSize(bytesPerSec) + '/s';
};
