import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://olpusotdbzarpahkahfc.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scHVzb3RkYnphcnBhaGthaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTQ1ODUsImV4cCI6MjA3MzE3MDU4NX0.I6a9EQ1HikqZiwNoPqUkJH8O_ZjWTmEiGZsHa_82tn4';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface PortfolioSnapshot {
  id?: string;
  timestamp: string;
  total_value: number;
  sell_simulation_value: number;
  wallet_count: number;
  token_count: number;
  created_at?: string;
}

// Direct Supabase calls
export const savePortfolioSnapshot = async (data: Omit<PortfolioSnapshot, 'id' | 'created_at'>): Promise<PortfolioSnapshot | null> => {
  try {
    const { data: result, error } = await supabase
      .from('portfolio_snapshots')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error saving portfolio snapshot:', error);
      throw new Error(error.message || 'Failed to save portfolio snapshot');
    }

    return result;
  } catch (error) {
    console.error('Failed to save portfolio snapshot:', error);
    return null;
  }
};

export const getPortfolioSnapshots = async (limit: number = 100): Promise<PortfolioSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching portfolio snapshots:', error);
      throw new Error(error.message || 'Failed to fetch portfolio snapshots');
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch portfolio snapshots:', error);
    return [];
  }
};
