import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TokenData } from '../types';

interface TokenContextType {
  trackedTokens: string[];
  addToken: (tokenMint: string) => void;
  removeToken: (tokenMint: string) => void;
  clearAllTokens: () => void;
  refreshAllTokens: () => void;
  isRefreshing: boolean;
  portfolioUpdateTrigger: number;
  triggerPortfolioUpdate: () => void;
  getTotalPortfolioValue: () => { totalValue: number; totalTokens: number; sellSimulationValue: number };
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

// Get default tokens from environment and add SOL
const DEFAULT_TOKENS = [
  'So11111111111111111111111111111111111111112', // SOL
  ...(process.env.REACT_APP_TOKEN_ADDRESSES?.split(',').filter(Boolean) || [])
];

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [trackedTokens, setTrackedTokens] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portfolioUpdateTrigger, setPortfolioUpdateTrigger] = useState(0);
  const queryClient = useQueryClient();

  // Load default tokens on mount
  useEffect(() => {
    if (DEFAULT_TOKENS.length > 0 && trackedTokens.length === 0) {
      setTrackedTokens(DEFAULT_TOKENS);
    }
  }, [trackedTokens.length]);

  // Trigger portfolio update when query cache changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      setPortfolioUpdateTrigger(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const addToken = (tokenMint: string) => {
    if (!trackedTokens.includes(tokenMint)) {
      setTrackedTokens(prev => [...prev, tokenMint]);
    }
  };

  const removeToken = (tokenMint: string) => {
    setTrackedTokens(prev => prev.filter(token => token !== tokenMint));
  };

  const clearAllTokens = () => {
    setTrackedTokens([]);
  };

  const triggerPortfolioUpdate = () => {
    setPortfolioUpdateTrigger(prev => prev + 1);
  };

  const refreshAllTokens = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const refreshPromises = trackedTokens.map(token => 
        queryClient.invalidateQueries({ queryKey: ['tokenData', token] })
      );
      await Promise.all(refreshPromises);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTotalPortfolioValue = (): { totalValue: number; totalTokens: number; sellSimulationValue: number } => {
    let totalValue = 0;
    let sellSimulationValue = 0;
    const totalTokens = trackedTokens.length;
    
    trackedTokens.forEach(tokenMint => {
      const cachedData = queryClient.getQueryData<TokenData>(['tokenData', tokenMint]);
      if (cachedData) {
        // Use the totalValue from token data which includes current market price
        totalValue += cachedData.totalValue || 0;
        
        // Skip USDC for sell simulation
        const isUSDC = cachedData.info?.symbol === 'USDC' || tokenMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        
        if (!isUSDC) {
          // Get sell simulation value from Jupiter hook
          const jupiterData = queryClient.getQueryData(['jupiterSimulation', tokenMint]) as any;
          if (jupiterData && jupiterData.data?.outAmount) {
            sellSimulationValue += parseFloat(jupiterData.data.outAmount) || 0;
          }
        } else {
          // For USDC, use the actual value since it's already in USD
          sellSimulationValue += cachedData.totalValue || 0;
        }
      }
    });
    
    return { totalValue, totalTokens, sellSimulationValue };
  };

  const value: TokenContextType = {
    trackedTokens,
    addToken,
    removeToken,
    clearAllTokens,
    refreshAllTokens,
    isRefreshing,
    portfolioUpdateTrigger,
    triggerPortfolioUpdate,
    getTotalPortfolioValue,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
};
