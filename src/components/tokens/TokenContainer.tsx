import React from 'react';
import { useTokenData } from '../../hooks/useTokenData';
import { TokenCard } from '../TokenCard';
import { TokenSkeleton } from './TokenSkeleton';
import { 
  Alert, 
  AlertIcon
} from '@chakra-ui/react';

interface TokenContainerProps {
  tokenMint: string;
  wallets: string[];
}

export const TokenContainer: React.FC<TokenContainerProps> = ({ 
  tokenMint, 
  wallets 
}) => {
  const { data, isLoading, error } = useTokenData(tokenMint, wallets);

  if (isLoading) {
    return <TokenSkeleton />;
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="xl">
        <AlertIcon />
        Failed to load token data
      </Alert>
    );
  }

  return data ? <TokenCard data={data} /> : null;
};
