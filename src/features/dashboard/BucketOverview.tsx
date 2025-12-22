import React from 'react';
import { Database, HardDrive, RotateCw, Activity } from 'lucide-react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    IconButton,
    SimpleGrid,
    Center,
    Image,
    Badge,
    Flex,
} from '@chakra-ui/react';

interface BucketOverviewProps {
    bucketName: string;
    customDomain?: string;
    fileCount: number;
    totalSize: number;
    onRefresh: () => void;
    status: 'online' | 'offline' | 'checking';
}

export const BucketOverview: React.FC<BucketOverviewProps> = ({
    bucketName,
    customDomain,
    fileCount,
    totalSize,
    onRefresh,
    status
}) => {
    const formatTotalSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Log(bytes) / Log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const Log = Math.log;

    return (
        <Box
            bg="bg.panel"
            borderRadius="3xl"
            p={{ base: 6, md: 8 }}
            shadow="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
        >
            <VStack gap={{ base: 6, md: 8 }} align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap={0}>
                        <Heading size={{ base: "md", md: "xl" }} fontWeight="black" letterSpacing="tight">
                            存储概览
                        </Heading>
                        <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                            Storage Overview
                        </Text>
                    </VStack>
                    <Center
                        w={{ base: 10, md: 12 }}
                        h={{ base: 10, md: 12 }}
                        borderRadius="2xl"
                        bgGradient="to-br"
                        gradientFrom="orange.400"
                        gradientTo="orange.600"
                        shadow="lg"
                    >
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png"
                            alt="Cloudflare"
                            h={{ base: 3, md: 4 }}
                            objectFit="contain"
                            filter="brightness(0) invert(1)"
                        />
                    </Center>
                </Flex>

                <VStack gap={{ base: 5, md: 6 }} align="stretch">
                    {/* Bucket Name Section */}
                    <VStack align="stretch" gap={2}>
                        <Text fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" ml={1} textTransform="uppercase">
                            当前存储桶
                        </Text>
                        <HStack gap={3}>
                            <Box
                                flex={1}
                                bg="bg.muted"
                                borderRadius="2xl"
                                px={5}
                                py={3}
                                fontSize="xs"
                                fontWeight="bold"
                                color="fg.subtle"
                                shadow="inner"
                                truncate
                            >
                                {bucketName}
                            </Box>
                            <IconButton
                                aria-label="Refresh"
                                variant="subtle"
                                size="lg"
                                borderRadius="2xl"
                                onClick={onRefresh}
                                _hover={{ bg: "blue.500", color: "white" }}
                                transition="all 0.3s"
                            >
                                <RotateCw size={18} />
                            </IconButton>
                        </HStack>
                    </VStack>

                    {/* Custom Domain Section */}
                    <Box
                        position="relative"
                        overflow="hidden"
                        bgGradient="to-br"
                        gradientFrom="bg.muted"
                        gradientTo="bg.panel"
                        borderRadius="2xl"
                        p={6}
                        borderWidth="1px"
                        borderColor="border.subtle"
                        transition="all 0.3s"
                        _hover={{ shadow: "lg" }}
                    >
                        <Box position="absolute" top={0} right={0} p={4} opacity={0.1}>
                            <HardDrive size={64} />
                        </Box>
                        <Text fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" mb={2} textTransform="uppercase">
                            访问域名
                        </Text>
                        <Text fontSize="lg" fontWeight="black" letterSpacing="tight" breakAnywhere>
                            {customDomain || '未设置'}
                        </Text>
                    </Box>

                    {/* Stats Grid */}
                    <SimpleGrid columns={2} gap={4}>
                        <Box
                            bg="orange.500/10"
                            borderRadius="2xl"
                            p={6}
                            borderWidth="1px"
                            borderColor="orange.500/20"
                        >
                            <VStack align="start" gap={3}>
                                <Center
                                    w={8}
                                    h={8}
                                    borderRadius="xl"
                                    bg="orange.500"
                                    color="white"
                                    shadow="lg"
                                >
                                    <Database size={16} />
                                </Center>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="2xl" fontWeight="black" color="orange.600" letterSpacing="tighter">
                                        {fileCount}
                                    </Text>
                                    <Text fontSize="2xs" fontWeight="black" color="orange.500/60" textTransform="uppercase">
                                        文件总数
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        <Box
                            bg="blue.500/10"
                            borderRadius="2xl"
                            p={6}
                            borderWidth="1px"
                            borderColor="blue.500/20"
                        >
                            <VStack align="start" gap={3}>
                                <Center
                                    w={8}
                                    h={8}
                                    borderRadius="xl"
                                    bg="blue.500"
                                    color="white"
                                    shadow="lg"
                                >
                                    <HardDrive size={16} />
                                </Center>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="2xl" fontWeight="black" color="blue.600" letterSpacing="tighter">
                                        {formatTotalSize(totalSize)}
                                    </Text>
                                    <Text fontSize="2xs" fontWeight="black" color="blue.500/60" textTransform="uppercase">
                                        已用空间
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>
                    </SimpleGrid>

                    {/* Connection Status */}
                    <Box
                        bg="bg.muted/30"
                        borderRadius="3xl"
                        p={6}
                        borderWidth="1px"
                        borderColor="border.subtle"
                    >
                        <VStack gap={4} align="stretch">
                            <Flex justify="space-between" align="center">
                                <HStack gap={4}>
                                    <Center
                                        w={12}
                                        h={12}
                                        borderRadius="2xl"
                                        bg={status === 'online' ? "green.500/10" : "red.500/10"}
                                        color={status === 'online' ? "green.500" : "red.500"}
                                    >
                                    <MotionBox
                                        animate={status === 'online' ? { opacity: [1, 0.5, 1] } : {}}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Activity size={20} />
                                    </MotionBox>
                                    </Center>
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="sm" fontWeight="black">
                                            {status === 'online' ? '连接正常' : status === 'offline' ? '连接断开' : '正在检测...'}
                                        </Text>
                                        <Text fontSize="2xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                            System Status
                                        </Text>
                                    </VStack>
                                </HStack>
                                <IconButton
                                    aria-label="Refresh status"
                                    variant="subtle"
                                    size="sm"
                                    borderRadius="xl"
                                    onClick={onRefresh}
                                >
                                    <RotateCw size={16} />
                                </IconButton>
                            </Flex>

                            {bucketName === '未选择' && (
                                <Box
                                    p={4}
                                    bg="red.500/10"
                                    borderRadius="2xl"
                                    borderWidth="1px"
                                    borderColor="red.500/20"
                                >
                                    <Text fontSize="2xs" fontWeight="black" color="red.500" lineHeight="relaxed">
                                        尚未配置 R2 信息，请点击上方 “R2 存储桶配置” 按钮完成配置
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </Box>
                </VStack>
            </VStack>
        </Box>
    );
};
