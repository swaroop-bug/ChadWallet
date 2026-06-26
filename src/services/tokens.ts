/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  fdv: number;
  iconUrl?: string;
  pairUrl?: string;
}

export interface LiveTrade {
  id: string;
  timestamp: Date;
  type: "buy" | "sell";
  amountSol: number;
  amountToken: number;
  priceUsd: number;
  wallet: string;
  isKOL?: boolean;
}

export interface TokenHolder {
  rank: number;
  wallet: string;
  balance: number;
  percentage: number;
  valueUsd: number;
  isKOL?: boolean;
  kolName?: string;
}

export const DEFAULT_TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  WIF: "EKpQGSJojMFJ2pcwCcJ857T77S4Z95o39sWn8w1TAqNM",
  BONK: "DezXAZ8z7PnrFcPy8Gssw3tRe5xrgZksHW5BiJa3hxks",
  POPCAT: "7GCih6b43KMAEq2jLD61AyccRsmXQC1qWdC15C1mFwP1",
  BOME: "ukHH6c7m4k47Qd4b4je4GNWx4M9ifk8YQGDWf6tBptP",
  MEW: "MEW1242Y6t8MCuVEVxGKG4H7EwXtuT6kPV4n2E9upc8",
  WEN: "WENwcehpvTE0wJ8KU25RspvUq6FMURtJvcrEwJaZJZr",
  CHAD: "CHAD1234567890qwertyuiopasdfghjklzxcvbnm",
};

const DEFAULT_TOKENS_LIST = Object.values(DEFAULT_TOKENS);

const MOCK_TOKEN_METADATA: Record<string, Partial<TokenData>> = {
  [DEFAULT_TOKENS.SOL]: { name: "Solana", symbol: "SOL", priceUsd: 145.20, priceChange24h: 3.5, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" },
  [DEFAULT_TOKENS.WIF]: { name: "dogwifhat", symbol: "WIF", priceUsd: 2.12, priceChange24h: -5.4, iconUrl: "https://dd.dexscreener.com/api/logo/145.20/ekpqgsjojmfj2pcwccj857t77s4z95o39swn8w1taqnm.png" },
  [DEFAULT_TOKENS.BONK]: { name: "Bonk", symbol: "BONK", priceUsd: 0.0000214, priceChange24h: 12.8, iconUrl: "https://dd.dexscreener.com/api/logo/145.20/dezxaz8z7pnrfcpy8gsswtre5xrgzkshw5bija3hxks.png" },
  [DEFAULT_TOKENS.POPCAT]: { name: "Popcat", symbol: "POPCAT", priceUsd: 0.74, priceChange24h: 8.9, iconUrl: "https://dd.dexscreener.com/api/logo/145.20/7gcih6b43kmaeq2jld61ayccrsmxqc1qwdc15c1mfwp1.png" },
  [DEFAULT_TOKENS.BOME]: { name: "BOOK OF MEME", symbol: "BOME", priceUsd: 0.0094, priceChange24h: -1.2, iconUrl: "https://dd.dexscreener.com/api/logo/145.20/ukhh6c7m4k47qd4b4je4gnwx4m9ifk8yqgdwf6tbptp.png" },
  [DEFAULT_TOKENS.MEW]: { name: "cat in a dogs world", symbol: "MEW", priceUsd: 0.0048, priceChange24h: 4.6, iconUrl: "https://dd.dexscreener.com/api/logo/145.20/mew1242yt8mcuvevxgkg4h7ewxtu6kpv4n2eupc8.png" },
  [DEFAULT_TOKENS.WEN]: { name: "Wen", symbol: "WEN", priceUsd: 0.000154, priceChange24h: -2.3, iconUrl: "https://dd.dexscreener.com/api/logo/145.20/wenwcehpvte0wj8ku25rspvu6fmurjvcrywjazjzr.png" },
  [DEFAULT_TOKENS.CHAD]: { name: "ChadWallet Token", symbol: "CHAD", priceUsd: 0.015, priceChange24h: 169.4, iconUrl: "/assets/logo/light.png" },
};

function getMockChadToken(): TokenData {
  return {
    address: DEFAULT_TOKENS.CHAD,
    name: "ChadWallet Token",
    symbol: "CHAD",
    priceUsd: 0.015,
    priceChange24h: 169.4,
    volume24h: 24500000,
    liquidity: 1800000,
    fdv: 15000000,
    iconUrl: "/assets/logo/light.png",
  };
}

export async function fetchTokens(): Promise<TokenData[]> {
  try {
    const addresses = DEFAULT_TOKENS_LIST.filter(addr => addr !== DEFAULT_TOKENS.CHAD).join(",");
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
    if (!res.ok) throw new Error();
    
    const data = await res.json();
    const dexscreenerTokens: TokenData[] = (data.pairs || [])
      .filter((p: any) => p.chainId === "solana" && (p.dexId === "raydium" || p.dexId === "meteora" || p.dexId === "orca"))
      .reduce((acc: TokenData[], pair: any) => {
        const tokenAddress = pair.baseToken.address;
        const existing = acc.find(t => t.address === tokenAddress);
        
        const tokenItem: TokenData = {
          address: tokenAddress,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          priceUsd: parseFloat(pair.priceUsd) || 0,
          priceChange24h: parseFloat(pair.priceChange.h24) || 0,
          volume24h: parseFloat(pair.volume.h24) || 0,
          liquidity: parseFloat(pair.liquidity?.usd) || 0,
          fdv: parseFloat(pair.fdv) || 0,
          iconUrl: pair.info?.imageUrl,
          pairUrl: pair.url,
        };

        if (!existing) {
          acc.push(tokenItem);
        } else if (tokenItem.liquidity > existing.liquidity) {
          const idx = acc.findIndex(t => t.address === tokenAddress);
          acc[idx] = tokenItem;
        }
        return acc;
      }, []);

    const finalTokens = [getMockChadToken(), ...dexscreenerTokens];
    
    DEFAULT_TOKENS_LIST.forEach(addr => {
      const exists = finalTokens.some(t => t.address.toLowerCase() === addr.toLowerCase());
      if (!exists) {
        const metadata = MOCK_TOKEN_METADATA[addr];
        if (metadata) {
          finalTokens.push({
            address: addr,
            name: metadata.name || "Unknown",
            symbol: metadata.symbol || "UNKNOWN",
            priceUsd: metadata.priceUsd || 0,
            priceChange24h: metadata.priceChange24h || 0,
            volume24h: 1500000,
            liquidity: 500000,
            fdv: 10000000,
            iconUrl: metadata.iconUrl,
          });
        }
      }
    });

    return finalTokens;
  } catch {
    return Object.entries(DEFAULT_TOKENS).map(([symbol, address]) => {
      const meta = MOCK_TOKEN_METADATA[address];
      return {
        address,
        name: meta?.name || symbol,
        symbol,
        priceUsd: meta?.priceUsd || 1.0,
        priceChange24h: meta?.priceChange24h || 0,
        volume24h: symbol === "CHAD" ? 24500000 : 8500000,
        liquidity: 1200000,
        fdv: 85000000,
        iconUrl: meta?.iconUrl,
      };
    });
  }
}

export async function searchTokens(query: string): Promise<TokenData[]> {
  if (!query) return fetchTokens();
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error();
    
    const data = await res.json();
    const searchResults: TokenData[] = (data.pairs || [])
      .filter((p: any) => p.chainId === "solana")
      .slice(0, 15)
      .map((pair: any) => ({
        address: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        priceUsd: parseFloat(pair.priceUsd) || 0,
        priceChange24h: parseFloat(pair.priceChange.h24) || 0,
        volume24h: parseFloat(pair.volume.h24) || 0,
        liquidity: parseFloat(pair.liquidity?.usd) || 0,
        fdv: parseFloat(pair.fdv) || 0,
        iconUrl: pair.info?.imageUrl,
        pairUrl: pair.url,
      }));
      
    return searchResults;
  } catch {
    const defaults = await fetchTokens();
    return defaults.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) || 
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.address.toLowerCase() === query.toLowerCase()
    );
  }
}

export function generateHolders(token: TokenData): TokenHolder[] {
  const isSol = token.symbol === "SOL";
  const supply = isSol ? 450000000 : 1000000000000;
  
  const kols = [
    { name: "Ansem", handle: "@useransem" },
    { name: "Sartoshi", handle: "@sartoshi" },
    { name: "Mitch", handle: "@mitch" },
    { name: "Cobie", handle: "@cobie" },
    { name: "ChadWojak", handle: "@chadwojak" }
  ];

  const holders: TokenHolder[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const wallet = `${Math.random() > 0.5 ? "Chad" : "Sol"}${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const percentage = 12 / (i + 1) + (Math.random() * 0.5);
    const balance = (supply * percentage) / 100;
    const isKOL = i <= 3 || Math.random() > 0.8;
    const kolIndex = i % kols.length;
    
    holders.push({
      rank: i,
      wallet: isKOL ? kols[kolIndex].handle : wallet,
      balance,
      percentage,
      valueUsd: balance * token.priceUsd,
      isKOL,
      kolName: isKOL ? kols[kolIndex].name : undefined
    });
  }

  return holders.sort((a, b) => b.percentage - a.percentage).map((h, idx) => ({ ...h, rank: idx + 1 }));
}

export function getRandomWallet(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "";
  for (let i = 0; i < 4; i++) address += chars[Math.floor(Math.random() * chars.length)];
  address += "...";
  for (let i = 0; i < 4; i++) address += chars[Math.floor(Math.random() * chars.length)];
  return address;
}

export function generateInitialTrades(token: TokenData): LiveTrade[] {
  const trades: LiveTrade[] = [];
  const now = new Date();
  
  const kols = ["@useransem", "@sartoshi", "@mitch", "@cobie", "@chad_alpha"];

  for (let i = 0; i < 20; i++) {
    const elapsedSeconds = i * (5 + Math.floor(Math.random() * 25));
    const timestamp = new Date(now.getTime() - elapsedSeconds * 1000);
    const type = Math.random() > 0.45 ? "buy" : "sell";
    const amountSol = 0.05 + Math.exp(Math.random() * 3.5);
    const amountToken = (amountSol * 145.20) / token.priceUsd;
    const isKOL = Math.random() > 0.85;

    trades.push({
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      type,
      amountSol,
      amountToken,
      priceUsd: token.priceUsd * (1 + (Math.random() - 0.5) * 0.01),
      wallet: isKOL ? kols[Math.floor(Math.random() * kols.length)] : getRandomWallet(),
      isKOL
    });
  }

  return trades;
}
