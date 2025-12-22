import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { r2Manager } from '../lib/r2Client';
import type { R2File } from '../types';

export const useFiles = (activeConfigId: string | null, prefix: string = '') => {
  const queryClient = useQueryClient();

  const filesQuery = useQuery({
    queryKey: ['files', activeConfigId, prefix],
    queryFn: async () => {
      if (!activeConfigId) return { files: [], directories: [] };

      // Fetch top-level items non-recursively to get directories reliably
      const dirResult = await r2Manager.listFiles(prefix, false);
      const directories = (dirResult.CommonPrefixes || [])
        .map(cp => cp.Prefix?.replace(prefix, '').replace(/\/$/, '') || '')
        .filter(Boolean);

      // Fetch all files recursively for the dashboard view
      const filesResult = await r2Manager.listFiles(prefix, true);
      const files: R2File[] = (filesResult.Contents || []).map(item => ({
        name: item.Key?.split('/').pop() || '',
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified,
        type: 'file',
        extension: item.Key?.split('.').pop()?.toLowerCase()
      }));

      return { files, directories: directories.sort() };
    },
    enabled: !!activeConfigId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      await r2Manager.deleteFile(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      await Promise.all(keys.map(key => r2Manager.deleteFile(key)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  return {
    files: filesQuery.data?.files || [],
    directories: filesQuery.data?.directories || [],
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,
    refetch: filesQuery.refetch,
    deleteFile: deleteMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
  };
};
