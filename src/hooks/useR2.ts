import { useState, useEffect } from 'react';
import type { R2Config } from '../lib/r2Client';
import { r2Manager } from '../lib/r2Client';

export const useR2 = () => {
    const [configs, setConfigs] = useState<R2Config[]>([]);
    const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('r2_configs');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setConfigs(parsed);
                    const lastActive = localStorage.getItem('r2_active_id');
                    if (lastActive && parsed.some((c: R2Config) => c.id === lastActive)) {
                        setActiveConfigId(lastActive);
                        const active = parsed.find((c: R2Config) => c.id === lastActive);
                        r2Manager.init(active);
                    }
                } catch (e) {
                    console.error("Failed to parse saved configs", e);
                }
            }
        } catch (storageError) {
            console.warn("Failed to access localStorage:", storageError);
        }
    }, []);

    const saveConfig = (config: R2Config) => {
        const newConfigs = [...configs.filter(c => c.id !== config.id), config];
        setConfigs(newConfigs);
        try {
            localStorage.setItem('r2_configs', JSON.stringify(newConfigs));
        } catch (storageError) {
            console.warn("Failed to save configs to localStorage:", storageError);
        }
        if (!activeConfigId || activeConfigId === config.id) {
            setActiveConfigId(config.id);
            try {
                localStorage.setItem('r2_active_id', config.id);
            } catch (storageError) {
                console.warn("Failed to save active config ID to localStorage:", storageError);
            }
            r2Manager.init(config);
        }
    };

    const deleteConfig = (id: string) => {
        const newConfigs = configs.filter(c => c.id !== id);
        setConfigs(newConfigs);
        try {
            localStorage.setItem('r2_configs', JSON.stringify(newConfigs));
        } catch (storageError) {
            console.warn("Failed to save configs to localStorage:", storageError);
        }
        if (activeConfigId === id) {
            setActiveConfigId(null);
            try {
                localStorage.removeItem('r2_active_id');
            } catch (storageError) {
                console.warn("Failed to remove active config ID from localStorage:", storageError);
            }
        }
    };

    const switchConfig = (id: string) => {
        const config = configs.find(c => c.id === id);
        if (config) {
            setActiveConfigId(id);
            try {
                localStorage.setItem('r2_active_id', id);
            } catch (storageError) {
                console.warn("Failed to save active config ID to localStorage:", storageError);
            }
            r2Manager.init(config);
        }
    };

    const activeConfig = configs.find(c => c.id === activeConfigId) || null;

    return {
        configs,
        activeConfig,
        activeConfigId,
        currentPath,
        setCurrentPath,
        saveConfig,
        deleteConfig,
        switchConfig,
        loading,
        setLoading,
        error,
        setError,
        importConfigs: (newConfigs: R2Config[]) => {
            setConfigs(newConfigs);
            try {
                localStorage.setItem('r2_configs', JSON.stringify(newConfigs));
            } catch (storageError) {
                console.warn("Failed to save imported configs to localStorage:", storageError);
            }
            
            if (newConfigs.length > 0) {
                // 查找标记为默认的配置
                const defaultConfig = newConfigs.find(c => c.isDefault) || newConfigs[0];
                
                // 如果当前没有激活的配置，或者当前的配置不在新列表中，则切换到默认配置
                const currentExists = activeConfigId && newConfigs.some(c => c.id === activeConfigId);
                
                if (!currentExists || (newConfigs.find(c => c.id === activeConfigId)?.isDefault === false && newConfigs.some(c => c.isDefault))) {
                    // 如果当前配置不存在，或者当前配置不是默认配置但新列表中有明确指定的默认配置
                    // 我们优先尊重环境变量中指定的 isDefault
                    const targetConfig = newConfigs.find(c => c.isDefault) || defaultConfig;
                    setActiveConfigId(targetConfig.id);
                    try {
                        localStorage.setItem('r2_active_id', targetConfig.id);
                    } catch (e) {}
                    r2Manager.init(targetConfig);
                }
            }
        }
    };
};
