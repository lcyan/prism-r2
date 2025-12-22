import React, { useState, useEffect } from 'react';
import { Box, Button, Center, Container, Flex, Heading, Stack, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { Github, Zap, ShieldCheck, Globe, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box as any);

interface LoginPageProps {
    onLogin: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        if (errorParam === 'unauthorized') {
            setError('您的账号未被授权访问此系统，请联系管理员');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleGithubLogin = () => {
        setIsLoading(true);
        window.location.href = '/api/auth/login';
    };

    return (
        <Box 
            minH="100vh" 
            bg={{ base: "#F0F2F5", _dark: "black" }} 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            p={6} 
            position="relative" 
            overflow="hidden"
        >
            {/* Background Decorative Elements */}
            <Box 
                position="absolute" 
                top="-10%" 
                left="-10%" 
                w="40%" 
                h="40%" 
                bg="blue.500" 
                opacity={0.1} 
                borderRadius="full" 
                filter="blur(120px)" 
                pointerEvents="none" 
            />
            <Box 
                position="absolute" 
                bottom="-10%" 
                right="-10%" 
                w="40%" 
                h="40%" 
                bg="purple.500" 
                opacity={0.1} 
                borderRadius="full" 
                filter="blur(120px)" 
                pointerEvents="none" 
            />

            <Container maxW="md" p={0}>
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    bg={{ base: "white", _dark: "zinc.900" }}
                    borderRadius="3rem"
                    p={10}
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor={{ base: "blackAlpha.50", _dark: "whiteAlpha.50" }}
                    position="relative"
                    overflow="hidden"
                >
                    {/* GitHub Logo Header */}
                    <VStack gap={6} mb={12} textAlign="center">
                        <Center 
                            w={20} 
                            h={20} 
                            borderRadius="2rem" 
                            bg={{ base: "black", _dark: "white" }} 
                            boxShadow="2xl"
                            transition="transform 0.5s"
                            _hover={{ transform: "rotate(12deg)" }}
                        >
                            <Github size={44} color={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'black' : 'white'} />
                        </Center>
                        <Stack gap={2}>
                            <Heading size="xl" fontWeight="black" color={{ base: "gray.900", _dark: "white" }} letterSpacing="tight">
                                欢迎回来
                            </Heading>
                            <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                请关联您的 GitHub 账户以继续管理 R2
                            </Text>
                        </Stack>
                    </VStack>

                    {/* Error Message */}
                    {error && (
                        <HStack 
                            mb={8} 
                            p={4} 
                            bg={{ base: "red.50", _dark: "red.900/20" }} 
                            border="1px solid" 
                            borderColor={{ base: "red.100", _dark: "red.900/30" }} 
                            borderRadius="1.5rem" 
                            gap={3}
                        >
                            <Center w={10} h={10} borderRadius="xl" bg={{ base: "red.100", _dark: "red.900/40" }} color={{ base: "red.600", _dark: "red.400" }} flexShrink={0}>
                                <AlertCircle size={20} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Text fontSize="13px" fontWeight="black" color={{ base: "red.700", _dark: "red.300" }}>登录失败</Text>
                                <Text fontSize="11px" fontWeight="bold" color={{ base: "red.600/70", _dark: "red.400/70" }}>{error}</Text>
                            </VStack>
                        </HStack>
                    )}

                    {/* Features Preview */}
                    <Stack gap={4} mb={10}>
                        <HStack p={4} bg={{ base: "gray.50", _dark: "whiteAlpha.50" }} borderRadius="1.5rem" border="1px solid" borderColor={{ base: "gray.100", _dark: "whiteAlpha.50" }} gap={4}>
                            <Center w={10} h={10} borderRadius="xl" bg="blue.50" color="blue.500" flexShrink={0}>
                                <Zap size={20} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Text fontSize="13px" fontWeight="black" color={{ base: "gray.700", _dark: "gray.200" }}>极速响应</Text>
                                <Text fontSize="11px" fontWeight="bold" color="gray.400">基于 Cloudflare 全球网络</Text>
                            </VStack>
                        </HStack>
                        <HStack p={4} bg={{ base: "gray.50", _dark: "whiteAlpha.50" }} borderRadius="1.5rem" border="1px solid" borderColor={{ base: "gray.100", _dark: "whiteAlpha.50" }} gap={4}>
                            <Center w={10} h={10} borderRadius="xl" bg="green.50" color="green.500" flexShrink={0}>
                                <ShieldCheck size={20} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Text fontSize="13px" fontWeight="black" color={{ base: "gray.700", _dark: "gray.200" }}>安全合规</Text>
                                <Text fontSize="11px" fontWeight="bold" color="gray.400">本地存储配置，不经过后端</Text>
                            </VStack>
                        </HStack>
                    </Stack>

                    {/* Login Button */}
                    <Button
                        disabled={isLoading}
                        onClick={handleGithubLogin}
                        w="full"
                        h="auto"
                        py={5}
                        borderRadius="2rem"
                        bg={{ base: "black", _dark: "white" }}
                        color={{ base: "white", _dark: "black" }}
                        _hover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                        display="flex"
                        gap={3}
                    >
                        {isLoading ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <Github size={22} />
                                <Text fontSize="15px" fontWeight="black">通过 GitHub 继续</Text>
                                <ArrowRight size={18} opacity={0.4} />
                            </>
                        )}
                    </Button>

                    <Text mt={8} textAlign="center" fontSize="11px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="widest" px={6} lineHeight="relaxed">
                        点击登录即表示您同意本系统的 <Box as="span" color="blue.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>使用协议</Box> 与 <Box as="span" color="blue.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>隐私政策</Box>
                    </Text>
                </MotionBox>

                {/* Footer Info */}
                <HStack mt={8} justify="center" gap={6} fontSize="11px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="2px">
                    <HStack gap={2}>
                        <Globe size={14} />
                        <Text>Powered by R2 Manager</Text>
                    </HStack>
                    <Box w={1} h={1} borderRadius="full" bg="gray.300" />
                    <Text>v2.0.0</Text>
                </HStack>
            </Container>
        </Box>
    );
};
