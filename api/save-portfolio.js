import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://olpusotdbzarpahkahfc.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scHVzb3RkYnphcnBhaGthaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTQ1ODUsImV4cCI6MjA3MzE3MDU4NX0.I6a9EQ1HikqZiwNoPqUkJH8O_ZjWTmEiGZsHa_82tn4';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { totalValue, sellSimulationValue, walletCount, tokenCount } = req.body;

    // Validate input
    if (typeof totalValue !== 'number' || typeof sellSimulationValue !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'totalValue and sellSimulationValue must be numbers' 
      });
    }

    // Prepare snapshot data
    const snapshot = {
      timestamp: new Date().toISOString(),
      total_value: totalValue,
      sell_simulation_value: sellSimulationValue,
      wallet_count: walletCount || 0,
      token_count: tokenCount || 0,
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .insert([snapshot])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error: ' + error.message 
      });
    }

    // Return success response
    res.status(200).json({ 
      success: true, 
      data: data,
      message: 'Portfolio snapshot saved successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
