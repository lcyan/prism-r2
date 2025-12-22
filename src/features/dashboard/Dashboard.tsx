import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Grid as GridIcon, List, Copy, Download, Trash2, Folder, File as FileIcon, Check, Eye, RotateCw, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { 
    Box, 
    Flex, 
    HStack, 
    VStack, 
    Text, 
    Heading, 
    IconButton, 
    Input, 
    Button, 
    Center, 
    SimpleGrid, 
    Badge,
    Portal,
    Image,
    Separator,
    Container
} from '@chakra-ui/react';
import type { R2File } from '../../types';
import { formatSize } from '../../types';
import { format } from 'date-fns';
import { FilePreview } from './FilePreview';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface DashboardProps {
    files: R2File[];
    directories: string[];
    onRefresh: () => void;
    onDelete: (key: string) => void;
    onDownload: (file: R2File) => void;
    onCopyLink: (file: R2File) => void;
    publicUrlGetter: (key: string) => string;
    onBulkDelete: (keys: string[]) => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
}

type CopyFormat = 'url' | 'html' | 'markdown' | 'bbcode';

const ACTIVE_COLORS: Record<CopyFormat, string> = {
    url: 'blue',
    html: 'yellow',
    markdown: 'green',
    bbcode: 'pink'
};

const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext || '');
};

interface FileCardProps {
    file: R2File;
    activeFormat: CopyFormat;
    currentUrl: string;
    isSelected: boolean;
    onToggleSelect: (key: string) => void;
    onDelete: (key: string) => void;
    onPreview: (file: R2File) => void;
    onCopy: (url: string, format: CopyFormat) => void;
    onFormatChange: (format: CopyFormat) => void;
    getFormattedLink: (url: string, format: CopyFormat) => string;
}

const FileCard = React.memo(({
    file,
    activeFormat,
    currentUrl,
    isSelected,
    onToggleSelect,
    onDelete,
    onPreview,
    onCopy,
    onFormatChange,
    getFormattedLink
}: FileCardProps) => {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Box
                bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
                backdropFilter="blur(20px)"
                borderRadius="3xl"
                p={5}
                shadow="sm"
                borderWidth="1px"
                borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                transition="all 0.3s"
                _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
                position="relative"
                overflow="hidden"
            >
                {/* Thumbnail Container */}
                <Box
                    aspectRatio={16 / 9}
                    borderRadius="2xl"
                    bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                    backdropFilter="blur(10px)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    overflow="hidden"
                    mb={4}
                >
                    {isImage(file.name) ? (
                        <Image
                            src={currentUrl}
                            alt={file.name}
                            w="full"
                            h="full"
                            objectFit="cover"
                            cursor="pointer"
                            transition="transform 0.5s"
                            _hover={{ transform: 'scale(1.1)' }}
                            onClick={() => onPreview(file)}
                            loading="lazy"
                        />
                    ) : (
                        <FileIcon size={48} style={{ opacity: 0.6 }} />
                    )}

                    {/* Overlays */}
                    <IconButton
                        aria-label="Select file"
                        position="absolute"
                        top={3}
                        left={3}
                        size="sm"
                        rounded="xl"
                        variant={isSelected ? 'solid' : 'ghost'}
                        colorPalette={isSelected ? 'blue' : 'blackAlpha'}
                        bg={isSelected ? 'blue.500' : 'blackAlpha.400'}
                        color="white"
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(file.key); }}
                        _hover={{ bg: isSelected ? 'blue.600' : 'blackAlpha.600' }}
                    >
                        <Check size={16} />
                    </IconButton>

                    <IconButton
                        aria-label="Delete file"
                        position="absolute"
                        top={3}
                        right={3}
                        size="sm"
                        rounded="full"
                        colorPalette="red"
                        bg="red.500"
                        color="white"
                        onClick={(e) => { e.stopPropagation(); onDelete(file.key); }}
                        _hover={{ bg: 'red.600', transform: 'scale(1.1)' }}
                    >
                        <Trash2 size={16} />
                    </IconButton>
                </Box>

                {/* Info Section */}
                <VStack align="stretch" gap={1} mb={4} px={1}>
                    <Text fontWeight="bold" fontSize="md" truncate title={file.key}>
                        {file.name}
                    </Text>
                    <Flex justify="space-between" align="center">
                        <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="wider">
                            {file.lastModified ? format(new Date(file.lastModified), 'yyyy.MM.dd') : '-'}
                        </Text>
                        <Badge variant="subtle" colorPalette="blue" fontSize="2xs" fontWeight="bold">
                            {formatSize(file.size)}
                        </Badge>
                    </Flex>
                </VStack>

                {/* Code Input Box */}
                <Box mb={4}>
                    <Input
                        readOnly
                        value={getFormattedLink(currentUrl, activeFormat)}
                        size="sm"
                        fontSize="2xs"
                        fontWeight="bold"
                        borderRadius="xl"
                        bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                        backdropFilter="blur(10px)"
                        border="none"
                        _hover={{ bg: { base: 'whiteAlpha.800', _dark: 'whiteAlpha.100' } }}
                        cursor="pointer"
                        onClick={(e) => {
                            (e.target as HTMLInputElement).select();
                            onCopy(currentUrl, activeFormat);
                        }}
                    />
                </Box>

                {/* Actions Row */}
                <HStack
                    bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                    backdropFilter="blur(10px)"
                    p={1}
                    borderRadius="2xl"
                    gap={1}
                    position="relative"
                >
                    {(['url', 'html', 'markdown', 'bbcode'] as const).map((fmt) => (
                        <Button
                            key={fmt}
                            flex={1}
                            size="xs"
                            variant={activeFormat === fmt ? 'solid' : 'ghost'}
                            colorPalette={ACTIVE_COLORS[fmt]}
                            onClick={() => onFormatChange(fmt)}
                            fontSize="2xs"
                            fontWeight="bold"
                            borderRadius="xl"
                            h="8"
                        >
                            {fmt.toUpperCase()}
                        </Button>
                    ))}
                </HStack>
            </Box>
        </MotionBox>
    );
});

interface FileRowProps {
    file: R2File;
    isSelected: boolean;
    onToggleSelect: (key: string) => void;
    onDelete: (key: string) => void;
    onPreview: (file: R2File) => void;
    onDownload: (file: R2File) => void;
    onCopy: (url: string, format: CopyFormat) => void;
    publicUrl: string;
}

const FileRow = React.memo(({
    file,
    isSelected,
    onToggleSelect,
    onDelete,
    onPreview,
    onDownload,
    onCopy,
    publicUrl
}: FileRowProps) => {
    const dirPath = file.key.split('/').slice(0, -1).join('/');
    return (
        <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
        >
            <Box
                bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
                backdropFilter="blur(20px)"
                borderRadius="2xl"
                p={4}
                borderWidth="1px"
                borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                _hover={{ shadow: 'md', bg: { base: 'whiteAlpha.800', _dark: 'whiteAlpha.100' } }}
                transition="all 0.2s"
            >
                <Flex align="center" gap={4}>
                    <IconButton
                        aria-label="Select"
                        size="xs"
                        rounded="lg"
                        variant={isSelected ? 'solid' : 'outline'}
                        colorPalette="blue"
                        onClick={() => onToggleSelect(file.key)}
                    >
                        <Check size={12} />
                    </IconButton>

                    <Box
                        w="12"
                        h="12"
                        borderRadius="lg"
                        bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                        backdropFilter="blur(10px)"
                        overflow="hidden"
                        flexShrink={0}
                        cursor="pointer"
                        onClick={() => onPreview(file)}
                    >
                        {isImage(file.name) ? (
                            <Image src={publicUrl} alt={file.name} w="full" h="full" objectFit="cover" />
                        ) : (
                            <Center h="full"><FileIcon size={20} /></Center>
                        )}
                    </Box>

                    <VStack align="stretch" gap={0} flex={1} minW={0}>
                        <Text fontWeight="bold" fontSize="sm" truncate title={file.key}>
                            {file.key}
                        </Text>
                        <HStack gap={2}>
                            <Text fontSize="xs" color="fg.muted">{formatSize(file.size)}</Text>
                            {dirPath && (
                                <Badge size="xs" variant="outline" colorPalette="blue">
                                    {dirPath}
                                </Badge>
                            )}
                        </HStack>
                    </VStack>

                    <HStack gap={1}>
                        <IconButton aria-label="Preview" size="sm" variant="ghost" onClick={() => onPreview(file)}><Eye size={16} /></IconButton>
                        <IconButton aria-label="Download" size="sm" variant="ghost" onClick={() => onDownload(file)}><Download size={16} /></IconButton>
                        <IconButton aria-label="Copy" size="sm" variant="ghost" onClick={() => onCopy(publicUrl, 'url')}><Copy size={16} /></IconButton>
                        <IconButton aria-label="Delete" size="sm" variant="ghost" colorPalette="red" onClick={() => onDelete(file.key)}><Trash2 size={16} /></IconButton>
                    </HStack>
                </Flex>
            </Box>
        </MotionBox>
    );
});

export const Dashboard = React.memo(({
    files,
    directories,
    onRefresh,
    onDelete,
    onDownload,
    onCopyLink: _onCopyLink,
    publicUrlGetter,
    onBulkDelete,
    hasMore,
    onLoadMore,
    isLoadingMore
}: DashboardProps) => {
    const [activeDirectory, setActiveDirectory] = useState('ROOT');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [previewFile, setPreviewFile] = useState<R2File | null>(null);
    const [globalFormat, setGlobalFormat] = useState<CopyFormat>('url');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        if (selectedKeys.length > 0) {
            setSelectedKeys(prev => prev.filter(key => files.some(f => f.key === key)));
        }
    }, [files]);

    useEffect(() => {
        if (activeDirectory !== 'ROOT' && !directories.includes(activeDirectory)) {
            setActiveDirectory('ROOT');
            setCurrentPage(1);
        }
    }, [directories, activeDirectory]);

    const handleDirectoryChange = useCallback((dir: string) => {
        setActiveDirectory(dir);
        setCurrentPage(1);
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const getFormattedLink = useCallback((url: string, format: CopyFormat) => {
        switch (format) {
            case 'html': return `<img src="${url}" alt="image">`;
            case 'markdown': return `![image](${url})`;
            case 'bbcode': return `[img]${url}[/img]`;
            default: return url;
        }
    }, []);

    const handleCopy = useCallback((url: string, format: CopyFormat) => {
        const text = getFormattedLink(url, format);
        navigator.clipboard.writeText(text);
    }, [getFormattedLink]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const isRoot = activeDirectory === 'ROOT';
            const dirMatch = isRoot || file.key.startsWith(activeDirectory + '/');
            const searchMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            return dirMatch && searchMatch;
        });
    }, [files, activeDirectory, searchQuery]);

    const sortedFiles = useMemo(() => {
        return [...filteredFiles].sort((a, b) => {
            if (sortBy === 'name') {
                const res = a.name.localeCompare(b.name);
                return sortOrder === 'asc' ? res : -res;
            } else {
                const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
        });
    }, [filteredFiles, sortBy, sortOrder]);

    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
    const paginatedFiles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedFiles.slice(start, start + itemsPerPage);
    }, [sortedFiles, currentPage, itemsPerPage]);

    const toggleSelect = useCallback((key: string) => {
        setSelectedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    }, []);

    const selectAll = () => {
        if (selectedKeys.length === paginatedFiles.length && paginatedFiles.length > 0) {
            setSelectedKeys([]);
        } else {
            setSelectedKeys(paginatedFiles.map(f => f.key));
        }
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                {/* Header Card */}
                <Box
                    bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
                    backdropFilter="blur(20px)"
                    borderRadius="3xl"
                    p={{ base: 6, md: 8 }}
                    shadow="sm"
                    borderWidth="1px"
                    borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                >
                    <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} gap={6}>
                        <HStack gap={5}>
                            <Center
                                w={{ base: 12, md: 14 }}
                                h={{ base: 12, md: 14 }}
                                borderRadius="2xl"
                                bgGradient="to-br"
                                gradientFrom="blue.500"
                                gradientTo="blue.700"
                                shadow="lg"
                                color="white"
                            >
                                <Database size={24} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Heading size="xl" fontWeight="bold" letterSpacing="tight">全部文件</Heading>
                                <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                    All Assets Library
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack gap={4} flexWrap="wrap">
                            <Box position="relative" flex={{ base: 1, md: 'none' }} minW="200px">
                                <Center position="absolute" left={4} top="50%" transform="translateY(-50%)" color="fg.muted" zIndex={1}>
                                    <Search size={16} />
                                </Center>
                                <Input
                                    pl={12}
                                    bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                                    backdropFilter="blur(10px)"
                                    border="none"
                                    borderRadius="2xl"
                                    placeholder="搜索文件..."
                                    value={searchQuery}
                                    onChange={e => handleSearchChange(e.target.value)}
                                    _focus={{ bg: { base: 'whiteAlpha.800', _dark: 'whiteAlpha.100' }, shadow: 'outline' }}
                                />
                            </Box>
                            
                            <HStack bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }} backdropFilter="blur(10px)" p={1} borderRadius="2xl" gap={1}>
                                <IconButton
                                    aria-label="List view"
                                    size="sm"
                                    variant={viewMode === 'list' ? 'solid' : 'ghost'}
                                    onClick={() => setViewMode('list')}
                                    borderRadius="xl"
                                >
                                    <List size={18} />
                                </IconButton>
                                <IconButton
                                    aria-label="Grid view"
                                    size="sm"
                                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                                    onClick={() => setViewMode('grid')}
                                    borderRadius="xl"
                                >
                                    <GridIcon size={18} />
                                </IconButton>
                            </HStack>

                            <IconButton
                                aria-label="Refresh"
                                variant="outline"
                                borderRadius="2xl"
                                onClick={() => { onRefresh(); setSelectedKeys([]); }}
                            >
                                <RotateCw size={18} />
                            </IconButton>
                        </HStack>
                    </Flex>

                    <Separator my={8} />

                    {/* Directory & Sort Controls */}
                    <VStack align="stretch" gap={6}>
                        <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap={4}>
                            <HStack gap={4}>
                                <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                    目录节点 / Directories
                                </Text>
                                <Box h="1px" w="12" bg="border.subtle" display={{ base: 'none', sm: 'block' }} />
                            </HStack>
                            
                            <HStack gap={3}>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                                    style={{ 
                                        background: 'var(--chakra-colors-bg-muted)',
                                        fontSize: 'var(--chakra-fontSizes-2xs)',
                                        fontWeight: 'var(--chakra-fontWeights-bold)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--chakra-radii-xl)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="date">按创建时间</option>
                                    <option value="name">按文件名</option>
                                </select>
                                <IconButton
                                    aria-label="Sort order"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                >
                                    <Text fontSize="xs" fontWeight="bold">{sortOrder === 'asc' ? 'ASC' : 'DESC'}</Text>
                                </IconButton>
                            </HStack>
                        </Flex>

                        <Flex gap={3} flexWrap="wrap">
                            <Button
                                size="sm"
                                variant={activeDirectory === 'ROOT' ? 'solid' : 'outline'}
                                colorPalette="blue"
                                borderRadius="xl"
                                onClick={() => handleDirectoryChange('ROOT')}
                            >
                                <Folder size={14} style={{ marginRight: '8px' }} /> 全部
                            </Button>
                            {useMemo(() => directories.map(dir => (
                                <Button
                                    key={dir}
                                    size="sm"
                                    variant={activeDirectory === dir ? 'solid' : 'outline'}
                                    colorPalette="blue"
                                    borderRadius="xl"
                                    onClick={() => handleDirectoryChange(dir)}
                                >
                                    <Folder size={14} style={{ marginRight: '8px' }} /> {dir}
                                </Button>
                            )), [directories, activeDirectory, handleDirectoryChange])}
                        </Flex>
                    </VStack>
                </Box>

                {/* Selection Toolbar */}
                <AnimatePresence>
                    {selectedKeys.length > 0 && (
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <HStack
                                bg="blue.500"
                                color="white"
                                p={4}
                                borderRadius="2xl"
                                justify="space-between"
                                shadow="lg"
                            >
                                <HStack gap={4}>
                                    <Text fontWeight="bold" fontSize="sm">已选择 {selectedKeys.length} 个文件</Text>
                                    <Button size="xs" variant="subtle" onClick={selectAll}>
                                        {selectedKeys.length === paginatedFiles.length ? '取消全选' : '全选本页'}
                                    </Button>
                                </HStack>
                                <HStack gap={2}>
                                    <Button
                                        size="sm"
                                        colorPalette="red"
                                        bg="white"
                                        color="red.500"
                                        _hover={{ bg: 'red.50' }}
                                        onClick={() => {
                                            if (confirm(`确定要删除选中的 ${selectedKeys.length} 个文件吗？`)) {
                                                onBulkDelete(selectedKeys);
                                                setSelectedKeys([]);
                                            }
                                        }}
                                    >
                                        <Trash2 size={16} style={{ marginRight: '8px' }} /> 批量删除
                                    </Button>
                                    <IconButton
                                        aria-label="Close"
                                        variant="ghost"
                                        color="white"
                                        onClick={() => setSelectedKeys([])}
                                    >
                                        <Check size={18} />
                                    </IconButton>
                                </HStack>
                            </HStack>
                        </MotionBox>
                    )}
                </AnimatePresence>

                {/* Files Grid/List */}
                {paginatedFiles.length > 0 ? (
                    viewMode === 'grid' ? (
                        <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={8}>
                            {paginatedFiles.map(file => (
                                <FileCard
                                    key={file.key}
                                    file={file}
                                    activeFormat={globalFormat}
                                    currentUrl={publicUrlGetter(file.key)}
                                    isSelected={selectedKeys.includes(file.key)}
                                    onToggleSelect={toggleSelect}
                                    onDelete={onDelete}
                                    onPreview={setPreviewFile}
                                    onCopy={handleCopy}
                                    onFormatChange={setGlobalFormat}
                                    getFormattedLink={getFormattedLink}
                                />
                            ))}
                        </SimpleGrid>
                    ) : (
                        <VStack gap={4} align="stretch">
                            {paginatedFiles.map(file => (
                                <FileRow
                                    key={file.key}
                                    file={file}
                                    isSelected={selectedKeys.includes(file.key)}
                                    onToggleSelect={toggleSelect}
                                    onDelete={onDelete}
                                    onPreview={setPreviewFile}
                                    onDownload={onDownload}
                                    onCopy={handleCopy}
                                    publicUrl={publicUrlGetter(file.key)}
                                />
                            ))}
                        </VStack>
                    )
                ) : (
                    <Center py={20} bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }} backdropFilter="blur(10px)" borderRadius="3xl" borderWidth="1px" borderStyle="dashed" borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}>
                        <VStack gap={4}>
                            <Box p={6} borderRadius="full" bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }} backdropFilter="blur(10px)">
                                <FileIcon size={48} style={{ opacity: 0.2 }} />
                            </Box>
                            <Text fontWeight="bold" color="fg.muted">暂无文件</Text>
                        </VStack>
                    </Center>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Flex justify="center" align="center" gap={4} pt={8}>
                        <IconButton
                            aria-label="Previous page"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            variant="outline"
                            borderRadius="xl"
                        >
                            <ChevronLeft size={20} />
                        </IconButton>
                        <HStack gap={2}>
                            {useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    size="sm"
                                    variant={currentPage === page ? 'solid' : 'ghost'}
                                    colorPalette="blue"
                                    onClick={() => setCurrentPage(page)}
                                    borderRadius="lg"
                                    minW="10"
                                >
                                    {page}
                                </Button>
                            )), [totalPages, currentPage])}
                        </HStack>
                        <IconButton
                            aria-label="Next page"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            variant="outline"
                            borderRadius="xl"
                        >
                            <ChevronRight size={20} />
                        </IconButton>
                    </Flex>
                )}

                {hasMore && (
                    <Center pt={8}>
                        <Button
                            onClick={onLoadMore}
                            loading={isLoadingMore}
                            variant="ghost"
                            colorPalette="blue"
                            size="lg"
                            borderRadius="2xl"
                        >
                            加载更多
                        </Button>
                    </Center>
                )}
            </VStack>

            {/* Preview Modal */}
            <Portal>
                <AnimatePresence>
                    {previewFile && (
                        <FilePreview
                            file={previewFile}
                            isOpen={!!previewFile}
                            onClose={() => setPreviewFile(null)}
                            onDownload={() => onDownload(previewFile)}
                            onCopyLink={() => _onCopyLink(previewFile)}
                            publicUrl={publicUrlGetter(previewFile.key)}
                        />
                    )}
                </AnimatePresence>
            </Portal>
        </Container>
    );
});
