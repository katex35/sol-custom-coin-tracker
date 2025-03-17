/**
 * Jupiter API service for getting swap quotes
 */

// Jupiter quote result interface
export interface JupiterQuoteResult {
  outAmount: number;
  priceImpactPct: number;
  slippageBps: number;
}

// USDC mint address for Solana
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Token decimals map (for common tokens)
const TOKEN_DECIMALS: Record<string, number> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // USDC
  'So11111111111111111111111111111111111111112': 9, // SOL
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 6, // USDT
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 9, // mSOL
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 5, // BONK
  'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6': 5, // KIN
  'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ': 9, // DUST
  // Additional common tokens can be added here
};

// Default to 9 decimals (valid for most Solana tokens)
const DEFAULT_DECIMALS = 9;

/**
 * Convert token amount to lamports (for API)
 * @param amount - Token amount in UI representation
 * @param decimals - Token decimal places
 * @returns Amount in lamports (as integer)
 */
function amountToLamports(amount: number, decimals: number): number {
  return Math.floor(amount * Math.pow(10, decimals));
}

/**
 * Convert lamports to token amount (for UI)
 * @param lamports - Amount in lamports
 * @param decimals - Token decimal places
 * @returns Token amount (as decimal)
 */
function lamportsToAmount(lamports: number, decimals: number): number {
  return lamports / Math.pow(10, decimals);
}

/**
 * Get a quote from Jupiter for selling a token
 * @param inputMint - The mint address of the token to sell
 * @param amount - The amount of tokens to sell
 * @returns Promise with the quote result containing outAmount, price impact and slippage
 */
export async function getJupiterQuote(
  inputMint: string,
  amount: number
): Promise<JupiterQuoteResult> {
  try {
    // console.log(`Getting Jupiter quote for ${amount} tokens with mint ${inputMint}`);
    
    // If amount is too small or invalid, return default values
    if (!amount || amount <= 0) {
      // console.warn('Invalid amount for Jupiter quote, returning default values');
      return {
        outAmount: 0,
        priceImpactPct: 0,
        slippageBps: 0
      };
    }

    // Get token decimal information if available, otherwise use default
    const inputDecimals = TOKEN_DECIMALS[inputMint] || DEFAULT_DECIMALS;
    const outputDecimals = TOKEN_DECIMALS[USDC_MINT] || 6; // USDC always has 6 decimals
    
    // Convert token amount to lamports
    const amountInLamports = amountToLamports(amount, inputDecimals);
    
    // console.log(`Token decimals: ${inputDecimals}, Amount in lamports: ${amountInLamports}`);
    
    // Construct the Jupiter API URL
    const apiUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${USDC_MINT}&amount=${amountInLamports}&slippageBps=50`;
    
    // console.log(`Calling Jupiter API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    // console.log('Jupiter response:', data);
    
    // Parse API response correctly
    const outAmountInLamports = parseInt(data.outAmount, 10);
    const outAmount = lamportsToAmount(outAmountInLamports, outputDecimals);
    
    // console.log(`Out amount in lamports: ${outAmountInLamports}, Converted to USDC: ${outAmount}`);
    
    // Extract and return the relevant data
    return {
      outAmount: outAmount, // USDC amount (as decimal)
      priceImpactPct: data.priceImpactPct,
      slippageBps: data.slippageBps
    };
  } catch (error) {
    // console.error('Error getting Jupiter quote:', error);
    throw error;
  }
} 