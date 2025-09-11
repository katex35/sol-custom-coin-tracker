import React from 'react';
import {
  Grid,
  Box,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { TokenContainer } from './TokenContainer';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTokenContext } from '../../contexts/TokenContext';

interface TokenGridProps {
  tokens: string[];
  onAddToken: () => void;
}

// Get wallet addresses from environment
const WALLET_ADDRESSES = process.env.REACT_APP_WALLET_ADDRESSES?.split(',').filter(Boolean) || [];

export const TokenGrid: React.FC<TokenGridProps> = ({ tokens, onAddToken }) => {
  const { isRefreshing } = useTokenContext();

  if (tokens.length === 0) {
    return (
      <Box
        bg="white"
        p={12}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        textAlign="center"
        boxShadow="sm"
      >
        <VStack spacing={6}>
          <Box>
            <Text color="gray.600" fontSize="lg" mb={2}>
              No tokens tracked yet
            </Text>
            <Text color="gray.500" fontSize="sm">
              Add your first token to start tracking your portfolio
            </Text>
          </Box>
          <Button 
            leftIcon={<AddIcon />} 
            onClick={onAddToken} 
            variant="solid"
            size="lg"
          >
            Add your first token
          </Button>
        </VStack>
      </Box>
    );
  }

  if (isRefreshing) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
        minH="400px"
      >
        <LoadingSpinner message="Loading token data..." size="lg" />
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {tokens.map((tokenMint) => (
        <TokenContainer key={tokenMint} tokenMint={tokenMint} wallets={WALLET_ADDRESSES} />
      ))}
    </VStack>
  );
};
