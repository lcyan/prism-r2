import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { r2Manager } from '../lib/r2Client';
import type { R2File } from '../types';

export const useFiles = (prefix: string = '') => {
  const queryClient = useQueryClient();

  const filesQuery = useQuery({
    queryKey: ['files', prefix],
    queryFn: async () => {
      const result = await r2Manager.listFiles(prefix);
      
      const files: R2File[] = (result.Contents || []).map(item => ({
        name: item.Key?.split('/').pop() || '',
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified,
        type: 'file',
        extension: item.Key?.split('.').pop()?.toLowerCase()
      }));

      // Extract unique top-level directories from all file keys
      const dirSet = new Set<string>();
      (result.Contents || []).forEach(item => {
        if (item.Key && item.Key.includes('/')) {
          const parts = item.Key.split('/');
          dirSet.add(parts[0]);
        }
      });
      
      // Also include CommonPrefixes if any (for non-recursive calls)
      (result.CommonPrefixes || []).forEach(cp => {
        if (cp.Prefix) {
          dirSet.add(cp.Prefix.replace(/\/$/, ''));
        }
      });

      const directories = Array.from(dirSet).sort();

      return { files, directories };
    },
    enabled: !!r2Manager,
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
