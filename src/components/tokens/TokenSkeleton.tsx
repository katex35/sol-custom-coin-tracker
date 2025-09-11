import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  Divider,
} from '@chakra-ui/react';

export const TokenSkeleton: React.FC = () => {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Skeleton height="20px" width="80px" />
            <Skeleton height="16px" width="120px" />
          </VStack>
          <Skeleton height="24px" width="60px" borderRadius="md" />
        </HStack>

        {/* Price and Market Cap */}
        <HStack spacing={4}>
          <VStack align="start" spacing={1} flex={1}>
            <Skeleton height="14px" width="40px" />
            <Skeleton height="18px" width="70px" />
          </VStack>
          <VStack align="start" spacing={1} flex={1}>
            <Skeleton height="14px" width="60px" />
            <Skeleton height="18px" width="80px" />
          </VStack>
        </HStack>

        <Divider />

        {/* Portfolio Section */}
        <VStack spacing={3} align="stretch">
          <Skeleton height="16px" width="120px" />
          
          {/* Total Portfolio Value */}
          <Box
            bg="gray.50"
            p={4}
            borderRadius="lg"
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Skeleton height="12px" width="60px" />
                <Skeleton height="20px" width="80px" />
              </VStack>
              <VStack align="end" spacing={1}>
                <Skeleton height="12px" width="70px" />
                <Skeleton height="16px" width="90px" />
              </VStack>
            </HStack>
          </Box>

          {/* Wallet List */}
          <VStack spacing={2} align="stretch">
            {[1, 2, 3].map((index) => (
              <Box
                key={index}
                p={3}
                bg="gray.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.100"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Skeleton height="14px" width="100px" />
                    <Skeleton height="12px" width="80px" />
                  </VStack>
                  <Skeleton height="14px" width="60px" />
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>

        <Divider />

        {/* Sell Simulation */}
        <VStack spacing={3} align="stretch">
          <Skeleton height="16px" width="100px" />
          <Box
            p={4}
            bg="gray.50"
            borderRadius="lg"
          >
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Skeleton height="14px" width="80px" />
                <Skeleton height="14px" width="60px" />
              </HStack>
              <HStack justify="space-between">
                <Skeleton height="12px" width="70px" />
                <Skeleton height="12px" width="40px" />
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};
