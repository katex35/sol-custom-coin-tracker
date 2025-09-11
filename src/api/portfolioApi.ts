import { savePortfolioSnapshot, PortfolioSnapshot, getPortfolioSnapshots } from '../services/supabaseService';

// Save portfolio data to database
export const savePortfolioData = async (portfolioData: { totalValue: number; sellSimulationValue: number }, tokensCount: number): Promise<PortfolioSnapshot | null> => {
  const snapshot: Omit<PortfolioSnapshot, 'id' | 'created_at'> = {
    timestamp: new Date().toISOString(),
    total_value: portfolioData.totalValue,
    sell_simulation_value: portfolioData.sellSimulationValue,
    wallet_count: process.env.REACT_APP_WALLET_ADDRESSES?.split(',').filter(Boolean).length || 0,
    token_count: tokensCount,
  };

  return await savePortfolioSnapshot(snapshot);
};

// Get portfolio history from database
export const getPortfolioHistory = async (limit: number = 100): Promise<PortfolioSnapshot[]> => {
  return await getPortfolioSnapshots(limit);
};

// API endpoint function for external calls (like cron jobs)
// This can be called directly: POST to your domain with portfolio data
export const savePortfolioEndpoint = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { totalValue, sellSimulationValue, walletCount, tokenCount } = body;

    if (typeof totalValue !== 'number' || typeof sellSimulationValue !== 'number') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'totalValue and sellSimulationValue must be numbers' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const snapshot: Omit<PortfolioSnapshot, 'id' | 'created_at'> = {
      timestamp: new Date().toISOString(),
      total_value: totalValue,
      sell_simulation_value: sellSimulationValue,
      wallet_count: walletCount || 0,
      token_count: tokenCount || 0,
    };

    const result = await savePortfolioSnapshot(snapshot);
    
    if (result) {
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save portfolio data' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
