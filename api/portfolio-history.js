import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://olpusotdbzarpahkahfc.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scHVzb3RkYnphcnBhaGthaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTQ1ODUsImV4cCI6MjA3MzE3MDU4NX0.I6a9EQ1HikqZiwNoPqUkJH8O_ZjWTmEiGZsHa_82tn4';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }

  try {
    const limit = parseInt(req.query.limit) || 100;

    // Fetch portfolio snapshots from Supabase
    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error: ' + error.message 
      });
    }

    // Return portfolio history
    res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
