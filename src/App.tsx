import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { useR2 } from './hooks/useR2';
import { ConfigPage } from './features/config/ConfigPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { UploadCard } from './features/upload/UploadCard';
import { BucketOverview } from './features/dashboard/BucketOverview';
import { LoginPage } from './features/auth/LoginPage';
import { WelcomeGuide } from './components/WelcomeGuide';
import { r2Manager } from './lib/r2Client';
import type { R2File } from './types';

function App() {
  const {
    configs,
    activeConfigId,
    saveConfig,
    deleteConfig,
    switchConfig,
    importConfigs,
  } = useR2();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'config'>(activeConfigId ? 'files' : 'config');
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check auth session via API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            // 保存用户信息到 localStorage 用于显示
            try {
              localStorage.setItem('r2_user', JSON.stringify(data.user));
            } catch (storageError) {
              console.warn('Failed to save user to localStorage:', storageError);
            }
          } else {
            setIsAuthenticated(false);
            try {
              localStorage.removeItem('r2_user');
            } catch (storageError) {
              console.warn('Failed to remove user from localStorage:', storageError);
            }
          }
        } else {
          setIsAuthenticated(false);
          try {
            localStorage.removeItem('r2_user');
          } catch (storageError) {
            console.warn('Failed to remove user from localStorage:', storageError);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        try {
          localStorage.removeItem('r2_user');
        } catch (storageError) {
          console.warn('Failed to remove user from localStorage:', storageError);
        }
      }
    };

    checkAuth();

    const initConfigs = async () => {
      // Try to load from Cloud (Environment Variables) first
      try {
        const cloudConfigs = await r2Manager.syncFromCloud();
        if (Array.isArray(cloudConfigs) && cloudConfigs.length > 0) {
          importConfigs(cloudConfigs);
          return;
        }
      } catch (e) {
        console.warn("Failed to sync from Cloud on init", e);
      }

      // If KV failed or empty, check if we need to show guide based on local state
      // Note: configs from useR2 are already loaded from localStorage inside the hook
      // But we can't easily check 'configs.length' here immediately if it updates async
      // For now, let's just rely on the existing logic or the KV sync.

      try {
        const skipGuide = localStorage.getItem('r2_skip_guide');
        if (!skipGuide && configs.length === 0) {
          setShowWelcome(true);
        }
      } catch (storageError) {
        console.warn('Failed to check skip guide from localStorage:', storageError);
      }
    };

    initConfigs();
  }, []);

  useEffect(() => {
    if (activeConfigId && isAuthenticated) {
      loadFiles();
      setActiveTab('files');
    } else if (configs.length > 0) {
      setActiveTab('config');
    }
  }, [activeConfigId, configs.length, isAuthenticated]);

  const loadFiles = async () => {
    if (!activeConfigId || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await r2Manager.listFiles("", true);
      const mappedFiles: R2File[] = [
        ...(response.Contents || [])
          .map(c => ({
            name: c.Key?.split('/').pop() || '',
            key: c.Key || '',
            size: c.Size || 0,
            lastModified: c.LastModified,
            type: 'file' as const
          }))
      ];
      setFiles(mappedFiles);
    } catch (e: any) {
      console.error(e);
      setError(e.message || '获取文件列表失败，请检查 R2 配置或 CORS 设置');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, path: string, onProgress: (p: number, s: number) => void) => {
    return await r2Manager.uploadFile(file, path, onProgress);
  };

  const handleDelete = async (key: string) => {
    if (window.confirm('确定要删除这个文件吗？')) {
      setLoading(true);
      try {
        await r2Manager.deleteFile(key);
        await loadFiles();
      } catch (e: any) {
        setError(e.message || '删除失败');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async (keys: string[]) => {
    if (window.confirm(`确定要批量删除选中的 ${keys.length} 个文件吗？`)) {
      setLoading(true);
      try {
        await Promise.all(keys.map(key => r2Manager.deleteFile(key)));
        await loadFiles();
      } catch (e: any) {
        setError(e.message || '批量删除失败');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyLink = (file: R2File) => {
    const url = r2Manager.getPublicUrl(file.key);
    navigator.clipboard.writeText(url);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      try {
        localStorage.removeItem('r2_user');
      } catch (storageError) {
        console.warn('Failed to remove user from localStorage:', storageError);
      }
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleStartConfig = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem('r2_skip_guide', 'true');
    } catch (storageError) {
      console.warn('Failed to save skip guide to localStorage:', storageError);
    }
    setActiveTab('config');
  };

  if (isAuthenticated === null) return null; // Avoid flicker
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const activeConfig = configs.find(c => c.id === activeConfigId);
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const connectionStatus = loading ? 'checking' : (error ? 'offline' : (activeConfigId ? 'online' : 'offline'));

  return (
    <>
      <WelcomeGuide isVisible={showWelcome} onStart={handleStartConfig} />

      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => loadFiles()}
        onLogout={handleLogout}
        connectionStatus={connectionStatus}
      >
        {loading && (
          <div className="fixed inset-0 bg-gray-200/20 backdrop-blur-md z-[70] flex items-center justify-center">
            <div className="bg-white/80 dark:bg-zinc-900 shadow-3xl p-10 rounded-[2.5rem] flex flex-col items-center gap-6 border border-black/5 animate-slide-up">
              <div className="w-16 h-16 border-[5px] border-primary/10 border-t-primary rounded-full animate-spin" />
              <p className="font-black text-primary tracking-widest text-sm uppercase">正在同步 R2 数据...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pull-down flex flex-col gap-2 relative z-10 mx-auto max-w-4xl">
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <span>状态异常:</span>
              <span className="text-sm font-black">{error}</span>
            </div>
          </div>
        )}

        {activeTab === 'config' ? (
          <div className="max-w-4xl mx-auto">
            <ConfigPage
              configs={configs}
              activeConfigId={activeConfigId}
              onSave={saveConfig}
              onDelete={deleteConfig}
              onSwitch={switchConfig}
              onImport={importConfigs}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-slide-up">
            <div className="lg:col-span-3">
              <Dashboard
                files={files}
                onRefresh={() => loadFiles()}
                onDelete={handleDelete}
                onDownload={(f) => window.open(r2Manager.getPublicUrl(f.key), '_blank')}
                onCopyLink={handleCopyLink}
                publicUrlGetter={(key) => r2Manager.getPublicUrl(key)}
                onBulkDelete={handleBulkDelete}
              />
            </div>
            <div className="space-y-8 h-full sticky top-24">
              <UploadCard
                onUpload={handleUpload}
                onUploadComplete={() => loadFiles()}
              />
              <BucketOverview
                bucketName={activeConfig?.name || '未选择'}
                customDomain={activeConfig?.customDomain}
                fileCount={files.length}
                totalSize={totalSize}
                onRefresh={() => loadFiles()}
                status={connectionStatus}
              />
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}

export default App;
