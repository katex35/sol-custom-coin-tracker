import { supabase } from './supabaseService';

export interface PortfolioSnapshot {
  id?: number;
  wallet_address: string;
  total_value: number;
  total_tokens: number;
  sell_simulation_value: number;
  created_at?: string;
  timestamp: string;
}

export const savePortfolioSnapshot = async (
  walletAddress: string,
  totalValue: number,
  totalTokens: number,
  sellSimulationValue: number
): Promise<PortfolioSnapshot> => {
  const { data, error } = await supabase
    .from('portfolio_snapshots')
    .insert([
      {
        wallet_address: walletAddress,
        total_value: totalValue,
        total_tokens: totalTokens,
        sell_simulation_value: sellSimulationValue,
        timestamp: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save portfolio snapshot: ${error.message}`);
  }

  return data;
};

export const getPortfolioSnapshots = async (limit = 100): Promise<PortfolioSnapshot[]> => {
  const { data, error } = await supabase
    .from('portfolio_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch portfolio snapshots: ${error.message}`);
  }

  return data || [];
};

export const deletePortfolioSnapshot = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('portfolio_snapshots')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete portfolio snapshot: ${error.message}`);
  }
};

export const getPortfolioSnapshotsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<PortfolioSnapshot[]> => {
  const { data, error } = await supabase
    .from('portfolio_snapshots')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch portfolio snapshots by date range: ${error.message}`);
  }

  return data || [];
};
