import React from 'react';
import {
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
        p={{ base: 8, md: 12 }}
        borderRadius={{ base: "lg", md: "lg" }}
        borderWidth="1px"
        borderColor="gray.200"
        textAlign="center"
        boxShadow="sm"
      >
        <VStack spacing={{ base: 4, md: 6 }}>
          <Box>
            <Text color="gray.600" fontSize={{ base: "md", md: "lg" }} mb={2}>
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
            size={{ base: "md", md: "lg" }}
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
        borderRadius={{ base: "lg", md: "lg" }}
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
        minH={{ base: "300px", md: "400px" }}
        p={{ base: 4, md: 6 }}
      >
        <LoadingSpinner message="Loading token data..." size="lg" />
      </Box>
    );
  }

  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
      {tokens.map((tokenMint) => (
        <TokenContainer key={tokenMint} tokenMint={tokenMint} wallets={WALLET_ADDRESSES} />
      ))}
    </VStack>
  );
};
