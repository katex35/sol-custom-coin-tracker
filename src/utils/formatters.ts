import { ReactNode } from 'react';
import { Text } from '@chakra-ui/react';

/**
 * Format numbers as currency with suffixes (B, M, K)
 */
export const formatCurrency = (num: number): string => {
  if (num === 0) return '$0';
  
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  
  return `$${num.toLocaleString()}`;
};

/**
 * Format prices with appropriate decimal places
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return '$0';
  
  // For very large prices (over 1000), use formatting with commas
  if (price >= 10000000) {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
  
  // For large prices (between 1000 and 10000000), use K/M/B notation
  if (price >= 1000) {
    if (price >= 1000000000) {
      return `$${(price / 1000000000).toFixed(2)}B`;
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${(price / 1000).toFixed(2)}K`;
  }
  
  // For normal prices (between 0.01 and 1000)
  if (price >= 0.01) {
    return `$${price.toFixed(2)}`;
  }
  
  // For small prices, keep 4 decimal places
  if (price >= 0.0001) {
    return `$${price.toFixed(4)}`;
  }
  
  // For extremely small prices, use scientific notation
  return `$${price.toExponential(4)}`;
};

/**
 * Format token balance with special formatting
 */
export const formatBalance = (balance: number): string => {
  if (balance === 0) return '0';
  
  // For very small numbers (use scientific notation for extremely small numbers)
  if (balance < 0.001) {
    if (balance < 0.0001) {
      return balance.toExponential(4);
    }
    return balance.toFixed(6);
  }
  
  // For large numbers, use thousands separator and comma for decimal
  if (balance >= 1000) {
    // Replace dots with commas for decimal and add dots for thousands
    return balance.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    });
  }
  
  // Normal formatting for other numbers
  return balance.toFixed(balance < 0.1 ? 6 : 2);
};

/**
 * Truncates address for privacy
 */
export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}; 