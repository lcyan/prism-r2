import React from 'react';
import { Database, HardDrive, RotateCw, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

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
    const { t } = useTranslation();
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
            bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            p={{ base: 6, md: 8 }}
            shadow="xl"
            borderWidth="1px"
            borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
        >
            <VStack gap={{ base: 6, md: 8 }} align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap={0}>
                        <Heading size={{ base: "md", md: "xl" }} fontWeight="bold" letterSpacing="tight">
                            {t('dashboard.storageOverview')}
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
                        <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" ml={1} textTransform="uppercase">
                            {t('dashboard.currentBucket')}
                        </Text>
                        <HStack gap={3}>
                            <Box
                                flex={1}
                                bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                                backdropFilter="blur(10px)"
                                borderRadius="2xl"
                                px={5}
                                py={3}
                                fontSize="xs"
                                fontWeight="bold"
                                color="fg.subtle"
                                shadow="inner"
                                truncate
                                borderWidth="1px"
                                borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
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
                        bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                        backdropFilter="blur(10px)"
                        borderRadius="2xl"
                        p={6}
                        borderWidth="1px"
                        borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                        transition="all 0.3s"
                        _hover={{ shadow: "lg" }}
                    >
                        <Box position="absolute" top={0} right={0} p={4} opacity={0.1}>
                            <HardDrive size={64} />
                        </Box>
                        <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" mb={2} textTransform="uppercase">
                            {t('config.publicUrl')}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
                            {customDomain || t('common.none')}
                        </Text>
                    </Box>

                    {/* Stats Grid */}
                    <SimpleGrid columns={2} gap={4}>
                        <Box
                            bg="orange.500/10"
                            backdropFilter="blur(10px)"
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
                                    <Text fontSize="2xl" fontWeight="bold" color="orange.600" letterSpacing="tighter">
                                        {fileCount}
                                    </Text>
                                    <Text fontSize="2xs" fontWeight="bold" color="orange.500/60" textTransform="uppercase">
                                        {t('dashboard.fileCount')}
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        <Box
                            bg="blue.500/10"
                            backdropFilter="blur(10px)"
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
                                    <Text fontSize="2xl" fontWeight="bold" color="blue.600" letterSpacing="tighter">
                                        {formatTotalSize(totalSize)}
                                    </Text>
                                    <Text fontSize="2xs" fontWeight="bold" color="blue.500/60" textTransform="uppercase">
                                        {t('dashboard.totalSize')}
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>
                    </SimpleGrid>

                    {/* Connection Status */}
                    <Box
                        bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                        backdropFilter="blur(10px)"
                        borderRadius="3xl"
                        p={6}
                        borderWidth="1px"
                        borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
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
                                        <Text fontSize="sm" fontWeight="bold">
                                            {status === 'online' ? t('dashboard.statusOnline') : status === 'offline' ? t('dashboard.statusOffline') : t('common.loading')}
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

                            {bucketName === t('common.none') && (
                                <Box
                                    p={4}
                                    bg="red.500/10"
                                    borderRadius="2xl"
                                    borderWidth="1px"
                                    borderColor="red.500/20"
                                >
                                    <Text fontSize="2xs" fontWeight="bold" color="red.500" lineHeight="relaxed">
                                        {t('dashboard.noConfigWarning')}
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
