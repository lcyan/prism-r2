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
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Database className="text-white" size={28} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">存储桶管理</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Bucket Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50 dark:border-white/5">
                            <button
                                onClick={handleCloudSync}
                                title="同步配置到云端"
                                className="p-2.5 hover:bg-white dark:hover:bg-zinc-800 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                            >
                                <Cloud size={18} />
                            </button>
                            <button
                                onClick={handleCloudRestore}
                                title="从云端恢复配置"
                                className="p-2.5 hover:bg-white dark:hover:bg-zinc-800 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                            >
                                <CloudRain size={18} />
                            </button>
                        </div>
                        <label className="cursor-pointer px-5 py-2.5 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl text-[11px] font-black text-gray-500 hover:text-primary transition-all shadow-sm flex items-center gap-2">
                            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                            <Plus size={14} /> 导入
                        </label>
                        <button
                            onClick={handleExport}
                            className="px-5 py-2.5 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl text-[11px] font-black text-gray-500 hover:text-primary transition-all shadow-sm"
                        >
                            导出备份
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {configs.map(config => (
                        <div
                            key={config.id}
                            className={`group p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-ios rounded-[2.5rem] relative transition-all duration-500 cursor-pointer border-2 ${activeConfigId === config.id
                                ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02]'
                                : 'border-white/20 dark:border-white/5 hover:shadow-xl hover:-translate-y-2'
                                }`}
                            onClick={() => onSwitch(config.id)}
                        >
                            {activeConfigId === config.id && (
                                <div className="absolute top-6 right-6">
                                    <div className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary/30 uppercase tracking-tighter animate-pulse">
                                        DEFAULT
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col h-full space-y-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeConfigId === config.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <Database size={28} />
                                </div>

                                <div>
                                    <h4 className="font-black text-xl text-gray-900 dark:text-white truncate">{config.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1.5">{config.bucketName}</p>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Account ID</p>
                                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300">{config.accountId.substring(0, 12)}...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFormData(config); }}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-100/50 dark:bg-white/5 hover:bg-primary/10 rounded-xl text-gray-400 hover:text-primary transition-all active:scale-90"
                                        >
                                            <Settings size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(config.id); }}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-100/50 dark:bg-white/5 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition-all active:scale-90"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        className="group p-8 bg-white/30 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 text-gray-400 hover:border-primary/50 hover:bg-white/50 dark:hover:bg-zinc-900/50 transition-all duration-500 cursor-pointer min-h-[240px]"
                        onClick={() => setFormData({})}
                    >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-500">
                            <Plus size={32} />
                        </div>
                        <div className="text-center">
                            <span className="block font-black text-sm tracking-tight text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">配置新存储桶</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Add New Bucket</span>
                        </div>
                    </button>
                </div>
            </section>

            {/* Configuration Form Card */}
            <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-ios rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-white/20 dark:border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] animate-slide-up">
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                        <Settings className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {formData.id ? '编辑现有配置' : '初始化新存储桶'}
                        </h3>
                        <p className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">R2 Connection Credentials</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">存储桶昵称 / Nickname</label>
                            <div className="relative group">
                                <Database className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                    placeholder="例如: 工作备份"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">存储桶名称 / Bucket Name</label>
                            <div className="relative group">
                                <Database className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                    placeholder="r2-bucket-main"
                                    value={formData.bucketName || ''}
                                    onChange={e => setFormData({ ...formData, bucketName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Cloudflare Account ID</label>
                            <div className="relative group">
                                <Server className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                    placeholder="f12e..."
                                    value={formData.accountId || ''}
                                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Endpoint (可选)</label>
                            <div className="relative group">
                                <Globe className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                                <input
                                    className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                    placeholder="https://...r2.cloudflarestorage.com"
                                    value={formData.endpoint || ''}
                                    onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Key ID</label>
                            <div className="relative group">
                                <Key className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                                <input
                                    required
                                    className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                    placeholder="P2z..."
                                    value={formData.accessKeyId || ''}
                                    onChange={e => setFormData({ ...formData, accessKeyId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Access Key</label>
                            <div className="relative group">
                                <Key className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                    placeholder="••••••••••••••••"
                                    value={formData.secretAccessKey || ''}
                                    onChange={e => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">自定义分发域名 / Custom Domain</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors w-4.5 h-4.5 md:w-5 md:h-5" />
                            <input
                                className="w-full bg-gray-100/50 dark:bg-white/5 border-2 border-transparent rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-14 pr-4 md:pr-6 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                                placeholder="https://cdn.example.com"
                                value={formData.customDomain || ''}
                                onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 md:pt-8">
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-4 md:py-5 rounded-xl md:rounded-[2rem] flex items-center justify-center gap-3 md:gap-4 text-base md:text-lg font-black shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.98] transition-all"
                        >
                            <Save className="w-5 h-5 md:w-6 md:h-6" />
                            保存连接配置
                            <ChevronRight className="w-5 h-5 md:w-5.5 md:h-5.5 ml-1 md:ml-2 opacity-50" />
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};
