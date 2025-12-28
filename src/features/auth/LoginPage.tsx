import React, { useState, useEffect } from 'react';
import { Box, Button, Center, Container, Heading, Stack, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { Github, Zap, ShieldCheck, Globe, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const MotionBox = motion(Box as any);

interface LoginPageProps {
    onLogin: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 检查 OAuth 回调后的认证状态
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/session', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        // 已经登录成功，直接跳转
                        onLogin(data.user);
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
            }
        };

        checkSession();
    }, [onLogin]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        if (errorParam === 'unauthorized') {
            setError(t('auth.unauthorized'));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [t]);

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
                    bg={{ base: "white", _dark: "gray.900" }}
                    borderRadius="3rem"
                    p={{ base: 6, sm: 10 }}
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
                            <Heading size={{ base: "lg", md: "xl" }} fontWeight="bold" color={{ base: "gray.900", _dark: "white" }} letterSpacing="tight">
                                {t('auth.welcomeBack')}
                            </Heading>
                            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                {t('auth.loginSubtitle')}
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
                                <Text fontSize="13px" fontWeight="bold" color={{ base: "red.700", _dark: "red.300" }}>{t('auth.loginFailed')}</Text>
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
                                <Text fontSize="13px" fontWeight="bold" color={{ base: "gray.700", _dark: "gray.200" }}>{t('auth.feature1Title')}</Text>
                                <Text fontSize="11px" fontWeight="bold" color="gray.400">{t('auth.feature1Desc')}</Text>
                            </VStack>
                        </HStack>
                        <HStack p={4} bg={{ base: "gray.50", _dark: "whiteAlpha.50" }} borderRadius="1.5rem" border="1px solid" borderColor={{ base: "gray.100", _dark: "whiteAlpha.50" }} gap={4}>
                            <Center w={10} h={10} borderRadius="xl" bg="green.50" color="green.500" flexShrink={0}>
                                <ShieldCheck size={20} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Text fontSize="13px" fontWeight="bold" color={{ base: "gray.700", _dark: "gray.200" }}>{t('auth.feature2Title')}</Text>
                                <Text fontSize="11px" fontWeight="bold" color="gray.400">{t('auth.feature2Desc')}</Text>
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
                                <Text fontSize="15px" fontWeight="bold">{t('auth.continueWithGithub')}</Text>
                                <ArrowRight size={18} opacity={0.4} />
                            </>
                        )}
                    </Button>

                    <Text mt={8} textAlign="center" fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" px={6} lineHeight="relaxed">
                        {t('auth.agreementPrefix')} <Box as="span" color="blue.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>{t('auth.terms')}</Box> {t('auth.agreementAnd')} <Box as="span" color="blue.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>{t('auth.privacy')}</Box>
                    </Text>
                </MotionBox>

                {/* Footer Info */}
                <HStack mt={8} justify="center" gap={6} fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="2px">
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
