import React from 'react';
import { X, Copy, Download, ExternalLink, FileText, Image as ImageIcon, Video, Music, Info, Globe, Calendar, HardDrive, Check } from 'lucide-react';
import type { R2File } from '../../types';
import { formatSize } from '../../types';
import { format } from 'date-fns';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    IconButton,
    Flex,
    Center,
    Image,
    Badge,
    Button,
    Portal,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface FilePreviewProps {
    file: R2File | null;
    isOpen: boolean;
    onClose: () => void;
    publicUrl: string;
    onDownload: () => void;
    onCopyLink: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
    file,
    isOpen,
    onClose,
    publicUrl,
    onDownload,
    onCopyLink
}) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        onCopyLink();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!file) return null;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension || '');
    const isAudio = ['mp3', 'wav', 'ogg', 'aac'].includes(extension || '');
    const isPdf = extension === 'pdf';

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <Box
                        position="fixed"
                        inset={0}
                        zIndex={1000}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        p={{ base: 4, sm: 6 }}
                    >
                        {/* Backdrop */}
                        <MotionBox
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            position="absolute"
                            inset={0}
                            bg="black/40"
                            backdropFilter="blur(8px)"
                        />

                        {/* Modal Container */}
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            w="full"
                            maxW="5xl"
                            h="85vh"
                            bg="bg.panel"
                            borderRadius="3xl"
                            overflow="hidden"
                            display="flex"
                            flexDirection={{ base: "column", sm: "row" }}
                            position="relative"
                            shadow="4xl"
                            borderWidth="1px"
                            borderColor="border.subtle"
                        >
                            {/* Left side: Preview Area */}
                            <Box
                                flex={1}
                                bg="bg.muted/30"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                position="relative"
                                overflow="hidden"
                            >
                                {isImage ? (
                                    <Image
                                        src={publicUrl}
                                        alt={file.name}
                                        maxW="95%"
                                        maxH="95%"
                                        objectFit="contain"
                                        borderRadius="xl"
                                        shadow="2xl"
                                        transition="transform 0.5s"
                                        _hover={{ transform: "scale(1.05)" }}
                                    />
                                ) : isVideo ? (
                                    <video controls style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                                        <source src={publicUrl} />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : isAudio ? (
                                    <audio controls style={{ width: '80%' }}>
                                        <source src={publicUrl} />
                                        Your browser does not support the audio tag.
                                    </audio>
                                ) : isPdf ? (
                                    <iframe src={publicUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={file.name} />
                                ) : (
                                    <VStack gap={6}>
                                        <Center
                                            w={32}
                                            h={32}
                                            borderRadius="3xl"
                                            bg="bg.panel"
                                            shadow="xl"
                                        >
                                            <FileText size={64} color="gray" />
                                        </Center>
                                        <Text color="fg.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" fontSize="sm">
                                            暂不支持预览该格式
                                        </Text>
                                        <Button
                                            variant="outline"
                                            borderRadius="2xl"
                                            onClick={() => window.open(publicUrl, '_blank')}
                                        >
                                            <ExternalLink size={18} style={{ marginRight: '8px' }} />
                                            在新窗口打开
                                        </Button>
                                    </VStack>
                                )}

                                <IconButton
                                    aria-label="Close"
                                    position="absolute"
                                    top={6}
                                    left={6}
                                    variant="subtle"
                                    borderRadius="full"
                                    display={{ base: "flex", sm: "none" }}
                                    onClick={onClose}
                                >
                                    <X size={20} />
                                </IconButton>
                            </Box>

                            {/* Right side: Sidebar Info */}
                            <Box
                                w={{ base: "full", sm: "80" }}
                                h="full"
                                bg="bg.panel"
                                borderLeftWidth={{ base: 0, sm: "1px" }}
                                borderColor="border.subtle"
                                display="flex"
                                flexDirection="column"
                            >
                                {/* Header */}
                                <Flex p={8} borderBottomWidth="1px" borderColor="border.subtle" justify="space-between" align="center">
                                    <HStack gap={3}>
                                        <Center p={2} bg="blue.500/10" borderRadius="xl">
                                            <Info size={20} color="blue" />
                                        </Center>
                                        <Heading size="sm" fontWeight="black" textTransform="uppercase" letterSpacing="tighter">
                                            文件属性
                                        </Heading>
                                    </HStack>
                                    <IconButton
                                        aria-label="Close"
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="full"
                                        display={{ base: "none", sm: "flex" }}
                                        onClick={onClose}
                                    >
                                        <X size={18} />
                                    </IconButton>
                                </Flex>

                                {/* Body */}
                                <Box flex={1} overflowY="auto" p={8} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
                                    <VStack align="stretch" gap={8}>
                                        {/* File Identity */}
                                        <VStack align="start" gap={4}>
                                            <Center w={16} h={16} borderRadius="2xl" bg="bg.muted">
                                                {isImage ? <ImageIcon color="blue" /> : isVideo ? <Video color="purple" /> : isAudio ? <Music color="pink" /> : <FileText color="orange" />}
                                            </Center>
                                            <Heading size="md" fontWeight="black" lineHeight="tight">
                                                {file.name}
                                            </Heading>
                                            <Badge colorPalette="blue" variant="subtle" px={3} py={1} borderRadius="lg" fontSize="2xs" fontWeight="black" letterSpacing="widest">
                                                {extension || 'FILE'} FORMAT
                                            </Badge>
                                        </VStack>

                                        {/* Detail List */}
                                        <VStack align="stretch" gap={6}>
                                            <VStack align="start" gap={2}>
                                                <HStack gap={2} fontSize="2xs" fontWeight="black" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                                    <HardDrive size={10} /> 文件容量
                                                </HStack>
                                                <Text fontSize="sm" fontWeight="bold">{formatSize(file.size)}</Text>
                                            </VStack>
                                            <VStack align="start" gap={2}>
                                                <HStack gap={2} fontSize="2xs" fontWeight="black" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                                    <Calendar size={10} /> 修改日期
                                                </HStack>
                                                <Text fontSize="sm" fontWeight="bold">
                                                    {file.lastModified ? format(file.lastModified, 'yyyy-MM-dd HH:mm:ss') : '-'}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" gap={2}>
                                                <HStack gap={2} fontSize="2xs" fontWeight="black" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                                    <Globe size={10} /> 公开链接
                                                </HStack>
                                                <Box
                                                    p={3}
                                                    borderRadius="xl"
                                                    borderWidth="1px"
                                                    borderColor={isCopied ? "green.500/50" : "border.subtle"}
                                                    bg={isCopied ? "green.500/5" : "bg.muted/30"}
                                                    cursor="pointer"
                                                    transition="all 0.2s"
                                                    onClick={handleCopy}
                                                    w="full"
                                                >
                                                    <Flex align="center" gap={3}>
                                                        <Text fontSize="2xs" fontWeight="bold" truncate flex={1} color={isCopied ? "green.600" : "fg.muted"}>
                                                            {publicUrl}
                                                        </Text>
                                                        {isCopied ? <Check size={12} color="green" /> : <Copy size={12} color="gray" />}
                                                    </Flex>
                                                </Box>
                                            </VStack>
                                        </VStack>
                                    </VStack>
                                </Box>

                                {/* Footer Actions */}
                                <VStack p={8} gap={3}>
                                    <Button
                                        w="full"
                                        h={14}
                                        borderRadius="2xl"
                                        colorPalette="blue"
                                        fontWeight="black"
                                        onClick={onDownload}
                                    >
                                        <Download size={18} style={{ marginRight: '8px' }} />
                                        立即下载
                                    </Button>
                                    <Button
                                        w="full"
                                        h={14}
                                        borderRadius="2xl"
                                        variant={isCopied ? "solid" : "outline"}
                                        colorPalette={isCopied ? "green" : "gray"}
                                        fontWeight="black"
                                        onClick={handleCopy}
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check size={18} style={{ marginRight: '8px' }} />
                                                已成功复制
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={18} style={{ marginRight: '8px' }} />
                                                复制外链
                                            </>
                                        )}
                                    </Button>
                                </VStack>
                            </Box>
                        </MotionBox>
                    </Box>
                )}
            </AnimatePresence>
        </Portal>
    );
};
