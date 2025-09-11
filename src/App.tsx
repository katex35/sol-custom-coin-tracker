import React, { useState } from 'react';
import { ChakraProvider, Container, Box, useToast, useDisclosure } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { TokenProvider, useTokenContext } from './contexts/TokenContext';
import { Header } from './components/layout/Header';
import { PortfolioSummary } from './components/portfolio/PortfolioSummary';
import { TokenGrid } from './components/tokens/TokenGrid';
import { AddTokenDrawer } from './components/tokens/AddTokenDrawer';

// Configure the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    },
  },
});

// Main App Content Component
const AppContent: React.FC = () => {
  const [tokenMint, setTokenMint] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const {
    trackedTokens,
    addToken,
    refreshAllTokens,
    isRefreshing,
    getTotalPortfolioValue,
  } = useTokenContext();

  const handleSubmit = () => {
    if (!tokenMint.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a token mint address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
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
    
    addToken(tokenMint);
    setTokenMint('');
    onClose();
    
    toast({
      title: 'Token added successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRefresh = async () => {
    try {
      await refreshAllTokens();
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
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="100%" px={6} py={6}>
        <Header
          trackedTokensCount={trackedTokens.length}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onAddToken={onOpen}
        />
        
        <Box display="flex" gap={6} mt={6} maxW="100%">
          {/* Left Column - Portfolio Summary */}
          <Box flex="0 0 500px">
            {trackedTokens.length > 0 && (
              <PortfolioSummary
                portfolioData={getTotalPortfolioValue()}
                tokensCount={trackedTokens.length}
              />
            )}
          </Box>
          
          {/* Right Column - Token Grid */}
          <Box flex="1" minW="0">
            <TokenGrid tokens={trackedTokens} onAddToken={onOpen} />
          </Box>
        </Box>
        
        <AddTokenDrawer
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleSubmit}
          tokenMint={tokenMint}
          setTokenMint={setTokenMint}
        />
      </Box>
    </Box>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <TokenProvider>
          <AppContent />
        </TokenProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
