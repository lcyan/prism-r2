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

      const directories = (result.CommonPrefixes || []).map(cp => cp.Prefix?.replace(/\/$/, '') || '').filter(Boolean);

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
