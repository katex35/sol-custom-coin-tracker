exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Supabase configuration
    const supabaseUrl = process.env.SUPABASE_URL || 'https://olpusotdbzarpahkahfc.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scHVzb3RkYnphcnBhaGthaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTQ1ODUsImV4cCI6MjA3MzE3MDU4NX0.I6a9EQ1HikqZiwNoPqUkJH8O_ZjWTmEiGZsHa_82tn4';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { totalValue, sellSimulationValue, walletCount, tokenCount } = JSON.parse(event.body);

    if (typeof totalValue !== 'number' || typeof sellSimulationValue !== 'number') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'totalValue and sellSimulationValue must be numbers' 
        }),
      };
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      total_value: totalValue,
      sell_simulation_value: sellSimulationValue,
      wallet_count: walletCount || 0,
      token_count: tokenCount || 0,
    };

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .insert([snapshot])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Database error: ' + error.message 
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error' 
      }),
    };
  }
};
