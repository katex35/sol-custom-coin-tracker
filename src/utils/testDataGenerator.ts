// Test utility to generate sample portfolio data
// This should only be used for testing purposes

import { savePortfolioSnapshot, PortfolioSnapshot } from '../services/supabaseService';

export const generateTestData = async (days: number = 7): Promise<void> => {
  const snapshots: Omit<PortfolioSnapshot, 'id' | 'created_at'>[] = [];
  const now = new Date();
  
  // Generate sample data for the last 'days' days
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Add some random variation to make the data more realistic
    const baseValue = 40000;
    const variation = (Math.random() - 0.5) * 10000; // ±5000
    const dailyTrend = (days - i) * 100; // Slight upward trend
    
    const totalValue = baseValue + variation + dailyTrend;
    const sellSimVariation = (Math.random() - 0.5) * 2000; // ±1000
    const sellSimValue = totalValue * 0.25 + sellSimVariation; // About 25% of total with variation
    
    snapshots.push({
      timestamp: date.toISOString(),
      total_value: Math.max(0, totalValue),
      sell_simulation_value: Math.max(0, sellSimValue),
      wallet_count: 13,
      token_count: 4,
    });
    
    // Add some intraday data (every 6 hours)
    for (let h = 6; h < 24; h += 6) {
      const intradayDate = new Date(date.getTime() + h * 60 * 60 * 1000);
      const intradayVariation = (Math.random() - 0.5) * 2000; // ±1000
      
      snapshots.push({
        timestamp: intradayDate.toISOString(),
        total_value: Math.max(0, totalValue + intradayVariation),
        sell_simulation_value: Math.max(0, sellSimValue + intradayVariation * 0.25),
        wallet_count: 13,
        token_count: 4,
      });
    }
  }
  
  // Save all snapshots
  console.log(`Generating ${snapshots.length} test data points...`);
  
  for (const snapshot of snapshots) {
    try {
      await savePortfolioSnapshot(snapshot);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to save test snapshot:', error);
    }
  }
  
  console.log('Test data generation completed!');
};
