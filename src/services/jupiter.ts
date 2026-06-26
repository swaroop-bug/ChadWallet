/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SwapQuote {
  inputAmount: number; // formatted float
  outputAmount: number; // formatted float
  priceImpactPct: number;
  routePlan: any[];
  feeAmount: number;
  rate: number;
  inputSymbol: string;
  outputSymbol: string;
}

export async function fetchJupiterQuote(
  inputMint: string,
  outputMint: string,
  amountFloat: number,
  inputSymbol: string,
  outputSymbol: string,
  inputDecimals = 9,
  outputDecimals = 9
): Promise<SwapQuote> {
  const isMockInput = inputMint.startsWith("CHAD");
  const isMockOutput = outputMint.startsWith("CHAD");
  
  if (isMockInput || isMockOutput) {
    return simulateMockQuote(amountFloat, inputSymbol, outputSymbol);
  }

  try {
    const rawAmount = Math.floor(amountFloat * Math.pow(10, inputDecimals)).toString();
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount}&slippageBps=50`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Jupiter Quote API returned error status");
    
    const data = await res.json();
    
    const outAmountFloat = parseInt(data.outAmount) / Math.pow(10, outputDecimals);
    const priceImpact = parseFloat(data.priceImpactPct) || 0;
    
    return {
      inputAmount: amountFloat,
      outputAmount: outAmountFloat,
      priceImpactPct: priceImpact,
      routePlan: data.routePlan || [],
      feeAmount: 0.00005,
      rate: outAmountFloat / amountFloat,
      inputSymbol,
      outputSymbol
    };
  } catch (err) {
    return simulateMockQuote(amountFloat, inputSymbol, outputSymbol);
  }
}

function simulateMockQuote(amountFloat: number, inputSymbol: string, outputSymbol: string): SwapQuote {
  const prices: Record<string, number> = {
    SOL: 145.20,
    WIF: 2.12,
    BONK: 0.0000214,
    POPCAT: 0.74,
    BOME: 0.0094,
    MEW: 0.0048,
    WEN: 0.000154,
    CHAD: 0.015
  };

  const inputPrice = prices[inputSymbol] || 1.0;
  const outputPrice = prices[outputSymbol] || 1.0;
  
  const inValUsd = amountFloat * inputPrice;
  const outAmountFloat = inValUsd / outputPrice;
  const slippage = 0.02 + Math.random() * 0.08;
  
  return {
    inputAmount: amountFloat,
    outputAmount: outAmountFloat * (1 - slippage / 100),
    priceImpactPct: slippage,
    routePlan: [{ name: "Raydium (Chad Route)" }],
    feeAmount: 0.00005,
    rate: (outAmountFloat * (1 - slippage / 100)) / amountFloat,
    inputSymbol,
    outputSymbol
  };
}
