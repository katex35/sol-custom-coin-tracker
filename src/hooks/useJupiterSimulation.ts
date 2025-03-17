import { useState, useEffect } from 'react';
import { getJupiterQuote, JupiterQuoteResult } from '../services/jupiterService';

interface SimulationResult {
  loading: boolean;
  data: JupiterQuoteResult | null;
  error: string | null;
}

/**
 * Hook to simulate token swap using Jupiter API
 * @param tokenMint - The token's mint address to simulate selling
 * @param amount - The amount of tokens to sell
 * @returns Simulation result with loading state, data and error information
 */
export function useJupiterSimulation(tokenMint: string, amount: number): SimulationResult {
  const [result, setResult] = useState<SimulationResult>({
    loading: false,
    data: null,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    
    // Only fetch if we have a valid amount
    if (tokenMint && amount > 0) {
      const fetchSimulation = async () => {
        setResult(prev => ({ ...prev, loading: true, error: null }));
        
        try {
          // console.log(`Fetching Jupiter quote for ${amount} tokens with mint ${tokenMint}`);
          const quote = await getJupiterQuote(tokenMint, amount);
          
          if (isMounted) {
            setResult({
              loading: false,
              data: quote,
              error: null
            });
          }
        } catch (error) {
          console.error('Jupiter simulation error:', error);
          if (isMounted) {
            setResult({
              loading: false,
              data: null,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
          }
        }
      };

      fetchSimulation();
    } else {
      // Reset result if no valid params
      setResult({
        loading: false,
        data: null,
        error: null
      });
    }

    return () => {
      isMounted = false;
    };
  }, [tokenMint, amount]);

  return result;
} 