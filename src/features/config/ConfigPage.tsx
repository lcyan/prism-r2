import React, { useState } from 'react';
import type { R2Config } from '../../lib/r2Client';
import { Save, Trash2, Plus, Server, Key, Database, Globe, Settings, ChevronRight, Cloud, CloudRain } from 'lucide-react';
import { r2Manager } from '../../lib/r2Client';

interface ConfigPageProps {
    configs: R2Config[];
    activeConfigId: string | null;
    onSave: (config: R2Config) => void;
    onDelete: (id: string) => void;
    onSwitch: (id: string) => void;
    onImport: (configs: R2Config[]) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ configs, activeConfigId, onSave, onDelete, onSwitch, onImport }) => {
    const [formData, setFormData] = useState<Partial<R2Config>>({});

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configs));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "r2_configs_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (Array.isArray(imported)) {
                    if (window.confirm(`确定要导入 ${imported.length} 个配置吗？现有配置将被覆盖。`)) {
                        onImport(imported);
                    }
                } else {
                    alert('无效的配置文件格式');
                }
            } catch (err) {
                alert('解析文件失败');
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
        event.target.value = '';
    };

    const handleCloudSync = async () => {
        if (!window.confirm('这将会尝试将当前配置同步到云端。注意：如果已配置环境变量，云端同步可能是只读的。确定吗？')) return;

        try {
            await r2Manager.syncToCloud(configs);
            alert('配置已成功同步！');
        } catch (e: any) {
            alert('同步失败: ' + e.message);
        }
    };

    const handleCloudRestore = async () => {
        try {
            const imported = await r2Manager.syncFromCloud();
            if (Array.isArray(imported)) {
                if (window.confirm(`发现云端配置，包含 ${imported.length} 个项目。确定要恢复并覆盖当前本地配置吗？`)) {
                    onImport(imported);
                    alert('配置恢复成功！');
                }
            } else {
                alert('云端没有有效的配置列表。');
            }
        } catch (e: any) {
            alert('恢复失败: ' + e.message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.accountId && formData.accessKeyId && formData.secretAccessKey && formData.bucketName) {
            onSave({
                id: formData.id || Date.now().toString(),
                name: (formData.name || formData.bucketName || '').trim(),
                accountId: (formData.accountId || '').trim(),
                accessKeyId: (formData.accessKeyId || '').trim(),
                secretAccessKey: (formData.secretAccessKey || '').trim(),
                bucketName: (formData.bucketName || '').trim(),
                customDomain: (formData.customDomain || '').trim(),
                endpoint: (formData.endpoint || '').trim(),
            } as R2Config);
            setFormData({});
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-slide-up pb-20">
            {/* Active Buckets Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-extrabold flex items-center gap-3 text-gray-800 dark:text-white">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Database size={22} className="text-primary" />
                        </div>
                        已连接的存储源
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5 mr-2">
                            <button
                                onClick={handleCloudSync}
                                title="同步配置到云端"
                                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md text-gray-400 hover:text-blue-500 transition-all shadow-sm"
                            >
                                <Cloud size={16} />
                            </button>
                            <button
                                onClick={handleCloudRestore}
                                title="从云端恢复配置"
                                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md text-gray-400 hover:text-blue-500 transition-all shadow-sm"
                            >
                                <CloudRain size={16} />
                            </button>
                        </div>
                        <label className="cursor-pointer px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-primary/10 rounded-lg text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                            导入
                        </label>
                        <button
                            onClick={handleExport}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-primary/10 rounded-lg text-xs font-bold text-gray-500 hover:text-primary transition-colors"
                        >
                            导出备份
                        </button>
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-l pl-3 border-gray-200 dark:border-white/10">共 {configs.length} 个项目</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map(config => (
                        <div
                            key={config.id}
                            className={`group p-6 ios-glass rounded-[2rem] relative transition-all duration-500 cursor-pointer overflow-hidden ${activeConfigId === config.id
                                ? 'ring-2 ring-primary border-transparent'
                                : 'hover:bg-white dark:hover:bg-zinc-800 hover:-translate-y-2 hover:shadow-2xl'
                                }`}
                            onClick={() => onSwitch(config.id)}
                        >
                            {activeConfigId === config.id && (
                                <div className="absolute top-0 right-0 pt-6 pr-6">
                                    <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary/30 uppercase tracking-tighter animate-pulse">
                                        DEFAULT
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col h-full space-y-4">
                                <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl w-fit group-hover:bg-primary/10 transition-colors">
                                    <Database size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </div>

                                <div>
                                    <h4 className="font-extrabold text-lg text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors truncate">{config.name}</h4>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{config.bucketName}</p>
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400">ID: {config.accountId.substring(0, 12)}...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFormData(config); }}
                                            className="p-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-primary/10 rounded-xl text-gray-400 hover:text-primary transition-all active:scale-90"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(config.id); }}
                                            className="p-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition-all active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        className="group p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-500 cursor-pointer overflow-hidden min-h-[220px]"
                        onClick={() => setFormData({})}
                    >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                            <Plus size={32} className="group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-bold text-sm tracking-tight group-hover:text-gray-800 dark:group-hover:text-white transition-colors">配置新存储桶</span>
                    </button>
                </div>
            </section>

            {/* Configuration Form Card */}
            <section className="ios-glass rounded-[2.5rem] p-10 shadow-3xl animate-slide-up delay-200">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-purple-500/10 rounded-[1.5rem]">
                        <Settings size={28} className="text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                            {formData.id ? '编辑现有配置' : '初始化新存储桶'}
                        </h3>
                        <p className="text-sm font-bold text-gray-400 mt-1">请填写 Cloudflare R2 所需的连接凭证</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">存储桶昵称</label>
                            <div className="relative group">
                                <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="例如: 工作备份"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">存储桶名称 (Bucket Name)</label>
                            <div className="relative group">
                                <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="r2-bucket-main"
                                    value={formData.bucketName || ''}
                                    onChange={e => setFormData({ ...formData, bucketName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cloudflare Account ID</label>
                            <div className="relative group">
                                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="f12e..."
                                    value={formData.accountId || ''}
                                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Endpoint (可选)</label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="https://...r2.cloudflarestorage.com"
                                    value={formData.endpoint || ''}
                                    onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Access Key ID</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="P2z..."
                                    value={formData.accessKeyId || ''}
                                    onChange={e => setFormData({ ...formData, accessKeyId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Secret Access Key</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="••••••••••••••••"
                                    value={formData.secretAccessKey || ''}
                                    onChange={e => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">自定义分发域名 (Custom Domain)</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                className="w-full bg-gray-100/50 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                placeholder="https://cdn.example.com"
                                value={formData.customDomain || ''}
                                onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full btn-ios-primary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 text-lg font-black tracking-tight"
                        >
                            <Save size={22} />
                            保存连接配置
                            <ChevronRight size={20} className="ml-1 opacity-50" />
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};
