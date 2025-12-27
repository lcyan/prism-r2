import React from 'react';
import { Box, Flex, HStack, VStack, Text, IconButton, Container, Center, Heading } from '@chakra-ui/react';
import { LogOut, Database, RefreshCw, User } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'files' | 'config';
    onTabChange: (tab: 'files' | 'config') => void;
    onRefresh?: () => void;
    onLogout?: () => void;
    connectionStatus: 'online' | 'offline' | 'checking';
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onRefresh,
    onLogout,
    connectionStatus: _connectionStatus
}) => {
    return (
        <Box minH="100vh" bg={{ base: "#F0F2F5", _dark: "black" }} display="flex" flexDirection="column">
            {/* Top Header */}
            <Box 
                as="header" 
                h={{ base: "14", md: "16" }} 
                bg={{ base: "whiteAlpha.800", _dark: "blackAlpha.800" }} 
                backdropFilter="blur(20px)"
                borderBottom="1px solid" 
                borderColor={{ base: "whiteAlpha.300", _dark: "whiteAlpha.100" }} 
                position="sticky" 
                top={0} 
                zIndex={50}
            >
                <Container maxW="1700px" h="full" px={{ base: 3, md: 8 }}>
                    <Flex h="full" align="center" justify="space-between">
                        <HStack gap={3}>
                            <HStack 
                                gap={{ base: 2, md: 4 }} 
                                cursor="pointer" 
                                onClick={() => onTabChange('files')}
                            >
                                <Center 
                                    w={{ base: 8, md: 10 }}
                                    h={{ base: 8, md: 10 }}
                                    borderRadius="xl" 
                                    bg="bg.muted/30"
                                    backdropFilter="blur(10px)"
                                    shadow="sm" 
                                    transition="all 0.3s"
                                    _groupHover={{ transform: "scale(1.1)", bg: "blue.500/10" }}
                                    position="relative"
                                    overflow="hidden"
                                >
                                    <img src="/logo.svg" alt="Prism R2 Logo" style={{ width: '80%', height: '80%' }} />
                                </Center>
                                <Heading 
                                    size={{ base: "md", md: "lg" }}
                                    fontWeight="black" 
                                    letterSpacing="tighter" 
                                    bgGradient="to-br"
                                    gradientFrom="blue.500"
                                    gradientTo="purple.600"
                                    bgClip="text"
                                    transition="all 0.3s"
                                    _hover={{ filter: "brightness(1.1)" }}
                                    display={{ base: "none", sm: "block" }}
                                >
                                    Prism R2
                                </Heading>
                            </HStack>
                        </HStack>

                        <HStack gap={{ base: 1, md: 4 }}>
                            {onRefresh && activeTab === 'files' && (
                                <IconButton
                                    aria-label="刷新"
                                    variant="ghost"
                                    size={{ base: "sm", md: "md" }}
                                    onClick={onRefresh}
                                    color="gray.400"
                                    _hover={{ color: "blue.500", bg: { base: "gray.100", _dark: "whiteAlpha.10" } }}
                                    _active={{ transform: "scale(0.9)" }}
                                >
                                    <RefreshCw size={18} />
                                </IconButton>
                            )}

                            <Box h={6} w="1px" bg={{ base: "gray.200", _dark: "whiteAlpha.20" }} mx={{ base: 0.5, md: 1 }} />

                            <HStack 
                                display={{ base: "none", lg: "flex" }} 
                                gap={3} 
                                py={1} 
                                pl={1} 
                                pr={3} 
                                borderRadius="full" 
                                bg={{ base: "gray.100", _dark: "whiteAlpha.10" }} 
                                border="1px solid" 
                                borderColor={{ base: "gray.200", _dark: "whiteAlpha.10" }}
                            >
                                <Center w={8} h={8} borderRadius="full" bgGradient="to-tr" gradientFrom="blue.500" gradientTo="purple.600" color="white" fontSize="xs" fontWeight="bold" shadow="sm">
                                    <User size={14} />
                                </Center>
                                <VStack align="start" gap={0} minW="80px">
                                    <HStack gap={1.5}>
                                        <Text fontSize="10px" fontWeight="semibold" color="gray.400">欢迎，</Text>
                                        <Text fontSize="11px" fontWeight="semibold" color="blue.500">yanleichang</Text>
                                    </HStack>
                                </VStack>
                            </HStack>

                            <IconButton
                                aria-label="存储桶配置"
                                onClick={() => onTabChange('config')}
                                w={{ base: 8, md: 9 }}
                                h={{ base: 8, md: 9 }}
                                size={{ base: "sm", md: "md" }}
                                borderRadius="xl"
                                bg={activeTab === 'config' ? "purple.600" : "purple.100"}
                                color={activeTab === 'config' ? "white" : "purple.600"}
                                shadow={activeTab === 'config' ? "lg" : "none"}
                                _hover={{ bg: activeTab === 'config' ? "purple.700" : "purple.200" }}
                            >
                                <Database size={18} />
                            </IconButton>

                            <IconButton
                                aria-label="退出登录"
                                onClick={onLogout}
                                w={{ base: 8, md: 9 }}
                                h={{ base: 8, md: 9 }}
                                size={{ base: "sm", md: "md" }}
                                borderRadius="xl"
                                bg="red.100"
                                color="red.600"
                                _hover={{ bg: "red.200" }}
                            >
                                <LogOut size={18} />
                            </IconButton>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Content Area */}
            <Box as="main" flex={1} w="full" maxW="1700px" mx="auto" p={{ base: 3, md: 8 }}>
                {children}
            </Box>
        </Box>
    );
};
