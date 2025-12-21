import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Box } from 'lucide-react';
import { Layout } from './components/Layout';
import { useR2 } from './hooks/useR2';
import { r2Manager } from './lib/r2Client';
import type { R2File } from './types';

// Lazy load features for better initial load speed
const ConfigPage = lazy(() => import('./features/config/ConfigPage').then(m => ({ default: m.ConfigPage })));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const UploadCard = lazy(() => import('./features/upload/UploadCard').then(m => ({ default: m.UploadCard })));
const BucketOverview = lazy(() => import('./features/dashboard/BucketOverview').then(m => ({ default: m.BucketOverview })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const WelcomeGuide = lazy(() => import('./components/WelcomeGuide').then(m => ({ default: m.WelcomeGuide })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [continuationToken, setContinuationToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && configs.length === 0) {
      try {
        const skipGuide = localStorage.getItem('r2_skip_guide');
        if (!skipGuide) {
          setShowWelcome(true);
        }
      } catch (e) {
        console.warn('Failed to check skip guide status:', e);
      }
    }
  }, [isAuthenticated, configs.length]);

  const directories = useMemo(() => {
    const dirs = new Set<string>();
    files.forEach(file => {
      const parts = file.key.split('/');
      if (parts.length > 1) {
        let current = '';
        for (let i = 0; i < parts.length - 1; i++) {
          current = current ? `${current}/${parts[i]}` : parts[i];
          dirs.add(current);
        }
      }
    });
    return Array.from(dirs).sort();
  }, [files]);

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
            // 认证成功后加载配置
            initConfigs();
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
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    const initConfigs = async () => {
      // Try to load from Cloud (Environment Variables) first
      try {
        const cloudConfigs = await r2Manager.syncFromCloud();
        if (Array.isArray(cloudConfigs) && cloudConfigs.length > 0) {
          importConfigs(cloudConfigs);
        }
      } catch (e) {
        console.warn("Failed to sync from Cloud on init", e);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (activeConfigId && isAuthenticated) {
      // Try to load from cache first for instant UI
      try {
        const cached = localStorage.getItem(`r2_files_${activeConfigId}`);
        if (cached) {
          const parsedFiles = JSON.parse(cached).map((f: any) => ({
            ...f,
            lastModified: f.lastModified ? new Date(f.lastModified) : undefined
          }));
          setFiles(parsedFiles);
        }
      } catch (e) {
        console.warn("Failed to load files from cache", e);
      }
      loadFiles();
      setActiveTab('files');
    } else if (configs.length > 0) {
      setActiveTab('config');
    }
  }, [activeConfigId, configs.length, isAuthenticated]);

  const loadFiles = async (isLoadMore: boolean = false) => {
    if (!activeConfigId || !isAuthenticated) return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
      setContinuationToken(undefined);
    }
    
    setError(null);
    try {
      const response = await r2Manager.listFiles("", true, 1000, isLoadMore ? continuationToken : undefined);
      const mappedFiles: R2File[] = (response.Contents || [])
        .map(c => ({
          name: c.Key?.split('/').pop() || '',
          key: c.Key || '',
          size: c.Size || 0,
          lastModified: c.LastModified,
          type: 'file' as const
        }));
      
      const newFiles = isLoadMore ? [...files, ...mappedFiles] : mappedFiles;
      setFiles(newFiles);
      setContinuationToken(response.NextContinuationToken);

      // Update cache
      try {
        localStorage.setItem(`r2_files_${activeConfigId}`, JSON.stringify(newFiles));
      } catch (e) {
        console.warn("Failed to save files to cache", e);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || '获取文件列表失败，请检查 R2 配置或 CORS 设置');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleUpload = async (file: File, path: string, onProgress: (p: number, s: number) => void) => {
    return await r2Manager.uploadFile(file, path, onProgress);
  };

  const handleDelete = async (key: string) => {
    if (window.confirm('确定要删除这个文件吗？')) {
      setLoading(true);
      setError(null);
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
      setError(null);
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

  const publicUrlGetter = useCallback((key: string) => {
    return r2Manager.getPublicUrl(key);
  }, []);

  const handleDownload = useCallback((file: R2File) => {
    window.open(r2Manager.getPublicUrl(file.key), '_blank');
  }, []);

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
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      </Suspense>
    );
  }

  const activeConfig = configs.find(c => c.id === activeConfigId);
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const connectionStatus = loading ? 'checking' : (error ? 'offline' : (activeConfigId ? 'online' : 'offline'));

  return (
    <>
      <Suspense fallback={null}>
        <WelcomeGuide isVisible={showWelcome} onStart={handleStartConfig} />
      </Suspense>

      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => loadFiles()}
        onLogout={handleLogout}
        connectionStatus={connectionStatus}
      >
        <Suspense fallback={<PageLoader />}>
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
              {activeConfigId ? (
                <Dashboard
                  files={files}
                  directories={directories}
                  onRefresh={() => loadFiles(false)}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onCopyLink={handleCopyLink}
                  publicUrlGetter={publicUrlGetter}
                  onBulkDelete={handleBulkDelete}
                  hasMore={!!continuationToken}
                  onLoadMore={() => loadFiles(true)}
                  isLoadingMore={isLoadingMore}
                />
              ) : (
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-ios rounded-[3rem] p-16 shadow-4xl border border-white/20 dark:border-white/5 flex flex-col items-center text-center gap-8 animate-slide-up">
                  <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-ping" />
                    <Box size={48} className="relative z-10" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">欢迎使用 R2 对象存储增强管理</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-bold max-w-md mx-auto leading-relaxed">
                      您尚未配置 R2 存储桶信息，请点击上方的存储图标完成配置，开始使用强大的对象存储功能！
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('config')}
                    className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  >
                    立即配置
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-8 h-full sticky top-24">
              <UploadCard
                directories={directories}
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
        </Suspense>
      </Layout>
    </>
  );
}

export default App;
