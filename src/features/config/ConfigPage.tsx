import React, { useState } from 'react';
import type { R2Config } from '../../lib/r2Client';
import { Save, Trash2, Plus, Server, Key, Database, Globe, Settings, ChevronRight, Cloud, CloudRain } from 'lucide-react';
import { r2Manager } from '../../lib/r2Client';
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
    Portal,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface ConfigPageProps {
    configs: R2Config[];
    activeConfigId: string | null;
    onSave: (config: R2Config) => void;
    onDelete: (id: string) => void;
    onSwitch: (id: string) => void;
    onImport: (configs: R2Config[]) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ configs, activeConfigId, onSave, onDelete, onSwitch, onImport }) => {
    const [formData, setFormData] = useState<Partial<R2Config>>({});

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
                    if (window.confirm(`确定要导入 ${imported.length} 个配置吗？现有配置将被覆盖。`)) {
                        onImport(imported);
                    }
                } else {
                    alert('无效的配置文件格式');
                }
            } catch (err) {
                alert('解析文件失败');
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
        event.target.value = '';
    };

    const handleCloudSync = async () => {
        if (!window.confirm('这将会尝试将当前配置同步到云端。注意：如果已配置环境变量，云端同步可能是只读的。确定吗？')) return;

        try {
            await r2Manager.syncToCloud(configs);
            alert('配置已成功同步！');
        } catch (e: any) {
            alert('同步失败: ' + e.message);
        }
    };

    const handleCloudRestore = async () => {
        try {
            const imported = await r2Manager.syncFromCloud();
            if (Array.isArray(imported)) {
                if (window.confirm(`发现云端配置，包含 ${imported.length} 个项目。确定要恢复并覆盖当前本地配置吗？`)) {
                    onImport(imported);
                    alert('配置恢复成功！');
                }
            } else {
                alert('云端没有有效的配置列表。');
            }
        } catch (e: any) {
            alert('恢复失败: ' + e.message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.accountId && formData.accessKeyId && formData.secretAccessKey && formData.bucketName) {
            onSave({
                id: formData.id || Date.now().toString(),
                name: (formData.name || formData.bucketName || '').trim(),
                accountId: (formData.accountId || '').trim(),
                accessKeyId: (formData.accessKeyId || '').trim(),
                secretAccessKey: (formData.secretAccessKey || '').trim(),
                bucketName: (formData.bucketName || '').trim(),
                customDomain: (formData.customDomain || '').trim(),
                endpoint: (formData.endpoint || '').trim(),
            } as R2Config);
            setFormData({});
        }
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
                                <Heading size="2xl" fontWeight="black" letterSpacing="tight">存储桶管理</Heading>
                                <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                    Bucket Management
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack gap={3}>
                            <HStack bg="bg.muted" p={1} borderRadius="2xl" gap={1}>
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
                                    bg="bg.panel"
                                    borderRadius="3xl"
                                    position="relative"
                                    transition="all 0.5s"
                                    cursor="pointer"
                                    borderWidth="2px"
                                    borderColor={activeConfigId === config.id ? "blue.500" : "border.subtle"}
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
                                                fontWeight="black"
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
                                            <Heading size="xl" fontWeight="black" truncate w="full">
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
                                                <Text fontSize="xs" fontWeight="black" color="fg.subtle">
                                                    {config.accountId.substring(0, 12)}...
                                                </Text>
                                            </VStack>
                                            <HStack gap={2}>
                                                <IconButton
                                                    aria-label="Edit config"
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); setFormData(config); }}
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
                            bg: "bg.panel",
                            shadow: "lg"
                        }}
                        onClick={() => setFormData({})}
                    >
                        <Center
                            w={16}
                            h={16}
                            borderRadius="2xl"
                            bg="bg.panel"
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
                            <Text fontWeight="black" fontSize="sm" letterSpacing="tight">配置新存储桶</Text>
                            <Text fontSize="2xs" fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                                Add New Bucket
                            </Text>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </VStack>

            {/* Configuration Form Card */}
            <Box
                bg="bg.panel"
                borderRadius="3xl"
                p={{ base: 6, md: 12 }}
                borderWidth="1px"
                borderColor="border.subtle"
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
                        gradientTo="indigo-600"
                        shadow="lg"
                        color="white"
                    >
                        <Settings size={32} />
                    </Center>
                    <VStack align="start" gap={0}>
                        <Heading size={{ base: "xl", md: "3xl" }} fontWeight="black" letterSpacing="tight">
                            {formData.id ? '编辑现有配置' : '初始化新存储桶'}
                        </Heading>
                        <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
                            R2 Connection Credentials
                        </Text>
                    </VStack>
                </Flex>

                <form onSubmit={handleSubmit}>
                    <VStack gap={{ base: 6, md: 10 }} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 6, md: 10 }}>
                            <Field.Root required>
                                <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    存储桶昵称 / Nickname
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Database size={20} color="gray" />
                                    <Input
                                        variant="plain"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="例如: 工作备份"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </HStack>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    存储桶名称 / Bucket Name
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Database size={20} color="gray" />
                                    <Input
                                        variant="plain"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="r2-bucket-main"
                                        value={formData.bucketName || ''}
                                        onChange={e => setFormData({ ...formData, bucketName: e.target.value })}
                                    />
                                </HStack>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    Cloudflare Account ID
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Server size={20} color="gray" />
                                    <Input
                                        variant="plain"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="f12e..."
                                        value={formData.accountId || ''}
                                        onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                                    />
                                </HStack>
                            </Field.Root>

                            <Field.Root>
                                <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    Endpoint (可选)
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Globe size={20} color="gray" />
                                    <Input
                                        variant="plain"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="https://...r2.cloudflarestorage.com"
                                        value={formData.endpoint || ''}
                                        onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                                    />
                                </HStack>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    Access Key ID
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Key size={20} color="gray" />
                                    <Input
                                        variant="plain"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="P2z..."
                                        value={formData.accessKeyId || ''}
                                        onChange={e => setFormData({ ...formData, accessKeyId: e.target.value })}
                                    />
                                </HStack>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                    Secret Access Key
                                </Field.Label>
                                <HStack
                                    bg="bg.muted/50"
                                    borderRadius="2xl"
                                    px={5}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                    transition="all 0.2s"
                                >
                                    <Key size={20} color="gray" />
                                    <Input
                                        variant="plain"
                                        type="password"
                                        py={4}
                                        fontWeight="bold"
                                        placeholder="••••••••••••••••"
                                        value={formData.secretAccessKey || ''}
                                        onChange={e => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                    />
                                </HStack>
                            </Field.Root>
                        </SimpleGrid>

                        <Field.Root>
                            <Field.Label fontSize="2xs" fontWeight="black" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mb={2}>
                                自定义分发域名 / Custom Domain
                            </Field.Label>
                            <HStack
                                bg="bg.muted/50"
                                borderRadius="2xl"
                                px={5}
                                borderWidth="2px"
                                borderColor="transparent"
                                _focusWithin={{ bg: "bg.panel", borderColor: "blue.500", shadow: "sm" }}
                                transition="all 0.2s"
                            >
                                <Globe size={20} color="gray" />
                                <Input
                                    variant="plain"
                                    py={4}
                                    fontWeight="bold"
                                    placeholder="https://cdn.example.com"
                                    value={formData.customDomain || ''}
                                    onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
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
                                fontWeight="black"
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
        </Container>
    );
};
