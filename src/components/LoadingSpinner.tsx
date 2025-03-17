import React from 'react';
import { Box, Flex, Text, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export const LoadingSpinner: React.FC = () => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          Loading data...
        </Text>
      </Flex>
    </MotionBox>
  );
}; 