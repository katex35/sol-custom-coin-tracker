import React, { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  IconButton,
  Collapse,
  Tag,
  Button,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { TokenData } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useJupiterSimulation } from '../hooks/useJupiterSimulation';
import { formatBalance, formatCurrency, formatPrice, truncateAddress } from '../utils/formatters';

// 1. Card Header Component
interface CardHeaderProps {
  name: string;
  symbol: string;
  tokenMint: string;
  priceChange24h: number;
}

const CardHeader: React.FC<CardHeaderProps> = ({ name, symbol, tokenMint, priceChange24h }) => (
  <Box 
    as={motion.div}
    bg="accent.light" 
    p={5} 
    borderBottomWidth="1px"
    borderColor="gray.700"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{ 
      transitionDuration: "0.6s",
      transitionDelay: "0.1s"
    }}
  >
    <Flex justify="space-between" align="center">
      <Flex 
        as={motion.div}
        direction="column"
        align="flex-start" 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{ 
          transitionDuration: "0.5s",
          transitionDelay: "0.2s"
        }}
      >
        <Text 
          fontWeight="bold" 
          fontSize="xl" 
          color="gray.100"
          letterSpacing="tight"
        >
          {name}
        </Text>
        <Flex align="center" gap={2} mt={1}>
          <Tag size="sm" variant="solid" colorScheme="teal">
            {symbol}
          </Tag>
          <Text fontSize="xs" color="gray.400" fontFamily="mono">
            {tokenMint.slice(0, 6)}...{tokenMint.slice(-6)}
          </Text>
        </Flex>
      </Flex>
      
      <Badge 
        as={motion.div}
        colorScheme={priceChange24h >= 0 ? 'green' : 'red'} 
        fontSize="sm" 
        py={1.5} 
        px={3} 
        borderRadius="full"
        fontWeight="medium"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          transitionDuration: "0.5s",
          transitionDelay: "0.3s"
        }}
        _hover={{ transform: "scale(1.05)" }}
      >
        {priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceChange24h).toFixed(2)}%
      </Badge>
    </Flex>
  </Box>
);

// 2. Token Stats Component
interface TokenStatsProps {
  price: number;
  priceChange24h: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
}

const TokenStats: React.FC<TokenStatsProps> = ({ price, priceChange24h, marketCap, liquidity, volume24h }) => (
  <Box
    as={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{ 
      transitionDuration: "0.5s",
      transitionDelay: "0.4s"
    }}
  >
    <Grid templateColumns="repeat(4, 1fr)" gap={0}>
      <GridItem colSpan={2} p={5} borderRightWidth="1px" borderColor="gray.700">
        <Stat>
          <StatLabel color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Price</StatLabel>
          <StatNumber fontSize="xl" color="cyan.400" fontWeight="bold">
            {formatPrice(price)}
          </StatNumber>
          <StatHelpText mb={0} color="gray.400">
            {priceChange24h !== 0 && (
              <Flex align="center">
                <StatArrow type={priceChange24h >= 0 ? 'increase' : 'decrease'} />
                <Text fontSize="sm">{Math.abs(priceChange24h).toFixed(2)}%</Text>
              </Flex>
            )}
          </StatHelpText>
        </Stat>
      </GridItem>
      
      <GridItem colSpan={2} p={5}>
        <Stat>
          <StatLabel color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Market Cap</StatLabel>
          <StatNumber fontSize="xl" fontWeight="semibold">
            {marketCap > 0 
              ? formatCurrency(marketCap)
              : 'N/A'
            }
          </StatNumber>
        </Stat>
      </GridItem>
    </Grid>
    
    <Divider borderColor="gray.700" />
    
    <Grid templateColumns="repeat(2, 1fr)" gap={0}>
      <GridItem colSpan={1} p={5} borderRightWidth="1px" borderColor="gray.700">
        <Stat>
          <StatLabel color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Liquidity</StatLabel>
          <StatNumber fontSize="lg" fontWeight="semibold">
            {liquidity > 0 
              ? formatCurrency(liquidity)
              : 'N/A'
            }
          </StatNumber>
        </Stat>
      </GridItem>
      
      <GridItem colSpan={1} p={5}>
        <Stat>
          <StatLabel color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">24h Volume</StatLabel>
          <StatNumber fontSize="lg" fontWeight="semibold">
            {volume24h > 0 
              ? formatCurrency(volume24h)
              : 'N/A'
            }
          </StatNumber>
        </Stat>
      </GridItem>
    </Grid>
  </Box>
);

// 3. Wallet List Component
interface WalletListProps {
  wallets: Array<{
    address: string;
    balance: number;
    value: number;
  }>;
  showAllWallets: boolean;
  setShowAllWallets: (value: boolean) => void;
}

const WalletList: React.FC<WalletListProps> = ({ wallets, showAllWallets, setShowAllWallets }) => {
  // Calculate wallet display count
  const walletDisplayCount = showAllWallets ? wallets.length : 3;
  const walletsToShow = wallets.slice(0, walletDisplayCount);
  const hasMoreWallets = wallets.length > 3;

  return (
    <Box bg="bg.darker" borderRadius="md" p={3} mt={2} mb={4}>
      {walletsToShow.map((balance, index) => (
        <Flex 
          key={balance.address} 
          justify="space-between" 
          py={2}
          borderBottomWidth={index < walletsToShow.length - 1 ? "1px" : "0"}
          borderColor="gray.700"
          as={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            transitionDuration: "0.3s",
            transitionDelay: `${0.1 * index}s`
          }}
        >
          <Text fontSize="sm" fontFamily="mono" color="gray.400">
            {truncateAddress(balance.address)}
          </Text>
          <Flex>
            <Text fontSize="sm" color="gray.400" mr={2}>{formatBalance(balance.balance)}</Text>
            <Text fontSize="sm" fontWeight="medium" color={balance.value > 100 ? "green.400" : "gray.300"}>
              ${balance.value.toFixed(2)}
            </Text>
          </Flex>
        </Flex>
      ))}
      
      {hasMoreWallets && (
        <Button 
          variant="ghost" 
          size="xs" 
          width="full" 
          mt={2} 
          onClick={() => setShowAllWallets(!showAllWallets)}
          color="gray.400"
          _hover={{ color: "white", bg: "gray.700" }}
        >
          {showAllWallets 
            ? "Show less wallets" 
            : `+${wallets.length - 3} more wallets`}
        </Button>
      )}
    </Box>
  );
};

// 4. Simulation and Value Component
interface ValueSimulationProps {
  totalValue: number;
  valueAfterSlippage: number;
  jupiterSimulation: {
    loading: boolean;
    data: any | null;
  };
  slippagePercentage: number;
  getSlippageTooltipText: () => string;
}

const ValueSimulation: React.FC<ValueSimulationProps> = ({ totalValue, valueAfterSlippage, jupiterSimulation, slippagePercentage, getSlippageTooltipText }) => (
  <Flex 
    direction="column"
    gap={2}
    as={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{ 
      transitionDuration: "0.5s",
      transitionDelay: "0.7s"
    }}
  >
    <Flex justify="space-between">
      <Box 
        textAlign="left" 
        borderRadius="lg" 
        p={3} 
        px={5} 
        bg="accent.light" 
        borderWidth="1px" 
        borderColor="gray.700"
        flex="1"
      >
        <Text fontSize="sm" color="gray.400" fontWeight="medium">Total Value</Text>
        <Text
          as={motion.p}
          fontSize="xl" 
          fontWeight="bold" 
          color="cyan.400"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          style={{ 
            transitionDuration: "0.5s",
            transitionDelay: "0.8s"
          }}
        >
          ${totalValue.toLocaleString()}
        </Text>
      </Box>
      
      <Tooltip 
        label={getSlippageTooltipText()}
        placement="top"
        hasArrow
      >
        <Box 
          textAlign="right" 
          borderRadius="lg" 
          p={3} 
          px={5} 
          bg="bg.darker" 
          borderWidth="1px" 
          borderColor="gray.700"
          flex="1"
          ml={2}
          cursor="help"
          position="relative"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="gray.400" fontWeight="medium">Sell Simulation</Text>
            {jupiterSimulation.loading && (
              <Spinner size="xs" color="blue.400" ml={1} />
            )}
          </Flex>
          <Text
            as={motion.p}
            fontSize="xl" 
            fontWeight="bold" 
            color={jupiterSimulation.data ? "green.400" : "orange.400"}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{ 
              transitionDuration: "0.5s",
              transitionDelay: "0.8s"
            }}
          >
            ${valueAfterSlippage.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
          {jupiterSimulation.data && (
            <Badge
              position="absolute"
              bottom={-2}
              right={4}
              colorScheme="blue"
              fontSize="2xs"
            >
              Jupiter
            </Badge>
          )}
        </Box>
      </Tooltip>
    </Flex>
  </Flex>
);

// Main TokenCard component
export const TokenCard: React.FC<{ data: TokenData }> = ({ data }) => {
  const { info, walletBalances, totalValue, tokenMint } = data;
  const [showWallets, setShowWallets] = useState(false);
  const [showAllWallets, setShowAllWallets] = useState(false);

  // Get total token balance across all wallets
  const totalBalance = useMemo(() => {
    return walletBalances.reduce((sum, wallet) => sum + wallet.balance, 0);
  }, [walletBalances]);

  // Use Jupiter simulation if there's a balance to simulate
  const jupiterSimulation = useJupiterSimulation(
    tokenMint,
    totalBalance > 0 ? totalBalance : 0
  );

  // Fallback slippage calculation when Jupiter API is not available
  const calculateEstimatedSlippage = () => {
    // Base slippage percentage (much lower for high value tokens)
    let slippagePercentage = 0.1; // Start with 0.1% base slippage
    
    // If liquidity is extremely high or token is a stablecoin, even less slippage
    if (info.liquidity > 1000000 || info.symbol === 'USDT' || info.symbol === 'USDC') {
      slippagePercentage = 0.05; // Just 0.05% for very liquid tokens
    }
    
    // For small amounts relative to daily volume, slippage is minimal
    const valueToVolumeRatio = info.volume24h > 0 ? totalValue / info.volume24h : 0;
    
    if (valueToVolumeRatio < 0.001) {
      // Less than 0.1% of daily volume - minimal impact
      return slippagePercentage;
    } else if (valueToVolumeRatio < 0.01) {
      // Less than 1% of daily volume - small impact
      slippagePercentage += 0.15;
    } else if (valueToVolumeRatio < 0.05) {
      // Less than 5% of daily volume - moderate impact
      slippagePercentage += 0.3;
    } else if (valueToVolumeRatio < 0.1) {
      // Less than 10% of daily volume - significant impact
      slippagePercentage += 0.6;
    } else {
      // More than 10% of daily volume - major impact
      slippagePercentage += 1.0;
    }
    
    // For very high-priced tokens like OI, use even lower slippage
    if (info.price > 10000) {
      slippagePercentage = Math.max(0.01, slippagePercentage * 0.2);
    } else if (info.price > 1000) {
      slippagePercentage = Math.max(0.05, slippagePercentage * 0.5);
    }
    
    // If the market cap is high, reduce slippage
    if (info.marketCap > 1000000000) { // > $1B
      slippagePercentage *= 0.5;
    }
    
    // Cap maximum slippage at 5% (more realistic for DEX aggregators like Jupiter)
    return Math.min(5, slippagePercentage);
  };

  // Determine slippage and value after slippage
  const { valueAfterSlippage, slippagePercentage } = useMemo(() => {
    if (jupiterSimulation.data && jupiterSimulation.data.outAmount > 0) {
      // If we have Jupiter data, use it directly
      const outAmount = jupiterSimulation.data.outAmount;
      const slippagePct = jupiterSimulation.data.priceImpactPct;
      
      return {
        valueAfterSlippage: outAmount,
        slippagePercentage: Math.abs(slippagePct) // Make sure it's positive
      };
    } else {
      // Fallback to our estimation if Jupiter data is not available
      const estimatedSlippage = calculateEstimatedSlippage();
      const slippageAmount = totalValue * (estimatedSlippage / 100);
      
      return {
        valueAfterSlippage: totalValue - slippageAmount,
        slippagePercentage: estimatedSlippage
      };
    }
  }, [jupiterSimulation.data, totalValue, totalBalance]);

  // Only show wallets with balance and sort by value (highest first)
  const walletsWithBalance = walletBalances
    .filter(balance => balance.balance > 0)
    .sort((a, b) => b.value - a.value);

  // Get tooltip text for slippage explanation
  const getSlippageTooltipText = () => {
    if (jupiterSimulation.loading) {
      return "Loading real-time slippage data from Jupiter...";
    }
    
    if (jupiterSimulation.data) {
      return `Real slippage data from Jupiter DEX: ${slippagePercentage.toFixed(2)}% price impact`;
    }
    
    return `Estimated ${slippagePercentage.toFixed(1)}% slippage based on liquidity and volume`;
  };

  return (
    <Box 
      as={motion.div}
      borderWidth="1px" 
      borderRadius="xl" 
      overflow="hidden" 
      boxShadow="md"
      bg="bg.card" 
      borderColor="gray.700"
      h="100%"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        transition: "all 0.3s ease"
      }}
      _hover={{ 
        boxShadow: "lg",
        transform: "translateY(-2px)",
        borderColor: "gray.600",
      }}
    >
      {/* Card Header */}
      <CardHeader 
        name={info.name}
        symbol={info.symbol}
        tokenMint={tokenMint}
        priceChange24h={info.priceChange24h}
      />

      {/* Token Stats */}
      <TokenStats 
        price={info.price}
        priceChange24h={info.priceChange24h}
        marketCap={info.marketCap}
        liquidity={info.liquidity}
        volume24h={info.volume24h}
      />

      {/* Wallet Summary */}
      {walletsWithBalance.length > 0 ? (
        <Box
          as={motion.div}
          p={5}
          pt={1}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            transitionDuration: "0.5s",
            transitionDelay: "0.5s"
          }}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="semibold" color="gray.300" fontSize="sm" textTransform="uppercase" letterSpacing="wider">
              Wallets ({walletsWithBalance.length})
            </Text>
            <IconButton
              aria-label={showWallets ? "Hide wallet details" : "Show wallet details"}
              icon={showWallets ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setShowWallets(!showWallets)}
            />
          </Flex>

          <Collapse in={showWallets} animateOpacity>
            <WalletList 
              wallets={walletsWithBalance}
              showAllWallets={showAllWallets}
              setShowAllWallets={setShowAllWallets}
            />
          </Collapse>
          
          <ValueSimulation 
            totalValue={totalValue}
            valueAfterSlippage={valueAfterSlippage}
            jupiterSimulation={jupiterSimulation}
            slippagePercentage={slippagePercentage}
            getSlippageTooltipText={getSlippageTooltipText}
          />
        </Box>
      ) : (
        <Box p={5} textAlign="center">
          <Divider my={4} borderColor="gray.700" />
          <Text color="gray.400" fontSize="sm">
            No balance found in tracked wallets
          </Text>
        </Box>
      )}
    </Box>
  );
}; 