# Solana Token Tracker

A React application for tracking Solana token prices and wallet balances.

## Features

- Displays token prices
- Shows market data (volume, liquidity, market cap)
- Aggregates balances across multiple wallets
- Calculates total portfolio value
- Simulates token sales through Jupiter DEX

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Configuration

Define the following variables in your `.env` file:

```
REACT_APP_RPC_URL=https://api.mainnet-beta.solana.com
REACT_APP_WALLET_ADDRESSES=address1,address2,address3
REACT_APP_TOKEN_ADDRESSES=token1,token2,token3
```

## Technologies

- React + TypeScript
- Chakra UI
- React Query
- Framer Motion (for animations)
- Jupiter SDK (for token swap/slippage calculations)

