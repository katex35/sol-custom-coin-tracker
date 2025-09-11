import { useQuery } from '@tanstack/react-query';
import { getTokenInfo, getWalletTokenBalance, getWalletSolBalance } from '../services/solanaService';
import { TokenData, WalletBalance } from '../types';

// Stale token data to use during API rate limiting
let staleTokenData: {[key: string]: TokenData} = {};

export function useTokenData(token: string, wallets: string[], enabled = true) {
  const queryFn = async (): Promise<TokenData> => {
    console.log(`Fetching data for token: ${token}`);

    try {
      // Try to get token information
      const tokenInfo = await getTokenInfo(token);
      let walletBalances: WalletBalance[] = [];

      // Handle SOL balance differently
      const isSol = token === 'So11111111111111111111111111111111111111112';
      
      // Fetch wallet balances in chunks to avoid rate limiting
      const chunkSize = 3;
      for (let i = 0; i < wallets.length; i += chunkSize) {
        const chunk = wallets.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(wallet => 
          isSol ? getWalletSolBalance(wallet) : getWalletTokenBalance(wallet, token)
        );
        const chunkResults = await Promise.all(chunkPromises);
        walletBalances.push(...chunkResults);
        
        // Add delay between chunks to avoid rate limiting
        if (i + chunkSize < wallets.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Calculate total value
      const totalBalance = walletBalances.reduce((sum, balance) => sum + balance.balance, 0);
      const totalValue = totalBalance * tokenInfo.price;

      // Update wallet balances with calculated values
      walletBalances = walletBalances.map(balance => ({
        ...balance,
        value: balance.balance * tokenInfo.price
      }));

      const result = {
        info: tokenInfo,
        walletBalances,
        totalValue,
        tokenMint: token,
      };

      // Cache successful result
      staleTokenData[token] = result;
      
      return result;
    } catch (error) {
      console.error(`Error fetching token data for ${token}:`, error);
      
      // Return stale data if available
      if (staleTokenData[token]) {
        console.log(`Using stale data for token: ${token}`);
        return staleTokenData[token];
      }
      
      // Return default data as last resort
      return {
        info: {
          name: 'Unknown Token',
          symbol: token.slice(0, 4).toUpperCase(),
          price: 0,
          marketCap: 0,
          liquidity: 0,
          volume24h: 0,
          priceChange24h: 0,
        },
        walletBalances: [],
        totalValue: 0,
        tokenMint: token,
      };
    }
  };

  return useQuery({
    queryKey: ['tokenData', token],
    queryFn,
    enabled,
    staleTime: 60000,
    gcTime: 300000,
    retry: 3,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });
}
