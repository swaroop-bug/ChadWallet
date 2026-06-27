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
  [DEFAULT_TOKENS.WIF]: { name: "dogwifhat", symbol: "WIF", priceUsd: 2.12, priceChange24h: -5.4, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJojMFJ2pcwCcJ857T77S4Z95o39sWn8w1TAqNM/logo.png" },
  [DEFAULT_TOKENS.BONK]: { name: "Bonk", symbol: "BONK", priceUsd: 0.0000214, priceChange24h: 12.8, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrFcPy8Gssw3tRe5xrgZksHW5BiJa3hxks/logo.png" },
  [DEFAULT_TOKENS.POPCAT]: { name: "Popcat", symbol: "POPCAT", priceUsd: 0.74, priceChange24h: 8.9, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7GCih6b43KMAEq2jLD61AyccRsmXQC1qWdC15C1mFwP1/logo.png" },
  [DEFAULT_TOKENS.BOME]: { name: "BOOK OF MEME", symbol: "BOME", priceUsd: 0.0094, priceChange24h: -1.2, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ukHH6c7m4k47Qd4b4je4GNWx4M9ifk8YQGDWf6tBptP/logo.png" },
  [DEFAULT_TOKENS.MEW]: { name: "cat in a dogs world", symbol: "MEW", priceUsd: 0.0048, priceChange24h: 4.6, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MEW1242Y6t8MCuVEVxGKG4H7EwXtuT6kPV4n2E9upc8/logo.png" },
  [DEFAULT_TOKENS.WEN]: { name: "Wen", symbol: "WEN", priceUsd: 0.000154, priceChange24h: -2.3, iconUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/WENwcehpvTE0wJ8KU25RspvUq6FMURtJvcrEwJaZJZr/logo.png" },
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
    const addressesToFetch = DEFAULT_TOKENS_LIST.filter(addr => addr !== DEFAULT_TOKENS.CHAD);
    const promises = addressesToFetch.map(async (address) => {
      const res = await fetch(`/api/birdeye?endpoint=defi/token_overview&address=${address}`);
      if (!res.ok) throw new Error("Birdeye fetch failed");
      const body = await res.json();
      if (!body.success || !body.data) throw new Error("Birdeye returned success=false");
      const item = body.data;
      return {
        address,
        name: item.name || item.symbol || "Unknown",
        symbol: item.symbol || "UNKNOWN",
        priceUsd: parseFloat(item.price) || 0,
        priceChange24h: parseFloat(item.priceChange24hPercent || item.priceChange24h || 0),
        volume24h: parseFloat(item.v24hUSD || item.v24h || item.volume24hUSD || 0),
        liquidity: parseFloat(item.liquidity || 0),
        fdv: parseFloat(item.mc || 0),
        iconUrl: item.logoURI || item.extensions?.logoURI || undefined,
      };
    });

    const birdeyeTokens = await Promise.all(promises);
    return [getMockChadToken(), ...birdeyeTokens];
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

  if (query.length >= 32 && query.length <= 44) {
    try {
      const res = await fetch(`/api/birdeye?endpoint=defi/token_overview&address=${query}`);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const item = body.data;
          return [{
            address: query,
            name: item.name || item.symbol || "Unknown",
            symbol: item.symbol || "UNKNOWN",
            priceUsd: parseFloat(item.price) || 0,
            priceChange24h: parseFloat(item.priceChange24hPercent || item.priceChange24h || 0),
            volume24h: parseFloat(item.v24hUSD || item.v24h || item.volume24hUSD || 0),
            liquidity: parseFloat(item.liquidity || 0),
            fdv: parseFloat(item.mc || 0),
            iconUrl: item.logoURI || item.extensions?.logoURI || undefined,
          }];
        }
      }
    } catch {
      // ignore and continue
    }
  }

  try {
    const res = await fetch(`/api/birdeye?endpoint=defi/v3/search&keyword=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error();
    
    const body = await res.json();
    if (body.success && body.data?.items) {
      const tokenItems = body.data.items.find((group: any) => group.type === "token")?.result || [];
      const searchResults: TokenData[] = tokenItems.slice(0, 15).map((item: any) => ({
        address: item.address,
        name: item.name || item.symbol,
        symbol: item.symbol,
        priceUsd: parseFloat(item.price) || 0,
        priceChange24h: parseFloat(item.priceChange24hPercent || 0),
        volume24h: parseFloat(item.v24hUSD || 0),
        liquidity: parseFloat(item.liquidity || 0),
        fdv: parseFloat(item.mc || 0),
        iconUrl: item.logoURI,
      }));
      if (searchResults.length > 0) return searchResults;
    }
    throw new Error("No birdeye items");
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
