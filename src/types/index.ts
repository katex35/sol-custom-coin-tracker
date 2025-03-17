export interface TokenInfo {
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
}

export interface WalletBalance {
  address: string;
  tokenMint: string;
  balance: number;
  value: number;
}

export interface TokenData {
  tokenMint: string;
  info: TokenInfo;
  walletBalances: WalletBalance[];
  totalValue: number;
} 