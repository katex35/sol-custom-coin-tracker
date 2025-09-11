import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Progress,
  SimpleGrid,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTokenContext } from '../../contexts/TokenContext';

interface PortfolioSummaryProps {
  portfolioData: { totalValue: number; sellSimulationValue: number };
  tokensCount: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolioData,
  tokensCount,
}) => {
  const { isRefreshing } = useTokenContext();
  const { totalValue, sellSimulationValue } = portfolioData;
  const difference = sellSimulationValue - totalValue;
  const percentageChange = totalValue > 0 ? (difference / totalValue) * 100 : 0;
  const isPositive = difference >= 0;

  // Show loading spinner if refreshing and no data yet
  if (isRefreshing && totalValue === 0) {
    return (
      <Box
        bg="white"
        p={6}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
        position="sticky"
        top={6}
        minH="400px"
      >
        <LoadingSpinner message="Loading portfolio data..." size="md" />
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      p={{ base: 4, md: 6 }}
      borderRadius={{ base: "lg", md: "xl" }}
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      position={{ base: "static", lg: "sticky" }}
      top={6}
      mb={{ base: 4, lg: 0 }}
    >
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Box>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="gray.800" mb={2}>
            Portfolio Overview
          </Text>
          <Text fontSize="sm" color="gray.600">
            Real-time portfolio tracking with analytics
          </Text>
        </Box>

        <Divider />

        {/* Portfolio Values */}
        <SimpleGrid columns={1} spacing={{ base: 3, md: 4 }}>
          <Stat>
            <StatLabel color="gray.600">Total Portfolio Value</StatLabel>
            <StatNumber fontSize={{ base: "xl", md: "2xl" }} color="gray.900">
              {formatCurrency(totalValue)}
            </StatNumber>
            <StatHelpText color="gray.500">
              Current market value
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel color="gray.600">Sell Simulation Value</StatLabel>
            <StatNumber fontSize={{ base: "lg", md: "xl" }} color={isPositive ? "green.700" : "red.700"}>
              {formatCurrency(sellSimulationValue)}
            </StatNumber>
            <StatHelpText color={isPositive ? "green.700" : "red.700"}>
              <HStack spacing={1}>
                <Icon as={isPositive ? TriangleUpIcon : TriangleDownIcon} />
                <Text fontSize={{ base: "sm", md: "md" }}>
                  {isPositive ? "+" : ""}{formatCurrency(difference)} ({percentageChange.toFixed(2)}%)
                </Text>
              </HStack>
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Performance Indicator */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">Portfolio Performance</Text>
            <Badge colorScheme={isPositive ? "green" : "red"} variant="solid">
              {isPositive ? "Profitable" : "Loss"}
            </Badge>
          </HStack>
          <Progress 
            value={Math.abs(percentageChange)} 
            max={10} 
            colorScheme={isPositive ? "green" : "red"} 
            size="sm" 
            borderRadius="full"
          />
        </Box>

        <Divider />

        {/* Analytics Section */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={3}>
            Portfolio Analytics
          </Text>
          <SimpleGrid columns={2} spacing={3}>
            <Box bg="blue.50" p={3} borderRadius="md">
              <Text fontSize="xs" color="blue.600" fontWeight="medium">
                DIVERSIFICATION
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.700">
                {tokensCount}
              </Text>
              <Text fontSize="xs" color="blue.600">
                Assets
              </Text>
            </Box>
            
            <Box bg="purple.50" p={3} borderRadius="md">
              <Text fontSize="xs" color="purple.600" fontWeight="medium">
                AVG VALUE
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="purple.700">
                {formatCurrency(tokensCount > 0 ? totalValue / tokensCount : 0).replace('$', '$')}
              </Text>
              <Text fontSize="xs" color="purple.600">
                Per Token
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider />

        <VStack spacing={3} align="stretch">
          <Text fontSize="md" fontWeight="semibold" color="gray.700">
            Quick Stats
          </Text>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Tracked Tokens</Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.800">
              {tokensCount}
            </Text>
          </HStack>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Status</Text>
            <Text fontSize="sm" fontWeight="medium" color="green.500">
              Active
            </Text>
          </HStack>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Performance</Text>
            <Text fontSize="sm" fontWeight="medium" color={isPositive ? "green.500" : "red.500"}>
              {isPositive ? "+" : ""}{percentageChange.toFixed(2)}%
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};
