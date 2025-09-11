import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olpusotdbzarpahkahfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scHVzb3RkYnphcnBhaGthaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTQ1ODUsImV4cCI6MjA3MzE3MDU4NX0.I6a9EQ1HikqZiwNoPqUkJH8O_ZjWTmEiGZsHa_82tn4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get portfolio data from your tracker
async function getPortfolioData() {
  // This would need to be adapted to fetch from your actual data source
  // For now, returning sample data
  return {
    totalValue: 0,
    sellSimulationValue: 0,
    tokensCount: 0,
    walletCount: 0
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current portfolio data
    const portfolioData = await getPortfolioData();
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      total_value: portfolioData.totalValue,
      sell_simulation_value: portfolioData.sellSimulationValue,
      wallet_count: portfolioData.walletCount,
      token_count: portfolioData.tokensCount,
    };

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .insert([snapshot])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save to database', details: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Portfolio snapshot saved successfully',
      data: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
