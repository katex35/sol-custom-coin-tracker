import { useQuery } from 'react-query';
import { getTokenInfo, getWalletTokenBalance } from '../services/solanaService';
import { TokenData, WalletBalance } from '../types';

// Kalıcı önbellek için geniş scope'lu bir değişken
const staleTokenData: Record<string, TokenData> = {};

// Wallet adreslerini al
const WALLET_ADDRESSES = process.env.REACT_APP_WALLET_ADDRESSES?.split(',').filter(Boolean) || [];

export function useTokenData(tokenMint: string) {
  return useQuery<TokenData, Error>(['tokenData', tokenMint], async () => {
    // Check if the tokenMint is in the stale list (to avoid refetching)
    if (staleTokenData[tokenMint]) {
      return staleTokenData[tokenMint];
    }
    
    try {
      // First, get the token info
      const tokenInfo = await getTokenInfo(tokenMint);
      
      // Then, get balances across all wallets
      const walletBalances: WalletBalance[] = [];
      
      // Process wallets in chunks to avoid rate limiting
      const chunkSize = 5;
      for (let i = 0; i < WALLET_ADDRESSES.length; i += chunkSize) {
        const chunk = WALLET_ADDRESSES.slice(i, i + chunkSize);
        
        // Add delay between chunks
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between chunks
        }
        
        await Promise.all(chunk.map(async (address) => {
          try {
            const balance = await getWalletTokenBalance(address, tokenMint);
            
            if (balance.balance > 0) {
              walletBalances.push({
                ...balance,
                value: balance.balance * tokenInfo.price
              });
            }
          } catch (error) {
            // Silent fail for individual wallet errors
          }
        }));
      }
      
      // Calculate total value
      const totalValue = walletBalances.reduce((sum, wallet) => {
        return sum + wallet.value;
      }, 0);
      
      // Create the final result
      const result: TokenData = {
        info: tokenInfo,
        walletBalances,
        totalValue,
        tokenMint
      };
      
      // Cache the result for next time
      staleTokenData[tokenMint] = result;
      
      return result;
    } catch (error) {
      // Re-throw the error to be handled by React Query
      throw error;
    }
  }, {
    staleTime: 60000, // 1 minute - data considered fresh for longer
    retry: 3,         // Retry 3 times instead of 2
    retryDelay: attempt => Math.min(1000 * Math.pow(2, attempt), 30000), // Exponential backoff
    refetchInterval: 60000, // Auto refetch less frequently - every 60 seconds
    refetchOnWindowFocus: false, // Disable refetch on window focus
    onError: (error) => {
      console.error(`Error fetching data for ${tokenMint}:`, error);
    }
  });
} 