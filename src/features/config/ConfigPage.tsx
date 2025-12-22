import React from 'react';
import type { R2Config } from '../../lib/r2Client';
import { Save, Trash2, Plus, Server, Key, Database, Globe, Settings, ChevronRight, Cloud, CloudRain } from 'lucide-react';
import { r2Manager } from '../../lib/r2Client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    VStack,
    HStack,
    Heading,
    Text,
    SimpleGrid,
    Button,
    IconButton,
    Input,
    Field,
    Flex,
    Center,
    Separator,
    Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const configSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    accountId: z.string().min(1, 'Account ID is required'),
    accessKeyId: z.string().min(1, 'Access Key ID is required'),
    secretAccessKey: z.string().min(1, 'Secret Access Key is required'),
    bucketName: z.string().min(1, 'Bucket Name is required'),
    customDomain: z.string().optional(),
    endpoint: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface ConfigPageProps {
    configs: R2Config[];
    activeConfigId: string | null;
    onSave: (config: R2Config) => void;
    onDelete: (id: string) => void;
    onSwitch: (id: string) => void;
    onImport: (configs: R2Config[]) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ configs, activeConfigId, onSave, onDelete, onSwitch, onImport }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ConfigFormData>({
        resolver: zodResolver(configSchema),
    });

    const currentId = watch('id');

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configs));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "r2_configs_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (Array.isArray(imported)) {
                    if (window.confirm(t('config.importConfirm', { count: imported.length }))) {
                        onImport(imported);
                    }
                } else {
                    alert(t('config.invalidFormat'));
                }
            } catch (err) {
                alert(t('config.parseError'));
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleCloudSync = async () => {
        if (!window.confirm(t('config.syncConfirm'))) return;

        try {
            await r2Manager.syncToCloud(configs);
            alert(t('config.syncSuccess'));
        } catch (e: any) {
            alert(t('config.syncError') + ': ' + e.message);
        }
    };

    const handleCloudRestore = async () => {
        try {
            const imported = await r2Manager.syncFromCloud();
            if (Array.isArray(imported)) {
                if (window.confirm(t('config.restoreConfirm', { count: imported.length }))) {
                    onImport(imported);
                    alert(t('config.restoreSuccess'));
                }
            } else {
                alert(t('config.noCloudConfig'));
            }
        } catch (e: any) {
            alert(t('config.restoreError') + ': ' + e.message);
        }
    };

    const onFormSubmit = (data: ConfigFormData) => {
        onSave({
            ...data,
            id: data.id || Date.now().toString(),
            name: data.name.trim(),
            accountId: data.accountId.trim(),
            accessKeyId: data.accessKeyId.trim(),
            secretAccessKey: data.secretAccessKey.trim(),
            bucketName: data.bucketName.trim(),
            customDomain: data.customDomain?.trim(),
            endpoint: data.endpoint?.trim(),
        } as R2Config);
        reset();
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={12} align="stretch">
                {/* Active Buckets Section */}
                <VStack align="stretch" gap={8}>
                    <Flex justify="space-between" align="center" px={2}>
                        <HStack gap={5}>
                            <Center
                                w={14}
                                h={14}
                                borderRadius="2xl"
                                bgGradient="to-br"
                                gradientFrom="blue.500"
                                gradientTo="blue.700"
                                shadow="lg"
                                color="white"
                            >
                                <Database size={28} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Heading size="2xl" fontWeight="bold" letterSpacing="tight">存储桶管理</Heading>
                                <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                    Bucket Management
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack gap={3}>
                            <HStack bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }} backdropFilter="blur(10px)" p={1} borderRadius="2xl" gap={1}>
                                <IconButton
                                    aria-label="Sync to cloud"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloudSync}
                                    borderRadius="xl"
                                >
                                    <Cloud size={18} />
                                </IconButton>
                                <IconButton
                                    aria-label="Restore from cloud"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloudRestore}
                                    borderRadius="xl"
                                >
                                    <CloudRain size={18} />
                                </IconButton>
                            </HStack>
                            
                            <Button
                                as="label"
                                variant="outline"
                                borderRadius="2xl"
                                size="sm"
                                cursor="pointer"
                            >
                                <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                                <Plus size={14} style={{ marginRight: '8px' }} /> 导入
                            </Button>
                            
                            <Button
                                variant="outline"
                                borderRadius="2xl"
                                size="sm"
                                onClick={handleExport}
                            >
                                导出备份
                            </Button>
                        </HStack>
                    </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                    <AnimatePresence mode="popLayout">
                        {configs.map((config, index) => (
                            <MotionBox
                                key={config.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Box
                                    p={8}
                                    bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
                                    backdropFilter="blur(20px)"
                                    borderRadius="3xl"
                                    position="relative"
                                    transition="all 0.5s"
                                    cursor="pointer"
                                    borderWidth="2px"
                                    borderColor={activeConfigId === config.id ? "blue.500" : { base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                                    shadow={activeConfigId === config.id ? "2xl" : "none"}
                                    _hover={{
                                        shadow: "xl",
                                        transform: "translateY(-8px)",
                                        borderColor: activeConfigId === config.id ? "blue.500" : "blue.500/30"
                                    }}
                                    onClick={() => onSwitch(config.id)}
                                >
                                    {activeConfigId === config.id && (
                                        <Box position="absolute" top={6} right={6}>
                                            <Badge
                                                colorPalette="blue"
                                                variant="solid"
                                                borderRadius="full"
                                                px={3}
                                                py={1}
                                                fontSize="2xs"
                                                fontWeight="bold"
                                                letterSpacing="tighter"
                                            >
                                                DEFAULT
                                            </Badge>
                                        </Box>
                                    )}

                                    <VStack align="stretch" gap={6} h="full">
                                        <Center
                                            w={14}
                                            h={14}
                                            borderRadius="2xl"
                                            bg={activeConfigId === config.id ? "blue.500" : "bg.muted"}
                                            color={activeConfigId === config.id ? "white" : "fg.muted"}
                                            transition="all 0.5s"
                                            _groupHover={{
                                                bg: "blue.500/10",
                                                color: "blue.500"
                                            }}
                                        >
                                            <Database size={28} />
                                        </Center>

                                        <VStack align="start" gap={1}>
                                            <Heading size="xl" fontWeight="bold" truncate w="full">
                                                {config.name}
                                            </Heading>
                                            <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                                {config.bucketName}
                                            </Text>
                                        </VStack>

                                        <Separator />

                                        <Flex justify="space-between" align="center">
                                            <VStack align="start" gap={0}>
                                                <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="tighter" textTransform="uppercase">
                                                    Account ID
                                                </Text>
                                                <Text fontSize="xs" fontWeight="bold" color="fg.subtle">
                                                    {config.accountId.substring(0, 12)}...
                                                </Text>
                                            </VStack>
                                            <HStack gap={2}>
                                                <IconButton
                                                    aria-label="Edit config"
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); reset(config); }}
                                                    borderRadius="xl"
                                                >
                                                    <Settings size={18} />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Delete config"
                                                    variant="subtle"
                                                    colorPalette="red"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); onDelete(config.id); }}
                                                    borderRadius="xl"
                                                >
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </HStack>
                                        </Flex>
                                    </VStack>
                                </Box>
                            </MotionBox>
                        ))}
                    </AnimatePresence>

                    <Box
                        as="button"
                        p={8}
                        bg="bg.muted/30"
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="border.subtle"
                        borderRadius="3xl"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={5}
                        minH="240px"
                        transition="all 0.5s"
                        _hover={{
                            borderColor: "blue.500/50",
                            bg: { base: "whiteAlpha.800", _dark: "whiteAlpha.100" },
                            shadow: "lg"
                        }}
                        onClick={() => reset({})}
                    >
                        <Center
                            w={16}
                            h={16}
                            borderRadius="2xl"
                            bg={{ base: "whiteAlpha.800", _dark: "whiteAlpha.100" }}
                            backdropFilter="blur(10px)"
                            shadow="sm"
                            transition="all 0.5s"
                            _groupHover={{
                                bg: "blue.500",
                                color: "white",
                                transform: "scale(1.1)",
                                shadow: "lg"
                            }}
                        >
                            <Plus size={32} />
                        </Center>
                        <VStack gap={1}>
                            <Text fontWeight="bold" fontSize="sm" letterSpacing="tight">配置新存储桶</Text>
                            <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                Add New Bucket
                            </Text>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </VStack>

            {/* Configuration Form Card */}
            <Box
                bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
                backdropFilter="blur(20px)"
                borderRadius="3xl"
                p={{ base: 6, md: 12 }}
                borderWidth="1px"
                borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                shadow="2xl"
                animation="slide-up"
            >
                <Flex align="center" gap={{ base: 4, md: 6 }} mb={{ base: 8, md: 12 }}>
                    <Center
                        w={{ base: 12, md: 16 }}
                        h={{ base: 12, md: 16 }}
                        borderRadius="2xl"
                        bgGradient="to-br"
                        gradientFrom="purple.500"
                        gradientTo="purple.700"
                        shadow="lg"
                        color="white"
                    >
                        <Settings size={32} />
                    </Center>
                    <VStack align="start" gap={0}>
                        <Heading size={{ base: "xl", md: "3xl" }} fontWeight="bold" letterSpacing="tight">
                            {currentId ? '编辑现有配置' : '初始化新存储桶'}
                        </Heading>
                        <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                            R2 Connection Credentials
                        </Text>
                    </VStack>
                </Flex>

                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <VStack gap={{ base: 6, md: 10 }} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 6, md: 10 }}>
                            <Field.Root invalid={!!errors.name}>
                                <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    {t('config.name')} / Nickname
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor={errors.name ? "red.500" : "transparent"}
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Database size={20} color="gray" />
                                    <Input
                                        variant="subtle"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="例如: 工作备份"
                                        {...register('name')}
                                    />
                                </HStack>
                                {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                            </Field.Root>

                            <Field.Root invalid={!!errors.bucketName}>
                                <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    {t('config.bucketName')} / Bucket Name
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor={errors.bucketName ? "red.500" : "transparent"}
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Database size={20} color="gray" />
                                    <Input
                                        variant="subtle"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="r2-bucket-main"
                                        {...register('bucketName')}
                                    />
                                </HStack>
                                {errors.bucketName && <Field.ErrorText>{errors.bucketName.message}</Field.ErrorText>}
                            </Field.Root>

                            <Field.Root invalid={!!errors.accountId}>
                                <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    Cloudflare Account ID
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor={errors.accountId ? "red.500" : "transparent"}
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Server size={20} color="gray" />
                                    <Input
                                        variant="subtle"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="f12e..."
                                        {...register('accountId')}
                                    />
                                </HStack>
                                {errors.accountId && <Field.ErrorText>{errors.accountId.message}</Field.ErrorText>}
                            </Field.Root>

                            <Field.Root invalid={!!errors.endpoint}>
                                <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    {t('config.endpoint')} (可选)
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor={errors.endpoint ? "red.500" : "transparent"}
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Globe size={20} color="gray" />
                                    <Input
                                        variant="subtle"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="https://...r2.cloudflarestorage.com"
                                        {...register('endpoint')}
                                    />
                                </HStack>
                            </Field.Root>

                            <Field.Root invalid={!!errors.accessKeyId}>
                                <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    {t('config.accessKey')}
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor={errors.accessKeyId ? "red.500" : "transparent"}
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Key size={20} color="gray" />
                                    <Input
                                        variant="subtle"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="P2z..."
                                        {...register('accessKeyId')}
                                    />
                                </HStack>
                                {errors.accessKeyId && <Field.ErrorText>{errors.accessKeyId.message}</Field.ErrorText>}
                            </Field.Root>

                            <Field.Root invalid={!!errors.secretAccessKey}>
                                <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    {t('config.secretKey')}
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor={errors.secretAccessKey ? "red.500" : "transparent"}
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Key size={20} color="gray" />
                                    <Input
                                        variant="subtle"
                                        type="password"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="••••••••••••••••"
                                        {...register('secretAccessKey')}
                                    />
                                </HStack>
                                {errors.secretAccessKey && <Field.ErrorText>{errors.secretAccessKey.message}</Field.ErrorText>}
                            </Field.Root>
                        </SimpleGrid>

                        <Field.Root invalid={!!errors.customDomain}>
                            <Field.Label fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                {t('config.publicUrl')} / Custom Domain
                            </Field.Label>
                            <HStack
                                bg="bg.muted/50"
                                borderRadius="2xl"
                                px={5}
                                borderWidth="2px"
                                borderColor={errors.customDomain ? "red.500" : "transparent"}
                                _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                transition="all 0.2s"
                            >
                                <Globe size={20} color="gray" />
                                <Input
                                    variant="subtle"
                                    py={4}
                                    fontWeight="bold"
                                    placeholder="https://cdn.example.com"
                                    {...register('customDomain')}
                                />
                            </HStack>
                        </Field.Root>

                        <Box pt={{ base: 4, md: 8 }}>
                            <Button
                                type="submit"
                                w="full"
                                size="xl"
                                colorPalette="blue"
                                borderRadius="2xl"
                                fontWeight="bold"
                                shadow="2xl"
                                _hover={{ transform: "scale(1.01)" }}
                                _active={{ transform: "scale(0.98)" }}
                            >
                                <Save size={20} style={{ marginRight: '12px' }} />
                                保存连接配置
                                <ChevronRight size={20} style={{ marginLeft: '8px', opacity: 0.5 }} />
                            </Button>
                        </Box>
                    </VStack>
                </form>
            </Box>
            </VStack>
        </Container>
    );
};
