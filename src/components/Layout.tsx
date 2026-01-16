import React from 'react';
import { Box, Flex, VStack, Text, IconButton, Container, Heading, Separator, Badge, Button } from '@chakra-ui/react';
import { LogOut, RefreshCw, User, HardDrive, Settings } from 'lucide-react';
import { SidebarStats } from './SidebarStats';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'files' | 'config';
    onTabChange: (tab: 'files' | 'config') => void;
    onRefresh?: () => void;
    onUpload?: (file: File) => void;
    onLogout?: () => void;
    connectionStatus: 'online' | 'offline' | 'checking';
    stats?: {
        fileCount: number;
        totalSize: number;
        bucketName: string;
    };
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onRefresh,
    onUpload,
    onLogout,
    connectionStatus,
    stats
}) => {
    const sidebarWidth = "280px";
    return (
        <Flex minH="100vh" bg="bg.DEFAULT">
            {/* Sidebar */}
            <Box 
                w={{ base: 0, lg: sidebarWidth }} 
                display={{ base: "none", lg: "block" }}
                position="fixed" 
                h="100vh" 
                borderRightWidth="1px" 
                borderColor="border.DEFAULT"
                bg="bg.panel"
                zIndex={50}
            >
                <Flex direction="column" h="full" p={6}>
                    {/* Brand */}
                    <Flex align="center" gap={3} mb={10}>
                        <Box 
                            w={10} h={10} 
                            bgGradient="to-br" gradientFrom="brand.500" gradientTo="brand.700" 
                            borderRadius="xl" 
                            display="flex" alignItems="center" justifyContent="center"
                            shadow="lg"
                        >
                            <img src="/logo.svg" alt="Logo" style={{ width: '60%', height: '60%', filter: 'brightness(0) invert(1)' }} />
                        </Box>
                        <Heading size="lg" fontWeight="bold" letterSpacing="tight">Prism R2</Heading>
                    </Flex>
                    <VStack align="stretch" gap={2} flex={1}>
                        <NavButton 
                            icon={HardDrive} 
                            label="文件管理" 
                            isActive={activeTab === 'files'} 
                            onClick={() => onTabChange('files')} 
                        />
                        <NavButton 
                            icon={Settings} 
                            label="存储桶配置" 
                            isActive={activeTab === 'config'} 
                            onClick={() => onTabChange('config')} 
                        />
                    </VStack>
                    {/* Footer / Status */}
                    <VStack align="stretch" gap={4}>
                         {stats && activeTab === 'files' && (
                             <SidebarStats 
                                 fileCount={stats.fileCount} 
                                 totalSize={stats.totalSize} 
                                 bucketName={stats.bucketName}
                                 onRefresh={onRefresh}
                                 onUpload={onUpload}
                             />
                         )}

                         {/* Connection Status */}
                         <Flex align="center" justify="space-between" bg="bg.subtle" p={3} borderRadius="lg">
                            <Text fontSize="sm" fontWeight="medium" color="fg.muted">状态</Text>
                            <Badge 
                                colorPalette={connectionStatus === 'online' ? 'green' : connectionStatus === 'checking' ? 'yellow' : 'red'} 
                                variant="surface"
                            >
                                {connectionStatus === 'online' ? '在线' : connectionStatus === 'checking' ? '连接中...' : '离线'}
                            </Badge>
                        </Flex>

                        <Separator borderColor="border.DEFAULT" />

                        {/* User Profile */}
                        <Flex align="center" gap={3} p={2}>
                            <Box w={10} h={10} borderRadius="full" bg="brand.100" color="brand.600" display="flex" alignItems="center" justifyContent="center">
                                <User size={20} />
                            </Box>
                            <Box flex={1}>
                                <Text fontSize="sm" fontWeight="bold">Admin User</Text>
                                <Text fontSize="xs" color="fg.muted">Logged in</Text>
                            </Box>
                            <IconButton 
                                aria-label="Logout" 
                                variant="ghost" 
                                colorPalette="red" 
                                size="sm" 
                                onClick={onLogout}
                            >
                                <LogOut size={18} />
                            </IconButton>
                        </Flex>
                    </VStack>
                </Flex>
            </Box>

            {/* Mobile Header (Visible only on small screens) */}
            <Flex 
                display={{ base: "flex", lg: "none" }} 
                position="fixed" top={0} left={0} right={0} 
                h="16" bg="bg.panel" borderBottomWidth="1px" borderColor="border.DEFAULT" 
                zIndex={40} alignItems="center" justify="space-between" px={4}
            >
                <Flex align="center" gap={3}>
                     <Box w={8} h={8} bgGradient="to-br" gradientFrom="brand.500" gradientTo="brand.700" borderRadius="lg" />
                     <Heading size="md">Prism R2</Heading>
                </Flex>
                <IconButton aria-label="Menu" variant="ghost">
                    <Settings size={20} />
                </IconButton>
            </Flex>

            {/* Main Content */}
            <Box 
                ml={{ base: 0, lg: sidebarWidth }} 
                flex={1} 
                pt={{ base: 16, lg: 0 }}
                w="full"
            >
                 {/* Top Bar in Main Content */}
                <Flex 
                    h="20" px={8} 
                    align="center" justify="space-between" 
                    borderBottomWidth="1px" borderColor="border.DEFAULT"
                    bg="bg.DEFAULT/50" backdropFilter="blur(10px)"
                    position="sticky" top={0} zIndex={40}
                >
                    <Heading size="xl" fontWeight="semibold">
                        {activeTab === 'files' ? 'Dashboard' : 'Settings'}
                    </Heading>
                    
                    <Flex gap={3}>
                        {onRefresh && activeTab === 'files' && (
                             <Button 
                                variant="ghost" 
                                onClick={onRefresh}
                                disabled={connectionStatus === 'checking'}
                             >
                                <RefreshCw size={18} className={connectionStatus === 'checking' ? 'animate-spin' : ''} />
                                <Text ml={2}>刷新</Text>
                             </Button>
                        )}
                    </Flex>
                </Flex>

                <Container maxW="full" p={8}>
                    {children}
                </Container>
            </Box>
        </Flex>
    );
};

const NavButton = ({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => (
    <Button
        variant="ghost"
        justifyContent="flex-start"
        h="12"
        px={4}
        bg={isActive ? "brand.500" : "transparent"}
        color={isActive ? "white" : "fg.muted"}
        _hover={{ bg: isActive ? "brand.600" : "bg.subtle", color: isActive ? "white" : "fg.DEFAULT" }}
        onClick={onClick}
        borderRadius="xl"
    >
        <Icon size={20} style={{ marginRight: '12px' }} />
        <Text fontWeight={isActive ? "semibold" : "medium"}>{label}</Text>
    </Button>
);
