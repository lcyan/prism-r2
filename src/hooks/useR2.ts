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
    }, []);

    const saveConfig = (config: R2Config) => {
        const newConfigs = [...configs.filter(c => c.id !== config.id), config];
        setConfigs(newConfigs);
        localStorage.setItem('r2_configs', JSON.stringify(newConfigs));
        if (!activeConfigId || activeConfigId === config.id) {
            setActiveConfigId(config.id);
            localStorage.setItem('r2_active_id', config.id);
            r2Manager.init(config);
        }
    };

    const deleteConfig = (id: string) => {
        const newConfigs = configs.filter(c => c.id !== id);
        setConfigs(newConfigs);
        localStorage.setItem('r2_configs', JSON.stringify(newConfigs));
        if (activeConfigId === id) {
            setActiveConfigId(null);
            localStorage.removeItem('r2_active_id');
        }
    };

    const switchConfig = (id: string) => {
        const config = configs.find(c => c.id === id);
        if (config) {
            setActiveConfigId(id);
            localStorage.setItem('r2_active_id', id);
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
            localStorage.setItem('r2_configs', JSON.stringify(newConfigs));
            if (newConfigs.length > 0) {
                // Optionally switch to the first one or keep current if valid
                if (!activeConfigId || !newConfigs.find(c => c.id === activeConfigId)) {
                    // If no active config or active config no longer exists in imported list
                    // Switch to first one optionally? Or just let user choose.
                    // Let's not auto-switch to be safe, unless user was empty.
                }
            }
        }
    };
};
