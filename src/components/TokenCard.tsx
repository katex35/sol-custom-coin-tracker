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
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      {/* Compact Token Row Layout */}
      <HStack spacing={6} align="center" justify="space-between">
        {/* Token Info - Left */}
        <HStack spacing={3} flex="0 0 180px">
          <Box>
            <Text fontSize="md" fontWeight="bold" color="gray.900">
              {info?.name || 'Unknown Token'}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {info?.symbol || 'N/A'}
            </Text>
          </Box>
        </HStack>
        
        {/* Price & Change */}
        <Box flex="0 0 100px" textAlign="center">
          <Text fontSize="sm" fontWeight="bold" color="gray.900">
            {formatPrice(info?.price)}
          </Text>
          <Badge
            colorScheme={info?.priceChange24h && info.priceChange24h >= 0 ? 'green' : 'red'}
            variant="subtle"
            fontSize="xs"
          >
            {info?.priceChange24h ? `${info.priceChange24h >= 0 ? '+' : ''}${info.priceChange24h.toFixed(2)}%` : 'N/A'}
          </Badge>
        </Box>

        {/* Market Cap */}
        <Box flex="0 0 100px" textAlign="center">
          <Text fontSize="xs" color="gray.600">Market Cap</Text>
          <Text fontSize="sm" fontWeight="semibold" color="gray.800">
            {info?.marketCap ? formatCurrency(info.marketCap) : 'N/A'}
          </Text>
        </Box>

        {/* Portfolio Holdings */}
        <Box flex="0 0 120px" textAlign="center">
          <Text fontSize="xs" color="gray.600">Portfolio ({walletBalances.length} wallets)</Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.900">
            {formatCurrency(totalValue)}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {formatBalance(totalBalance)} {info?.symbol}
          </Text>
        </Box>

        {/* Sell Simulation - Only show if not USDC */}
        {!isUSDC && (
          <Box flex="0 0 100px" textAlign="center">
            <Text fontSize="xs" color="gray.600">Sell Simulation</Text>
            {jupiterSimulation.loading ? (
              <Text fontSize="sm" color="gray.500">Loading...</Text>
            ) : jupiterSimulation.data ? (
              <Text fontSize="sm" fontWeight="bold" color="blue.600">
                {formatCurrency(jupiterSimulation.data.outAmount)}
              </Text>
            ) : (
              <Text fontSize="sm" color="gray.500">N/A</Text>
            )}
          </Box>
        )}

        {/* Wallet Expand Button */}
        <Box flex="0 0 80px" textAlign="right">
          <IconButton
            aria-label={showAllWallets ? "Show less wallets" : "Show all wallets"}
            icon={showAllWallets ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="sm"
            variant="ghost"
            onClick={() => setShowAllWallets(!showAllWallets)}
          />
        </Box>
      </HStack>

      {/* Collapsible Wallet Details */}
      <Collapse in={showAllWallets} animateOpacity>
        <Box mt={4} pt={4} borderTop="1px" borderColor="gray.100">
          <VStack spacing={2} align="stretch">
            {walletBalances.map((wallet, index) => (
              <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                  {truncateAddress(wallet.address)}
                </Text>
                <HStack spacing={4}>
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
