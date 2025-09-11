import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenInfo, WalletBalance } from '../types';

const connection = new Connection(process.env.REACT_APP_RPC_URL || '');

export const getTokenInfo = async (tokenMint: string): Promise<TokenInfo> => {
  try {
    // Make sure tokenMint is a valid address format
    if (!tokenMint || tokenMint.trim() === '') {
      console.error('Invalid token mint address');
      throw new Error('Invalid token mint address');
    }

    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}: ${response.statusText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('API did not return valid JSON, content-type:', contentType);
      throw new Error('API did not return valid JSON');
    }
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      // Return default data for tokens not found in dexscreener
      return {
        name: 'Unknown Token',
        symbol: tokenMint.slice(0, 4).toUpperCase(),
        price: 0,
        marketCap: 0,
        liquidity: 0,
        volume24h: 0,
        priceChange24h: 0,
      };
    }

    const pair = data.pairs[0];
    const result = {
      name: pair.baseToken?.name || 'Unknown Token',
      symbol: pair.baseToken?.symbol || tokenMint.slice(0, 4).toUpperCase(),
      price: parseFloat(pair.priceUsd || '0'),
      marketCap: parseFloat(pair.fdv || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      volume24h: parseFloat(pair.volume?.h24 || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
    };

    return result;
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Return default data instead of throwing
    return {
      name: 'Unknown Token',
      symbol: tokenMint.slice(0, 4).toUpperCase(),
      price: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0,
    };
  }
};

export const getWalletTokenBalance = async (
  walletAddress: string,
  tokenMint: string
): Promise<WalletBalance> => {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const tokenMintPubkey = new PublicKey(tokenMint);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: tokenMintPubkey }
    );

    const balance = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
    
    return {
      address: walletAddress,
      tokenMint,
      balance,
      value: 0, // Will be calculated later with price
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    // Return default balance instead of throwing
    return {
      address: walletAddress,
      tokenMint,
      balance: 0,
      value: 0,
    };
  }
};

export const getWalletSolBalance = async (walletAddress: string): Promise<WalletBalance> => {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(walletPubkey);
    const solBalance = balance / 1e9; // Convert lamports to SOL
    
    return {
      address: walletAddress,
      tokenMint: 'So11111111111111111111111111111111111111112', // SOL mint address
      balance: solBalance,
      value: 0, // Will be calculated later with price
    };
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return {
      address: walletAddress,
      tokenMint: 'So11111111111111111111111111111111111111112',
      balance: 0,
      value: 0,
    };
  }
}; 