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
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            p={6} 
            position="relative" 
            overflow="hidden"
        >
            <Container maxW="md" p={0}>
                <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                    bg={{ base: "white", _dark: "gray.900" }}
                    borderRadius="3.5rem"
                    p={{ base: 8, sm: 12 }}
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.50" }}
                    position="relative"
                    textAlign="center"
                >
                    {/* Logo & Header */}
                    <VStack gap={8} mb={10}>
                        <Center 
                            w={24} 
                            h={24} 
                            borderRadius="2.5rem" 
                            bg="black" 
                            color="white"
                            boxShadow="xl"
                            mb={2}
                        >
                            <Github size={48} />
                        </Center>
                        <Stack gap={3}>
                            <Heading size="xl" fontWeight="black" letterSpacing="tight">
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
                            bg="red.50" 
                            color="red.600"
                            borderRadius="2xl" 
                            gap={3}
                            justify="center"
                        >
                            <AlertCircle size={18} />
                            <Text fontSize="xs" fontWeight="bold">{error}</Text>
                        </HStack>
                    )}

                    {/* Feature Pills */}
                    <VStack gap={4} mb={10}>
                        <HStack 
                            w="full" 
                            p={5} 
                            bg="gray.50" 
                            _dark={{ bg: "whiteAlpha.50" }}
                            borderRadius="2rem" 
                            gap={5}
                            transition="transform 0.2s"
                            _hover={{ transform: "translateY(-2px)" }}
                        >
                            <Center w={10} h={10} flexShrink={0}>
                                <Zap size={24} className="text-blue-500" fill="currentColor" fillOpacity={0.2} />
                            </Center>
                            <VStack align="start" gap={1}>
                                <Text fontSize="sm" fontWeight="bold" color="gray.900" _dark={{ color: "white" }}>
                                    {t('auth.feature1Title')}
                                </Text>
                                <Text fontSize="xs" fontWeight="bold" color="gray.400">
                                    {t('auth.feature1Desc')}
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack 
                            w="full" 
                            p={5} 
                            bg="gray.50" 
                            _dark={{ bg: "whiteAlpha.50" }}
                            borderRadius="2rem" 
                            gap={5}
                            transition="transform 0.2s"
                            _hover={{ transform: "translateY(-2px)" }}
                        >
                            <Center w={10} h={10} flexShrink={0}>
                                <ShieldCheck size={24} className="text-green-500" fill="currentColor" fillOpacity={0.2} />
                            </Center>
                            <VStack align="start" gap={1}>
                                <Text fontSize="sm" fontWeight="bold" color="gray.900" _dark={{ color: "white" }}>
                                    {t('auth.feature2Title')}
                                </Text>
                                <Text fontSize="xs" fontWeight="bold" color="gray.400">
                                    {t('auth.feature2Desc')}
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>

                    {/* Action Button */}
                    <Button
                        disabled={isLoading}
                        onClick={handleGithubLogin}
                        w="full"
                        h="auto"
                        py={6}
                        borderRadius="full"
                        bg="black"
                        _dark={{ bg: "white", color: "black" }}
                        color="white"
                        _hover={{ transform: "scale(1.02)", shadow: "lg" }}
                        _active={{ transform: "scale(0.98)" }}
                        transition="all 0.2s"
                        fontSize="md"
                        fontWeight="bold"
                    >
                        {isLoading ? (
                            <Spinner size="sm" color="white" _dark={{ color: "black" }} />
                        ) : (
                            <HStack gap={3}>
                                <Github size={20} />
                                <Text>{t('auth.continueWithGithub')}</Text>
                                <ArrowRight size={18} opacity={0.5} />
                            </HStack>
                        )}
                    </Button>

                    {/* Legal Footer */}
                    <Text mt={8} fontSize="10px" fontWeight="bold" color="gray.300" textAlign="center" lineHeight="tall">
                         点击登录即表示您同意本系统的 <Box as="span" color="blue.400" cursor="pointer">使用协议</Box> 与 <Box as="span" color="blue.400" cursor="pointer">隐私政策</Box>
                    </Text>
                </MotionBox>

                {/* Bottom Branding */}
                <HStack mt={10} justify="center" gap={6} opacity={0.3}>
                     <Globe size={14} />
                     <Text fontSize="xs" fontWeight="black" letterSpacing="widest">POWERED BY PRISM R2</Text>
                     <Text fontSize="xs" fontWeight="black" letterSpacing="widest">•</Text>
                     <Text fontSize="xs" fontWeight="black" letterSpacing="widest">V2.0.0</Text>
                </HStack>
            </Container>
        </Box>
    );
};
