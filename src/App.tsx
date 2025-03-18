import React, { useState, useEffect, useRef } from 'react';
import {
  ChakraProvider,
  Box,
  Stack,
  Heading,
  Input,
  Button,
  Container,
  Text,
  useToast,
  Flex,
  Grid,
  GridItem,
  Skeleton,
  extendTheme,
  IconButton,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Badge,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
  Tag,
} from '@chakra-ui/react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient
} from '@tanstack/react-query';
import { TokenCard } from './components/TokenCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useTokenData } from './hooks/useTokenData';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { RepeatIcon, AddIcon, SearchIcon, CloseIcon, ChevronDownIcon, StarIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';

// Create animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 0px rgba(45, 156, 219, 0.2); }
  50% { box-shadow: 0 0 20px rgba(45, 156, 219, 0.6); }
  100% { box-shadow: 0 0 0px rgba(45, 156, 219, 0.2); }
`;

// Extend the theme for custom colors
const customTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#bae3ff',
      500: '#2d9cdb',
      600: '#1B76D4',
      700: '#1253a3',
    },
    accent: {
      light: '#252836',
      dark: '#1F1D2B',
    },
    bg: {
      dark: '#1F1D2B',
      darker: '#151320',
      card: '#252836',
      hover: '#2A2D3A',
      glass: 'rgba(37, 40, 54, 0.8)',
    }
  },
  styles: {
    global: {
      body: {
        bg: '#151320',
        color: '#E2E8F0',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(39, 94, 254, 0.1) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(45, 156, 219, 0.15) 0%, transparent 30%)',
        backgroundAttachment: 'fixed',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          transition: 'all 0.2s ease',
        },
        glass: {
          bg: 'rgba(45, 156, 219, 0.15)',
          backdropFilter: 'blur(12px)',
          color: 'white',
          borderWidth: '1px',
          borderColor: 'rgba(255,255,255,0.1)',
          _hover: {
            bg: 'rgba(45, 156, 219, 0.25)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease',
        }
      },
      defaultProps: {
        variant: 'primary',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
  },
});

// Set up framer motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionGrid = motion(Grid);
const MotionContainer = motion(Container);

// Configure the query client with rate limiting
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes (replaces cacheTime in Tanstack Query v4+)
    },
  },
});

// Get default tokens from environment and filter out duplicates
const rawTokens = process.env.REACT_APP_TOKEN_ADDRESSES?.split(',').filter(Boolean) || [];
const DEFAULT_TOKENS = Array.from(new Set(rawTokens)); // Remove duplicates using Array.from

// Header Component
interface HeaderProps {
  trackedTokens: string[];
  isRefreshing: boolean;
  refreshAllData: () => void;
  onAddToken: () => void;
}

const Header = ({ trackedTokens, isRefreshing, refreshAllData, onAddToken }: HeaderProps) => {
  return (
    <Flex 
      as={motion.div}
      align="center" 
      justify="space-between" 
      py={4} 
      mb={6}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        duration: 0.5,
        bounce: 0.1
      } as any}
    >
      <Flex align="center">
        <Heading 
          size="lg" 
          fontWeight="extrabold"
          bgGradient="linear(to-r, teal.400, cyan.400, blue.500)"
          bgClip="text"
          letterSpacing="tight"
        >
          Solana Token Tracker
        </Heading>
      </Flex>
      <HStack spacing={4}>
        {trackedTokens.length > 0 && (
          <Tooltip label="Refresh all data" aria-label="Refresh all data">
            <IconButton
              aria-label="Refresh data"
              icon={<RepeatIcon />}
              isLoading={isRefreshing}
              onClick={refreshAllData}
              variant="ghost"
              colorScheme="blue"
              size="md"
            />
          </Tooltip>
        )}
        <Button 
          leftIcon={<AddIcon />} 
          onClick={onAddToken}
          variant="glass"
          size="md"
        >
          Add Token
        </Button>
      </HStack>
    </Flex>
  );
};

// Stats Summary Component
interface StatsSummaryProps {
  trackedTokens: string[];
}

const StatsSummary = ({ trackedTokens }: StatsSummaryProps) => {
  // This would be calculated based on actual data
  const totalPortfolioValue = 73889.98;
  const dayChange = 2.34;
  
  return (
    <MotionBox
      bg="bg.glass"
      backdropFilter="blur(12px)"
      p={6}
      borderRadius="2xl"
      mb={8}
      borderWidth="1px"
      borderColor="rgba(255,255,255,0.08)"
      boxShadow="0 8px 32px rgba(0,0,0,0.1)"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        duration: 0.6,
        delay: 0.1,
        stiffness: 100
      }}
      as={motion.div}
      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        <GridItem>
          <Text color="gray.400" fontSize="sm" mb={1}>Portfolio Value</Text>
          <Heading 
            size="2xl" 
            fontWeight="bold" 
            bgGradient="linear(to-r, cyan.400, blue.500)" 
            bgClip="text"
          >
            ${totalPortfolioValue.toLocaleString()}
          </Heading>
          <Badge 
            colorScheme={dayChange >= 0 ? "green" : "red"} 
            fontSize="sm" 
            mt={2}
            px={2}
            py={1}
            borderRadius="md"
          >
            {dayChange >= 0 ? "↑" : "↓"} {Math.abs(dayChange)}% Today
          </Badge>
        </GridItem>
        <GridItem>
          <Text color="gray.400" fontSize="sm" mb={2}>Asset Allocation</Text>
          <Flex height="60px" align="flex-end" gap={1}>
            {/* This would be dynamic based on actual allocation */}
            <Box height="100%" width="20%" bg="cyan.500" borderRadius="md"></Box>
            <Box height="60%" width="20%" bg="blue.500" borderRadius="md"></Box>
            <Box height="40%" width="20%" bg="teal.500" borderRadius="md"></Box>
            <Box height="30%" width="20%" bg="green.500" borderRadius="md"></Box>
            <Box height="20%" width="20%" bg="purple.500" borderRadius="md"></Box>
          </Flex>
        </GridItem>
        <GridItem>
          <Text color="gray.400" fontSize="sm" mb={2}>Quick Stats</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <Box>
              <Text fontSize="xs" color="gray.500">Tokens</Text>
              <Text fontWeight="bold" fontSize="lg">{trackedTokens.length}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">Wallets</Text>
              <Text fontWeight="bold" fontSize="lg">25</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">Best Performer</Text>
              <Text fontWeight="bold" fontSize="sm" color="green.400">OI (+14.94%)</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">Worst Performer</Text>
              <Text fontWeight="bold" fontSize="sm" color="red.400">USDC (+0.01%)</Text>
            </Box>
          </Grid>
        </GridItem>
      </Grid>
    </MotionBox>
  );
};

// Add Token Drawer Component
interface AddTokenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tokenMint: string;
  setTokenMint: (value: string) => void;
}

const AddTokenDrawer = ({ isOpen, onClose, onSubmit, tokenMint, setTokenMint }: AddTokenDrawerProps) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay backdropFilter="blur(8px)" bg="rgba(0,0,0,0.6)" />
      <DrawerContent bg="bg.dark" borderLeftWidth="1px" borderColor="gray.700">
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
          <Flex justify="space-between" align="center">
            <Text>Add New Token</Text>
            <IconButton 
              icon={<CloseIcon />} 
              size="sm" 
              aria-label="Close" 
              onClick={onClose} 
              variant="ghost"
            />
          </Flex>
        </DrawerHeader>

        <DrawerBody py={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text mb={2} fontSize="sm" color="gray.400">
                Enter a Solana token mint address to start tracking
              </Text>
              <Input
                placeholder="Enter token mint address"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                size="lg"
                borderColor="gray.600"
                bg="bg.darker"
                _hover={{ borderColor: "gray.500" }}
              />
            </Box>
            
            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium" color="gray.300">Popular Tokens</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                <Button variant="outline" size="sm" justifyContent="flex-start" leftIcon={<StarIcon color="yellow.400" />}>
                  SOL (Solana)
                </Button>
                <Button variant="outline" size="sm" justifyContent="flex-start" leftIcon={<StarIcon color="yellow.400" />}>
                  BONK
                </Button>
                <Button variant="outline" size="sm" justifyContent="flex-start" leftIcon={<StarIcon color="yellow.400" />}>
                  JUP (Jupiter)
                </Button>
                <Button variant="outline" size="sm" justifyContent="flex-start" leftIcon={<StarIcon color="yellow.400" />}>
                  USDC
                </Button>
              </Grid>
            </Box>
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor="gray.700">
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={onSubmit}>
            Add Token
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

function AppContent() {
  const [tokenMint, setTokenMint] = useState('');
  const [trackedTokens, setTrackedTokens] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterView, setFilterView] = useState('grid');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const gridControls = useAnimation();

  // Load default tokens when app starts
  useEffect(() => {
    if (DEFAULT_TOKENS.length > 0 && trackedTokens.length === 0) {
      setTrackedTokens(DEFAULT_TOKENS);
    }
  }, [trackedTokens.length]);

  // Handle token submission
  const handleSubmit = () => {
    if (!tokenMint) {
      toast({
        title: 'Error',
        description: 'Please enter a token mint address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check if token is already tracked
    if (trackedTokens.includes(tokenMint)) {
      toast({
        title: 'Token already tracked',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      setTokenMint('');
      onClose();
      return;
    }
    
    // Add token to tracked tokens
    setTrackedTokens(prev => [...prev, tokenMint]);
    setTokenMint('');
    onClose();
    
    toast({
      title: 'Token added',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Function to refresh all token data
  const refreshAllData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Animate the grid during refresh
      await gridControls.start({
        opacity: 0.7,
        scale: 0.98,
        transition: { duration: 0.3 }
      });
      
      // Invalidate and refetch queries for all tracked tokens
      const refreshPromises = trackedTokens.map(token => 
        queryClient.invalidateQueries({queryKey: ['tokenData', token]})
      );
      
      await Promise.all(refreshPromises);
      
      // Animate back
      await gridControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3 }
      });
      
      toast({
        title: 'Data refreshed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh token data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Determine number of columns based on screen size
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  return (
    <Box minH="100vh" pt={4} pb={12}>
      <Container maxW="container.xl">
        {/* Header */}
        <Header 
          trackedTokens={trackedTokens} 
          isRefreshing={isRefreshing} 
          refreshAllData={refreshAllData}
          onAddToken={onOpen}
        />
        
        {/* Token Add Drawer */}
        <AddTokenDrawer
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleSubmit}
          tokenMint={tokenMint}
          setTokenMint={setTokenMint}
        />
        
        {/* Portfolio Summary */}
        {trackedTokens.length > 0 && (
          <StatsSummary trackedTokens={trackedTokens} />
        )}
        
        {/* Token List Filters */}
        {trackedTokens.length > 0 && (
          <MotionFlex 
            justify="space-between" 
            mb={6}
            align="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              type: "tween",
              duration: 0.4, 
              ease: "easeOut",
              delay: 0.3 
            }}
          >
            <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
              <TabList>
                <Tab>All Tokens</Tab>
                <Tab>Portfolio</Tab>
                <Tab>Watchlist</Tab>
              </TabList>
            </Tabs>
            
            <HStack>
              <IconButton
                aria-label="Grid View"
                icon={<Box w="16px" h="16px" bg="currentColor" borderRadius="sm" />}
                variant={filterView === 'grid' ? 'solid' : 'ghost'}
                size="sm"
                colorScheme={filterView === 'grid' ? 'blue' : 'gray'}
                onClick={() => setFilterView('grid')}
              />
              <IconButton
                aria-label="List View"
                icon={<Box 
                  w="16px" 
                  h="16px" 
                  position="relative" 
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: '2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    bg: 'currentColor',
                    borderRadius: 'full'
                  }}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    bg: 'currentColor',
                    borderRadius: 'full'
                  }}
                >
                  <Box position="absolute" top="50%" left={0} right={0} height="2px" bg="currentColor" borderRadius="full" transform="translateY(-50%)" />
                </Box>}
                variant={filterView === 'list' ? 'solid' : 'ghost'}
                size="sm"
                colorScheme={filterView === 'list' ? 'blue' : 'gray'}
                onClick={() => setFilterView('list')}
              />
            </HStack>
          </MotionFlex>
        )}

        {/* Display all tracked tokens */}
        {trackedTokens.length > 0 ? (
          <MotionGrid
            templateColumns={filterView === 'grid' 
              ? { base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }
              : "1fr"
            }
            gap={6}
            animate={gridControls}
            initial={{ opacity: 1, y: 0 }}
            style={{ opacity: 1 }}
          >
            <AnimatePresence>
              {trackedTokens.map((token, index) => (
                <MotionBox 
                  key={token}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ opacity: 1 }}
                >
                  <TokenContainer tokenMint={token} />
                </MotionBox>
              ))}
            </AnimatePresence>
          </MotionGrid>
        ) : (
          <MotionBox 
            bg="bg.glass"
            backdropFilter="blur(12px)"
            p={8} 
            borderRadius="2xl" 
            textAlign="center" 
            borderWidth="1px"
            borderColor="rgba(255,255,255,0.08)"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            style={{ opacity: 1 }}
          >
            <VStack spacing={6}>
              <MotionBox
                animate={{ 
                  y: [0, -10, 0],
                  transition: { 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut",
                    repeatType: "reverse"
                  }
                }}
              >
                <Box 
                  as="img" 
                  src="/logo192.png" 
                  alt="Solana Token Tracker" 
                  w="80px" 
                  opacity={0.8} 
                />
              </MotionBox>
              <VStack spacing={3}>
                <Text color="gray.400" fontSize="lg">
                  No tokens tracked yet.
                </Text>
                <Button 
                  leftIcon={<AddIcon />} 
                  onClick={onOpen} 
                  variant="glass"
                  size="md"
                  _hover={{
                    boxShadow: "0 0 20px rgba(45, 156, 219, 0.4)"
                  }}
                >
                  Add your first token
                </Button>
              </VStack>
            </VStack>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}

// Component to load and display data for tokens with loading state
function TokenContainer({ tokenMint }: { tokenMint: string }) {
  const [WALLET_ADDRESSES] = useState(() => 
    process.env.REACT_APP_WALLET_ADDRESSES?.split(',').filter(Boolean) || []
  );
  
  const { data, isLoading, isError, error } = useTokenData(tokenMint, WALLET_ADDRESSES, true);

  if (isLoading) {
    return (
      <Box 
        borderWidth="1px" 
        borderRadius="xl" 
        overflow="hidden" 
        boxShadow="sm" 
        bg="bg.glass"
        backdropFilter="blur(12px)"
        borderColor="rgba(255,255,255,0.08)"
        h="100%"
        transition="all 0.2s"
        _hover={{ boxShadow: "md" }}
      >
        <Box bg="rgba(37, 40, 54, 0.9)" p={4} borderBottomWidth="1px" borderColor="gray.700">
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold" fontSize="lg" color="gray.100">
              {tokenMint.slice(0, 6)}...{tokenMint.slice(-6)}
            </Text>
          </Flex>
        </Box>
        <Skeleton height="120px" p={4} startColor="gray.700" endColor="gray.600" />
        <Skeleton height="100px" p={4} mt={2} startColor="gray.700" endColor="gray.600" />
      </Box>
    );
  }
  
  if (isError || !data) {
    return (
      <Box 
        borderWidth="1px" 
        borderRadius="xl" 
        overflow="hidden" 
        boxShadow="sm" 
        bg="bg.glass"
        backdropFilter="blur(12px)"
        borderColor="rgba(255,255,255,0.08)"
        p={4}
        h="100%"
        transition="all 0.2s"
      >
        <Text color="red.400">Error loading data for {tokenMint.slice(0, 6)}...{tokenMint.slice(-6)}</Text>
        <Text fontSize="sm" color="gray.400">{error instanceof Error ? error.message : 'Unknown error'}</Text>
      </Box>
    );
  }
  
  return <TokenCard data={data} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={customTheme}>
        <AppContent />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
