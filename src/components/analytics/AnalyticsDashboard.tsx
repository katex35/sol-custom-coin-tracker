import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Divider,
  Badge,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { getPortfolioSnapshots, PortfolioSnapshot, savePortfolioSnapshot } from '../../services/supabaseService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface AnalyticsDashboardProps {
  currentPortfolioData: {
    totalValue: number;
    totalTokens: number;
    sellSimulationValue: number;
  };
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  currentPortfolioData,
}) => {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const toast = useToast();

  const loadSnapshots = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPortfolioSnapshots(1000); // Get more data for better analytics
      setSnapshots(data);
    } catch (error) {
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load portfolio analytics data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const saveToDatabase = async () => {
    try {
      const result = await savePortfolioSnapshot({
        timestamp: new Date().toISOString(),
        total_value: currentPortfolioData.totalValue,
        sell_simulation_value: currentPortfolioData.sellSimulationValue,
        wallet_count: 1,
        token_count: currentPortfolioData.totalTokens,
      });

      if (result) {
        await loadSnapshots(); // Reload data
        toast({
          title: 'Portfolio Saved',
          description: 'Portfolio snapshot has been saved to database successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error Saving Portfolio',
        description: 'Failed to save portfolio snapshot',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getFilteredSnapshots = () => {
    if (timeRange === 'all') return snapshots;
    
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return snapshots.filter((snapshot: PortfolioSnapshot) => 
      new Date(snapshot.created_at || snapshot.timestamp) >= cutoffDate
    );
  };

  const filteredSnapshots = getFilteredSnapshots();

  const calculateStats = () => {
    if (!filteredSnapshots.length) {
      return {
        change: 0,
        changePercent: 0,
        sellSimChange: 0,
        sellSimChangePercent: 0,
        avgValue: 0,
        maxValue: 0,
        minValue: 0,
        volatility: 0,
      };
    }

    const values = filteredSnapshots.map((s: PortfolioSnapshot) => s.total_value);
    const sellSimValues = filteredSnapshots.map((s: PortfolioSnapshot) => s.sell_simulation_value);
    
    const firstValue = values[values.length - 1] || 0; // Oldest value
    const lastValue = values[0] || 0; // Most recent value
    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;

    const firstSellSim = sellSimValues[sellSimValues.length - 1] || 0;
    const lastSellSim = sellSimValues[0] || 0;
    const sellSimChange = lastSellSim - firstSellSim;
    const sellSimChangePercent = firstSellSim > 0 ? (sellSimChange / firstSellSim) * 100 : 0;

    const avgValue = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Calculate volatility (standard deviation)
    const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - avgValue, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    return {
      change,
      changePercent,
      sellSimChange,
      sellSimChangePercent,
      avgValue,
      maxValue,
      minValue,
      volatility,
    };
  };

  const stats = calculateStats();

  const chartData = {
    labels: filteredSnapshots.map((snapshot: PortfolioSnapshot) => 
      new Date(snapshot.created_at || snapshot.timestamp)
    ).reverse(),
    datasets: [
      {
        label: 'Portfolio Value',
        data: filteredSnapshots.map((snapshot: PortfolioSnapshot) => snapshot.total_value).reverse(),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Sell Simulation Value',
        data: filteredSnapshots.map((snapshot: PortfolioSnapshot) => snapshot.sell_simulation_value).reverse(),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'normal' as const,
          },
        },
      },
      title: {
        display: true,
        text: 'Portfolio Value Over Time',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return format(new Date(context[0].parsed.x), 'MMM dd, yyyy HH:mm');
          },
          label: function(context: any) {
            return `${context.dataset.label}: $${Number(context.parsed.y).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: (timeRange === '7d' ? 'hour' : timeRange === '30d' ? 'day' : 'day') as 'hour' | 'day',
          displayFormats: {
            hour: 'MMM dd HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Date & Time',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value (USD)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + Number(value).toLocaleString('en-US', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            });
          },
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (isLoading) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        border="1px"
        borderColor="gray.200"
        p={6}
        mb={6}
      >
        <Text>Loading analytics data...</Text>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius={{ base: "lg", md: "lg" }}
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      p={{ base: 4, md: 6 }}
      mb={{ base: 4, md: 6 }}
    >
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        {/* Header */}
        <HStack 
          justify="space-between" 
          align="center"
          flexWrap={{ base: "wrap", md: "nowrap" }}
          spacing={{ base: 2, md: 3 }}
        >
          <Heading 
            size={{ base: "md", md: "lg" }} 
            color="gray.800"
            flex={{ base: "1 1 100%", md: "0 0 auto" }}
            mb={{ base: 2, md: 0 }}
          >
            Portfolio Analytics
          </Heading>
          <HStack 
            spacing={{ base: 2, md: 3 }} 
            flexWrap={{ base: "wrap", sm: "nowrap" }}
            w={{ base: "100%", md: "auto" }}
            justify={{ base: "center", md: "flex-end" }}
          >
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              size="sm"
              width={{ base: "100px", md: "150px" }}
              fontSize="sm"
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={saveToDatabase}
              fontSize="sm"
            >
              Save to DB
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              onClick={loadSnapshots}
              fontSize="sm"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {filteredSnapshots.length > 0 && (
          <>
            {/* Key Statistics */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
              <Stat
                bg="blue.50"
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                border="1px"
                borderColor="blue.200"
                boxShadow="sm"
              >
                <StatLabel color="blue.600" fontSize="sm" fontWeight="semibold">Portfolio Change</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }} color="blue.800">
                  ${Math.abs(stats.change).toFixed(2)}
                </StatNumber>
                <StatHelpText color="blue.600">
                  <StatArrow type={stats.change >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(stats.changePercent).toFixed(2)}%
                </StatHelpText>
              </Stat>

              <Stat
                bg="green.50"
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                border="1px"
                borderColor="green.200"
                boxShadow="sm"
              >
                <StatLabel color="green.600" fontSize="sm" fontWeight="semibold">Sell Sim Change</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }} color="green.800">
                  ${Math.abs(stats.sellSimChange).toFixed(2)}
                </StatNumber>
                <StatHelpText color="green.600">
                  <StatArrow type={stats.sellSimChange >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(stats.sellSimChangePercent).toFixed(2)}%
                </StatHelpText>
              </Stat>

              <Stat
                bg="purple.50"
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                border="1px"
                borderColor="purple.200"
                boxShadow="sm"
              >
                <StatLabel color="purple.600" fontSize="sm" fontWeight="semibold">Average Value</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }} color="purple.800">
                  ${stats.avgValue.toFixed(2)}
                </StatNumber>
                <StatHelpText color="purple.600" fontSize="xs">
                  Over {filteredSnapshots.length} snapshots
                </StatHelpText>
              </Stat>

              <Stat
                bg="orange.50"
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                border="1px"
                borderColor="orange.200"
                boxShadow="sm"
              >
                <StatLabel color="orange.600" fontSize="sm" fontWeight="semibold">Volatility</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }} color="orange.800">
                  ${stats.volatility.toFixed(2)}
                </StatNumber>
                <StatHelpText color="orange.600" fontSize="xs">
                  Standard deviation
                </StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Additional Stats Row */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
              <Box bg="green.50" p={{ base: 3, md: 4 }} borderRadius="lg" textAlign="center" border="1px" borderColor="green.200">
                <Text fontSize="xs" color="green.600" fontWeight="semibold" mb={1}>
                  Maximum Value
                </Text>
                <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color="green.800">
                  ${stats.maxValue.toFixed(2)}
                </Text>
              </Box>
              <Box bg="red.50" p={{ base: 3, md: 4 }} borderRadius="lg" textAlign="center" border="1px" borderColor="red.200">
                <Text fontSize="xs" color="red.600" fontWeight="semibold" mb={1}>
                  Minimum Value
                </Text>
                <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color="red.800">
                  ${stats.minValue.toFixed(2)}
                </Text>
              </Box>
              <Box bg="blue.50" p={{ base: 3, md: 4 }} borderRadius="lg" textAlign="center" border="1px" borderColor="blue.200">
                <Text fontSize="xs" color="blue.600" fontWeight="semibold" mb={1}>
                  Current Value
                </Text>
                <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color="blue.800">
                  ${currentPortfolioData.totalValue.toFixed(2)}
                </Text>
              </Box>
              <Box bg="purple.50" p={{ base: 3, md: 4 }} borderRadius="lg" textAlign="center" border="1px" borderColor="purple.200">
                <Text fontSize="xs" color="purple.600" fontWeight="semibold" mb={1}>
                  Data Points
                </Text>
                <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color="purple.800">
                  {filteredSnapshots.length}
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            {/* Chart */}
            <Box 
              height={{ base: "300px", md: "400px", lg: "500px" }} 
              p={{ base: 2, md: 4 }} 
              bg="gray.50" 
              borderRadius="lg"
              overflow="hidden"
            >
              <Line 
                data={chartData} 
                options={{
                  ...chartOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'top' as const,
                      labels: {
                        usePointStyle: true,
                        padding: window.innerWidth < 768 ? 10 : 20,
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14,
                          weight: 'normal' as const,
                        },
                      },
                    },
                    title: {
                      display: true,
                      text: 'Portfolio Value Over Time',
                      font: {
                        size: window.innerWidth < 768 ? 14 : 18,
                        weight: 'bold' as const,
                      },
                      padding: {
                        top: 10,
                        bottom: window.innerWidth < 768 ? 15 : 30,
                      },
                    },
                  },
                }} 
              />
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AnalyticsDashboard;
