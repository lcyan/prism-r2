import React from 'react';
import { Box, VStack, Text, Progress, HStack, IconButton } from '@chakra-ui/react';
import { Database, HardDrive, RotateCw, Cloud } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { formatSize } from '../types';

interface SidebarStatsProps {
    fileCount: number;
    totalSize: number;
    bucketName: string;
    onRefresh?: () => void;
    onUpload?: (file: File) => void;
}

export const SidebarStats: React.FC<SidebarStatsProps> = ({ 
    fileCount, 
    totalSize, 
    bucketName,
    onRefresh,
    onUpload
}) => {
    // const { t } = useTranslation();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpload) {
            onUpload(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <Box 
            bg="bg.subtle" 
            borderRadius="xl" 
            p={4} 
            borderWidth="1px" 
            borderColor="border.DEFAULT"
        >
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                    <HStack gap={2}>
                        <Cloud size={14} className="text-brand-500" />
                        <Text fontSize="xs" fontWeight="bold" color="fg.muted" truncate maxW="120px" title={bucketName}>
                            {bucketName}
                        </Text>
                    </HStack>
                    <HStack gap={1}>
                        {onUpload && (
                            <IconButton 
                                aria-label="Upload" 
                                size="xs" 
                                variant="ghost" 
                                onClick={handleUploadClick}
                                color="fg.muted"
                                h={5} w={5} minW={5}
                                _hover={{ color: "brand.500", bg: "brand.50" }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            </IconButton>
                        )}
                        {onRefresh && (
                            <IconButton 
                                aria-label="Refresh" 
                                size="xs" 
                                variant="ghost" 
                                onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                                color="fg.muted"
                                h={5} w={5} minW={5}
                                _hover={{ color: "brand.500", bg: "brand.50" }}
                            >
                                <RotateCw size={12} />
                            </IconButton>
                        )}
                    </HStack>
                </HStack>

                <VStack align="stretch" gap={1}>
                    <HStack justify="space-between" align="flex-end">
                        <Text fontSize="xs" color="fg.muted">Used</Text>
                        <Text fontSize="sm" fontWeight="black" color="brand.600">
                            {formatSize(totalSize)}
                        </Text>
                    </HStack>
                    <Progress.Root size="xs" value={totalSize > 0 ? 100 : 0} colorPalette="brand">
                        <Progress.Track bg="bg.panel">
                            <Progress.Range />
                        </Progress.Track>
                    </Progress.Root>
                </VStack>

                <HStack gap={2} pt={1}>
                    <HStack gap={1} bg="bg.panel" px={2} py={1} borderRadius="md" flex={1}>
                        <Database size={12} className="text-purple-500" />
                        <Text fontSize="xs" fontWeight="medium">{fileCount}</Text>
                    </HStack>
                    <HStack gap={1} bg="bg.panel" px={2} py={1} borderRadius="md" flex={1}>
                        <HardDrive size={12} className="text-blue-500" />
                        <Text fontSize="xs" fontWeight="medium">Standard</Text>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    );
};
