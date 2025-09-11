import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  ButtonGroup,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
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
import { getPortfolioHistory } from '../../api/portfolioApi';
import { PortfolioSnapshot } from '../../services/supabaseService';
import { formatCurrency } from '../../utils/formatters';

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

interface PortfolioChartProps {
  currentPortfolio?: { totalValue: number; sellSimulationValue: number };
}

type TimeRange = '24h' | '7d' | '30d' | 'all';

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ currentPortfolio }) => {
  const [data, setData] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshots = await getPortfolioHistory(1000);
      setData(snapshots);
    } catch (err) {
      setError('Failed to load portfolio history');
      toast({
        title: 'Error',
        description: 'Failed to load portfolio history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterDataByTimeRange = (snapshots: PortfolioSnapshot[], range: TimeRange) => {
    if (!snapshots.length) return [];
    
    const now = new Date();
    let cutoffDate: Date;

    switch (range) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return snapshots;
    }

    return snapshots.filter(snapshot => new Date(snapshot.timestamp) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(data, timeRange);

  // Add current portfolio data as the latest point if available
  const chartData = [...filteredData];
  if (currentPortfolio && chartData.length > 0) {
    const lastSnapshot = chartData[chartData.length - 1];
    const timeDiff = new Date().getTime() - new Date(lastSnapshot.timestamp).getTime();
    
    // Only add current data if last snapshot is older than 1 hour
    if (timeDiff > 60 * 60 * 1000) {
      chartData.push({
        id: 'current',
        timestamp: new Date().toISOString(),
        total_value: currentPortfolio.totalValue,
        sell_simulation_value: currentPortfolio.sellSimulationValue,
        wallet_count: 0,
        token_count: 0,
        created_at: new Date().toISOString(),
      });
    }
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Value History',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'MMM dd HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Value (USD)',
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const chartDataConfig = {
    labels: chartData.map(item => new Date(item.timestamp)),
    datasets: [
      {
        label: 'Portfolio Value',
        data: chartData.map(item => item.total_value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
      {
        label: 'Sell Simulation Value',
        data: chartData.map(item => item.sell_simulation_value),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4}>Loading portfolio history...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!data.length) {
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No portfolio history data available yet.</Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Portfolio snapshots will appear here after they are saved to the database.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">
            Portfolio History
          </Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              colorScheme={timeRange === '24h' ? 'blue' : 'gray'}
              onClick={() => setTimeRange('24h')}
            >
              24H
            </Button>
            <Button
              colorScheme={timeRange === '7d' ? 'blue' : 'gray'}
              onClick={() => setTimeRange('7d')}
            >
              7D
            </Button>
            <Button
              colorScheme={timeRange === '30d' ? 'blue' : 'gray'}
              onClick={() => setTimeRange('30d')}
            >
              30D
            </Button>
            <Button
              colorScheme={timeRange === 'all' ? 'blue' : 'gray'}
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
          </ButtonGroup>
        </HStack>

        <Box height="400px">
          <Line options={chartOptions} data={chartDataConfig} />
        </Box>

        <HStack justify="space-between" fontSize="sm" color="gray.600">
          <Text>
            Showing {filteredData.length} data points over {timeRange === 'all' ? 'all time' : timeRange}
          </Text>
          <Button size="sm" variant="outline" onClick={fetchData}>
            Refresh
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
