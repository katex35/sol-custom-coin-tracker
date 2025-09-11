import React from 'react';
import { Box, Flex, Text, Spinner } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = "lg",
  overlay = false 
}) => {
  if (overlay) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="rgba(0, 0, 0, 0.7)"
        zIndex="1000"
        backdropFilter="blur(4px)"
      >
        <Flex 
          direction="column" 
          align="center" 
          bg="white" 
          p={6} 
          borderRadius="xl" 
          boxShadow="xl"
        >
          <Spinner
            thickness="4px"
            speed="0.8s"
            color="blue.500"
            size="xl"
            mb={4}
          />
          <Text fontWeight="medium" fontSize="lg">
            {message}
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex direction="column" align="center" justify="center" p={8}>
      <Spinner
        thickness="3px"
        speed="0.8s"
        color="blue.500"
        size={size}
        mb={3}
      />
      <Text color="gray.600" fontSize="sm">
        {message}
      </Text>
    </Flex>
  );
}; 