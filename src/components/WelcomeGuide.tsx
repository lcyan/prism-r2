import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Box as BoxIcon, ShieldCheck, Zap, Globe, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Center,
    Portal,
} from '@chakra-ui/react';

const MotionBox = motion.create(Box);

interface WelcomeGuideProps {
    onStart: () => void;
    isVisible: boolean;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onStart, isVisible }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: t('welcome.title'),
            desc: t('welcome.desc1'),
            icon: <BoxIcon size={40} color="blue" />,
            color: "blue.500"
        },
        {
            title: t('welcome.step1'),
            desc: t('welcome.desc2'),
            icon: <ShieldCheck size={40} color="green" />,
            color: "green.500"
        },
        {
            title: t('welcome.step2'),
            desc: t('welcome.desc3'),
            icon: <Zap size={40} color="orange" />,
            color: "orange.500"
        },
        {
            title: t('welcome.step3'),
            desc: t('welcome.desc4'),
            icon: <Globe size={40} color="purple" />,
            color: "purple.500"
        }
    ];

    if (!isVisible) return null;

    return (
        <Portal>
            <AnimatePresence>
                <Center
                    position="fixed"
                    inset={0}
                    zIndex={100}
                    p={6}
                    bg={{ base: "gray.50", _dark: "black" }}
                >
                    <MotionBox
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        bg={{ base: "whiteAlpha.800", _dark: "whiteAlpha.50" }}
                        backdropFilter="blur(30px)"
                        maxW="2xl"
                        w="full"
                        borderRadius="3xl"
                        p={12}
                        shadow="2xl"
                        position="relative"
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        textAlign="center"
                        borderWidth="1px"
                        borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
                    >
                        {/* Background Gradient Blobs */}
                        <Box
                            position="absolute"
                            top="-24"
                            right="-24"
                            w={64}
                            h={64}
                            bg={steps[step].color}
                            opacity={0.1}
                            filter="blur(80px)"
                            borderRadius="full"
                        />
                        <Box
                            position="absolute"
                            bottom="-24"
                            left="-24"
                            w={64}
                            h={64}
                            bg={steps[step].color}
                            opacity={0.05}
                            filter="blur(80px)"
                            borderRadius="full"
                        />

                        <AnimatePresence mode="wait">
                            <MotionBox
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                gap={8}
                                position="relative"
                                zIndex={10}
                            >
                                <Center
                                    p={8}
                                    bg={{ base: "whiteAlpha.800", _dark: "whiteAlpha.100" }}
                                    backdropFilter="blur(10px)"
                                    borderRadius="3xl"
                                    shadow="2xl"
                                    transform="rotate(3deg)"
                                    _hover={{ transform: "rotate(0deg)" }}
                                    transition="transform 0.5s"
                                >
                                    {steps[step].icon}
                                </Center>

                                <VStack gap={4}>
                                    <Heading size="4xl" fontWeight="bold" letterSpacing="tighter">
                                        {steps[step].title}
                                    </Heading>
                                    <Text fontSize="lg" fontWeight="bold" color="fg.muted" maxW="md" lineHeight="relaxed">
                                        {steps[step].desc}
                                    </Text>
                                </VStack>
                            </MotionBox>
                        </AnimatePresence>

                        <HStack gap={2} mt={12} mb={12}>
                            {steps.map((_, i) => (
                                <Box
                                    key={i}
                                    h={1.5}
                                    transition="all 0.5s"
                                    borderRadius="full"
                                    w={i === step ? 8 : 1.5}
                                    bg={i === step ? "blue.500" : "border.subtle"}
                                    shadow={i === step ? "0 0 10px rgba(59, 130, 246, 0.4)" : "none"}
                                />
                            ))}
                        </HStack>

                        <HStack gap={4} w="full">
                            {step < steps.length - 1 ? (
                                <Button
                                    flex={1}
                                    h={16}
                                    borderRadius="2xl"
                                    colorPalette="blue"
                                    fontWeight="bold"
                                    fontSize="lg"
                                    onClick={() => setStep(step + 1)}
                                >
                                    {t('welcome.next')}
                                    <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                                </Button>
                            ) : (
                                <Button
                                    flex={1}
                                    h={16}
                                    borderRadius="2xl"
                                    colorPalette="blue"
                                    fontWeight="bold"
                                    fontSize="lg"
                                    onClick={onStart}
                                    shadow="2xl"
                                    _hover={{ transform: "scale(1.02)" }}
                                    _active={{ transform: "scale(0.98)" }}
                                >
                                    <Rocket size={22} style={{ marginRight: '8px' }} />
                                    {t('welcome.getStarted')}
                                </Button>
                            )}
                        </HStack>

                        <Button
                            variant="ghost"
                            mt={6}
                            fontSize="sm"
                            fontWeight="bold"
                            color="fg.muted"
                            _hover={{ color: "fg.default" }}
                            onClick={onStart}
                        >
                            {t('welcome.skip')}
                        </Button>
                    </MotionBox>
                </Center>
            </AnimatePresence>
        </Portal>
    );
};
