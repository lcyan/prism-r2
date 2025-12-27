import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Check, Cloud, RotateCw, Zap, Folder, X, LayoutGrid, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Box,
    VStack,
    HStack,
    Flex,
    Heading,
    Text,
    Button,
    Input,
    Center,
    IconButton,
} from '@chakra-ui/react';

const MotionBox = motion.create(Box);

interface UploadTask {
    file: File;
    progress: number;
    speed: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    processedName?: string;
}

interface UploadCardProps {
    directories: string[];
    onUpload: (file: File, subPath: string, onProgress: (p: number, s: number) => void) => Promise<any>;
    onUploadComplete?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ directories, onUpload, onUploadComplete }) => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [subPath, setSubPath] = useState('');
    const [useWebP, setUseWebP] = useState(true);
    const [webpQuality, _setWebpQuality] = useState(0.8);
    const [showDirSelector, setShowDirSelector] = useState(false);
    const [newDirName, setNewDirName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = async (file: File): Promise<File> => {
        if (!useWebP || !file.type.startsWith('image/') || file.type === 'image/webp') {
            return file;
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(file);

                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) return resolve(file);
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            const newFile = new File([blob], newFileName, { type: 'image/webp' });
                            resolve(newFile);
                        },
                        'image/webp',
                        webpQuality
                    );
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;

        const fileList = Array.from(files);
        const newTasks: UploadTask[] = fileList.map(file => ({
            file,
            progress: 0,
            speed: 0,
            status: 'pending' as const
        }));

        setTasks(prev => [...prev, ...newTasks]);

        for (const task of newTasks) {
            uploadTask(task);
        }
    };

    const uploadTask = async (task: UploadTask) => {
        try {
            setTasks(prev => prev.map(t => t.file === task.file ? { ...t, status: 'uploading' as const } : t));

            // Apply compression if it's an image
            let fileToUpload = task.file;
            if (useWebP && task.file.type.startsWith('image/')) {
                fileToUpload = await compressImage(task.file);
                setTasks(prev => prev.map(t => t.file === task.file ? { ...t, processedName: fileToUpload.name } : t));
            }

            await onUpload(fileToUpload, subPath || 'drafts', (progress, speed) => {
                setTasks(prev => prev.map(t => t.file === task.file ? { ...t, progress, speed } : t));
            });

            setTasks(prev => prev.map(t => t.file === task.file ? { ...t, status: 'completed' as const, progress: 100 } : t));
            if (onUploadComplete) onUploadComplete();
        } catch (e) {
            setTasks(prev => prev.map(t => t.file === task.file ? { ...t, status: 'error' as const } : t));
        }
    };

    const isUploading = tasks.some(t => t.status === 'uploading');

    return (
        <Box
            bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            p={{ base: 4, md: 8 }}
            shadow="xl"
            borderWidth="1px"
            borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
        >
            <VStack gap={8} align="stretch">
                <VStack gap={6} align="stretch">
                    <Flex align="center" justify="space-between" px={1}>
                        <VStack align="start" gap={1}>
                            <Heading 
                                size={{ base: "lg", md: "xl" }}
                                fontWeight="black" 
                                letterSpacing="tighter"
                                bgGradient="to-br"
                                gradientFrom="blue.500"
                                gradientTo="purple.600"
                                bgClip="text"
                            >
                                {t('common.upload')}
                            </Heading>
                            <Text fontSize="2xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                Upload Assets
                            </Text>
                        </VStack>
                        <HStack
                            onClick={() => setUseWebP(!useWebP)}
                            px={4}
                            py={2}
                            borderRadius="2xl"
                            cursor="pointer"
                            transition="all 0.2s"
                            borderWidth="1px"
                            bg={useWebP ? "green.500/10" : "bg.muted"}
                            borderColor={useWebP ? "green.500/20" : "border.subtle"}
                            color={useWebP ? "green.600" : "fg.muted"}
                            _hover={{ transform: "translateY(-1px)" }}
                        >
                            <Zap size={12} fill={useWebP ? "currentColor" : "none"} />
                            <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">WebP</Text>
                        </HStack>
                    </Flex>

                    <VStack align="stretch" gap={3}>
                        <Text fontSize="2xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="widest" ml={1}>
                            目标目录
                        </Text>
                        <Box position="relative">
                            <Input
                                h={14}
                                borderRadius="2xl"
                                bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                                backdropFilter="blur(10px)"
                                borderWidth="2px"
                                borderColor="transparent"
                                fontSize="xs"
                                fontWeight="bold"
                                _focus={{
                                    bg: { base: "whiteAlpha.800", _dark: "whiteAlpha.100" },
                                    borderColor: "blue.500",
                                    boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)"
                                }}
                                placeholder="留空则默认上传到 drafts 目录"
                                value={subPath}
                                onChange={e => setSubPath(e.target.value)}
                            />
                            <Center
                                position="absolute"
                                right={3}
                                top="50%"
                                transform="translateY(-50%)"
                                w={10}
                                h={10}
                                borderRadius="xl"
                                bg={{ base: "whiteAlpha.800", _dark: "whiteAlpha.100" }}
                                backdropFilter="blur(10px)"
                                shadow="sm"
                                color="blue.500"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ transform: "translateY(-50%) scale(1.05)" }}
                                _active={{ transform: "translateY(-50%) scale(0.95)" }}
                                onClick={() => setShowDirSelector(!showDirSelector)}
                                zIndex={1}
                            >
                                <LayoutGrid size={20} />
                            </Center>

                            <AnimatePresence>
                                {showDirSelector && (
                                    <MotionBox
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        position="absolute"
                                        top="full"
                                        left={0}
                                        right={0}
                                        mt={3}
                                        bg={{ base: "whiteAlpha.900", _dark: "blackAlpha.900" }}
                                        backdropFilter="blur(30px)"
                                        borderRadius="3xl"
                                        shadow="2xl"
                                        borderWidth="1px"
                                        borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                                        zIndex={60}
                                        overflow="hidden"
                                    >
                                        <Flex p={5} borderBottomWidth="1px" borderColor="border.subtle" align="center" justify="space-between">
                                            <Text fontSize="2xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                                选择目录
                                            </Text>
                                            <IconButton
                                                size="xs"
                                                variant="ghost"
                                                borderRadius="full"
                                                onClick={() => setShowDirSelector(false)}
                                            >
                                                <X size={14} />
                                            </IconButton>
                                        </Flex>
                                        
                                        <VStack p={5} gap={4} align="stretch">
                                            <HStack gap={2}>
                                                <Input 
                                                    flex={1}
                                                    bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                                                    backdropFilter="blur(10px)"
                                                    borderRadius="xl"
                                                    fontSize="2xs"
                                                    fontWeight="bold"
                                                    placeholder="输入新目录名称"
                                                    value={newDirName}
                                                    onChange={e => setNewDirName(e.target.value)}
                                                />
                                                <IconButton
                                                    colorPalette="blue"
                                                    borderRadius="xl"
                                                    onClick={() => {
                                                        if (newDirName) {
                                                            setSubPath(newDirName);
                                                            setNewDirName('');
                                                            setShowDirSelector(false);
                                                        }
                                                    }}
                                                >
                                                    <Edit3 size={16} />
                                                </IconButton>
                                            </HStack>

                                            <VStack maxH={48} overflowY="auto" gap={1} align="stretch" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
                                                <Button 
                                                    variant="ghost"
                                                    justifyContent="start"
                                                    borderRadius="xl"
                                                    fontSize="2xs"
                                                    fontWeight="bold"
                                                    color="fg.muted"
                                                    _hover={{ bg: "blue.500/5", color: "blue.500" }}
                                                    onClick={() => { setSubPath(''); setShowDirSelector(false); }}
                                                >
                                                    <Folder size={14} style={{ marginRight: '8px' }} /> 根目录 (/)
                                                </Button>
                                                {directories.map(dir => (
                                                    <Button 
                                                        key={dir}
                                                        variant="ghost"
                                                        justifyContent="start"
                                                        borderRadius="xl"
                                                        fontSize="2xs"
                                                        fontWeight="bold"
                                                        color="fg.muted"
                                                        _hover={{ bg: "blue.500/5", color: "blue.500" }}
                                                        onClick={() => { setSubPath(dir); setShowDirSelector(false); }}
                                                    >
                                                        <Folder size={14} style={{ marginRight: '8px' }} /> {dir}
                                                    </Button>
                                                ))}
                                            </VStack>
                                        </VStack>
                                    </MotionBox>
                                )}
                            </AnimatePresence>
                        </Box>
                    </VStack>
                </VStack>

                <Box
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    position="relative"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderRadius={{ base: "3xl", md: "4xl" }}
                    p={{ base: 8, md: 12 }}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={{ base: 4, md: 6 }}
                    transition="all 0.5s"
                    cursor="pointer"
                    overflow="hidden"
                    borderColor={isDragging ? "blue.500" : "border.subtle"}
                    bg={isDragging ? "blue.500/5" : "bg.muted/30"}
                    _hover={{ borderColor: "blue.500/50" }}
                >
                    <Box
                        position="absolute"
                        inset={0}
                        bgGradient="to-br"
                        gradientFrom="blue.500/5"
                        gradientTo="transparent"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="opacity 0.2s"
                    />
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                    <Center
                        w={{ base: 20, md: 24 }}
                        h={{ base: 20, md: 24 }}
                        borderRadius={{ base: "2xl", md: "3xl" }}
                        bg={{ base: "whiteAlpha.800", _dark: "whiteAlpha.100" }}
                        backdropFilter="blur(10px)"
                        shadow="2xl"
                        flexDirection="column"
                        gap={1}
                        color="blue.500"
                        transition="transform 0.5s"
                        _hover={{ transform: "scale(1.1)" }}
                        position="relative"
                        zIndex={10}
                    >
                        {isUploading ? (
                            <MotionBox
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <RotateCw size={32} />
                            </MotionBox>
                        ) : (
                            <>
                                <Cloud size={32} fill="currentColor" style={{ opacity: 0.2 }} />
                                <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="tighter">Drop</Text>
                            </>
                        )}
                    </Center>
                    <VStack gap={{ base: 1, md: 2 }} textAlign="center" position="relative" zIndex={10}>
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">{t('dashboard.dropzone')}</Text>
                        <Text fontSize="2xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                            Drag & Drop Assets
                        </Text>
                    </VStack>
                </Box>

                <Button
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    w="full"
                    h={{ base: 14, md: 16 }}
                    borderRadius="2xl"
                    colorPalette="blue"
                    fontWeight="bold"
                    fontSize="sm"
                    shadow="xl"
                    position="relative"
                    overflow="hidden"
                    _active={{ transform: "scale(0.98)" }}
                >
                    {isUploading ? (
                        <MotionBox
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <RotateCw size={20} />
                        </MotionBox>
                    ) : <UploadIcon size={20} />}
                    <Text ml={3}>{isUploading ? t('dashboard.uploading') : t('common.upload')}</Text>
                </Button>

                {tasks.length > 0 && (
                    <VStack mt={4} gap={3} pt={6} borderTopWidth="1px" borderColor="border.subtle" align="stretch">
                        {tasks.slice(-3).map((task, i) => (
                            <VStack key={i} gap={2} p={4} bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }} backdropFilter="blur(10px)" borderRadius="2xl" borderWidth="1px" borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }} align="stretch">
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="2xs" fontWeight="bold" color="fg.muted" truncate maxW="200px">
                                        {task.processedName || task.file.name}
                                    </Text>
                                    {task.status === 'completed' ? (
                                        <Center w={5} h={5} borderRadius="full" bg="green.500" color="white">
                                            <Check size={12} />
                                        </Center>
                                    ) : task.status === 'error' ? (
                                        <Center w={5} h={5} borderRadius="full" bg="red.500" color="white">
                                            <X size={12} />
                                        </Center>
                                    ) : (
                                        <Text fontSize="2xs" fontWeight="bold" color="blue.500">{task.progress}%</Text>
                                    )}
                                </Flex>
                                <Box h={1.5} bg={{ base: "blackAlpha.100", _dark: "whiteAlpha.100" }} borderRadius="full" overflow="hidden">
                                    <Box 
                                        h="full" 
                                        transition="all 0.5s" 
                                        bg={task.status === 'error' ? "red.500" : "blue.500"}
                                        w={`${task.progress}%`}
                                    />
                                </Box>
                            </VStack>
                        ))}
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};
