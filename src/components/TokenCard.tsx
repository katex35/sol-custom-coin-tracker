import React, { useState, useMemo } from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  Collapse,
  IconButton,
  Button,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useJupiterSimulation } from '../hooks/useJupiterSimulation';
import { formatCurrency, formatPrice, truncateAddress, formatBalance } from '../utils/formatters';
import { TokenData, WalletBalance } from '../types';

interface TokenCardProps {
  data: TokenData;
}

export const TokenCard: React.FC<TokenCardProps> = ({ data }) => {
  const { info, walletBalances, totalValue, tokenMint } = data;
  const [showAllWallets, setShowAllWallets] = useState(false);

  // Get total token balance across all wallets
  const totalBalance = useMemo(() => {
    return walletBalances.reduce((sum: number, wallet: WalletBalance) => sum + wallet.balance, 0);
  }, [walletBalances]);

  // Skip Jupiter simulation for USDC
  const isUSDC = info?.symbol === 'USDC' || tokenMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  
  // Use Jupiter simulation if there's a balance to simulate and it's not USDC
  const jupiterSimulation = useJupiterSimulation(
    tokenMint,
    totalBalance,
    !isUSDC && totalBalance > 0
  );

  const visibleWallets = showAllWallets ? walletBalances : walletBalances.slice(0, 3);
  const hiddenWalletsCount = walletBalances.length - 3;

  return (
    <Box
      bg="white"
      p={{ base: 3, md: 4 }}
      borderRadius={{ base: "md", md: "lg" }}
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      {/* Mobile and Desktop Layout */}
      <VStack spacing={3} align="stretch">
        {/* Header Row */}
        <HStack justify="space-between" align="center">
          {/* Token Info */}
          <VStack align="start" spacing={0} flex="1">
            <Text 
              fontSize={{ base: "sm", md: "md" }} 
              fontWeight="bold" 
              color="gray.900"
              noOfLines={1}
            >
              {info?.name || 'Unknown Token'}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {info?.symbol || 'N/A'}
            </Text>
          </VStack>
          
          {/* Price & Change */}
          <VStack align="end" spacing={1}>
            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color="gray.900">
              {formatPrice(info?.price)}
            </Text>
            <Badge
              colorScheme={info?.priceChange24h && info.priceChange24h >= 0 ? 'green' : 'red'}
              variant="solid"
              fontSize="xs"
              size="sm"
            >
              {info?.priceChange24h ? `${info.priceChange24h >= 0 ? '+' : ''}${info.priceChange24h.toFixed(2)}%` : 'N/A'}
            </Badge>
          </VStack>
        </HStack>

        {/* Stats Row */}
        <HStack justify="space-between" spacing={4}>
          {/* Market Cap */}
          <Box flex="1" textAlign="center" bg="gray.50" p={2} borderRadius="md">
            <Text fontSize="xs" color="gray.600" mb={1}>Market Cap</Text>
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold" color="gray.800">
              {info?.marketCap ? formatCurrency(info.marketCap) : 'N/A'}
            </Text>
          </Box>

          {/* Portfolio Holdings */}
          <Box flex="1" textAlign="center" bg="blue.50" p={2} borderRadius="md">
            <Text fontSize="xs" color="blue.600" mb={1}>Portfolio Value</Text>
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color="blue.800">
              {formatCurrency(totalValue)}
            </Text>
            <Text fontSize="xs" color="blue.600">
              {formatBalance(totalBalance)} {info?.symbol}
            </Text>
          </Box>
        </HStack>

        {/* Additional Info Row - Sell Simulation & Wallet Count */}
        <HStack justify="space-between" spacing={4}>
          {/* Sell Simulation - Only show if not USDC */}
          {!isUSDC && (
            <Box flex="1" textAlign="center" bg="green.50" p={2} borderRadius="md">
              <Text fontSize="xs" color="green.600" mb={1}>Sell Simulation</Text>
              {jupiterSimulation.loading ? (
                <Text fontSize="xs" color="gray.500">Loading...</Text>
              ) : jupiterSimulation.data ? (
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color="green.700">
                  {formatCurrency(jupiterSimulation.data.outAmount)}
                </Text>
              ) : (
                <Text fontSize="xs" color="gray.500">N/A</Text>
              )}
            </Box>
          )}

          {/* Wallet Count & Expand Button */}
          <Box flex="1" textAlign="center">
            <HStack justify="center" spacing={2}>
              <Text fontSize="xs" color="gray.600">
                {walletBalances.length} wallet{walletBalances.length !== 1 ? 's' : ''}
              </Text>
              <IconButton
                aria-label={showAllWallets ? "Hide wallet details" : "Show wallet details"}
                icon={showAllWallets ? <ChevronUpIcon /> : <ChevronDownIcon />}
                size="xs"
                variant="ghost"
                onClick={() => setShowAllWallets(!showAllWallets)}
              />
            </HStack>
          </Box>
        </HStack>
      </VStack>

      {/* Collapsible Wallet Details */}
      <Collapse in={showAllWallets} animateOpacity>
        <Box mt={3} pt={3} borderTop="1px" borderColor="gray.100">
          <VStack spacing={2} align="stretch">
            {walletBalances.map((wallet, index) => (
              <HStack 
                key={index} 
                justify="space-between" 
                p={{ base: 2, md: 3 }} 
                bg="gray.50" 
                borderRadius="md"
                flexWrap={{ base: "wrap", md: "nowrap" }}
                spacing={{ base: 2, md: 4 }}
              >
                <Text 
                  fontSize="xs" 
                  color="gray.600" 
                  fontFamily="mono"
                  flex={{ base: "1 1 100%", md: "0 0 auto" }}
                  mb={{ base: 1, md: 0 }}
                >
                  {truncateAddress(wallet.address)}
                </Text>
                <HStack spacing={4} flex={{ base: "1 1 100%", md: "0 0 auto" }} justify="space-between">
                  <Text fontSize="xs" color="gray.700">
                    {formatBalance(wallet.balance)} {info?.symbol}
                  </Text>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {formatCurrency(wallet.value)}
                  </Text>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};
