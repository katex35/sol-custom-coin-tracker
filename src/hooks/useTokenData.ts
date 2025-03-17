import { useQuery } from '@tanstack/react-query';
import { getTokenInfo, getWalletTokenBalance } from '../services/solanaService';
import { TokenData, WalletBalance } from '../types';

// Stale token data to use during API rate limiting
let staleTokenData: {[key: string]: TokenData} = {};

// Wallet adreslerini al
const WALLET_ADDRESSES = process.env.REACT_APP_WALLET_ADDRESSES?.split(',').filter(Boolean) || [];

export function useTokenData(token: string, wallets: string[], enabled = true) {
  const queryFn = async (): Promise<TokenData> => {
    console.log(`Fetching data for token: ${token}`);

    try {
      // Try to get token information
      const tokenInfo = await getTokenInfo(token);
      let walletBalances: WalletBalance[] = [];

      // Process wallet balances in chunks to avoid rate limiting
      const chunkSize = 3;
      for (let i = 0; i < wallets.length; i += chunkSize) {
        const chunk = wallets.slice(i, i + chunkSize);
        
        const chunkPromises = chunk.map(async (wallet) => {
          try {
            const balance = await getWalletTokenBalance(wallet, token);
            if (balance && balance.balance > 0) {
              return {
                address: wallet,
                tokenMint: token,
                balance: balance.balance,
                value: balance.balance * (tokenInfo.price || 0)
              } as WalletBalance;
            }
            return null;
          } catch (error) {
            console.error(`Failed to get balance for wallet ${wallet}:`, error);
            return null;
          }
        });
        
        const chunkResults = await Promise.all(chunkPromises);
        walletBalances = [...walletBalances, ...chunkResults.filter(Boolean) as WalletBalance[]];
        
        // Add a delay between chunks to avoid rate limiting
        if (i + chunkSize < wallets.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Calculate total value
      const totalValue = walletBalances.reduce((sum, balance) => sum + balance.value, 0);

      const tokenData: TokenData = {
        tokenMint: token,
        info: tokenInfo,
        walletBalances,
        totalValue
      };

      // Save as stale data for future use if API gets rate limited
      staleTokenData[token] = tokenData;

      return tokenData;
    } catch (error) {
      console.error(`Error fetching token data for ${token}:`, error);
      
      // If we have stale data for this token, use it instead of failing
      if (staleTokenData[token]) {
        console.log(`Using stale data for token ${token} due to API error`);
        return staleTokenData[token];
      }
      
      // Implement retry logic with proper typing
      const retryFetch = async (attempt: number, maxAttempts = 3, delay = 2000): Promise<TokenData> => {
        if (attempt >= maxAttempts) throw error;
        
        console.log(`Retry attempt ${attempt + 1} for token ${token}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
          return await queryFn();
        } catch (retryError) {
          return retryFetch(attempt + 1, maxAttempts, delay * 1.5);
        }
      };
      
      return retryFetch(0);
    }
  };

  return useQuery({
    queryKey: ['tokenData', token],
    queryFn,
    enabled: enabled,
    staleTime: 60000, // 60 seconds
    gcTime: 300000, // 5 minutes (formerly cacheTime)
    retry: 3,
    refetchInterval: 60000, // 60 seconds
    refetchOnWindowFocus: false,
  });
} 