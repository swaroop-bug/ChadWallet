/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { TokenData, LiveTrade, TokenHolder, generateHolders, generateInitialTrades, getRandomWallet } from "@/services/tokens";
import { Copy, Check, Users, MessageSquareCode, Clock, Coins, UserCheck, BarChart2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface TokenDetailsProps {
  token: TokenData | null;
}

export default function TokenDetails({ token }: TokenDetailsProps) {
  const [activeTab, setActiveTab] = useState<"trades" | "holders">("trades");
  const [copied, setCopied] = useState(false);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    setTrades(generateInitialTrades(token));
    setHolders(generateHolders(token));

    const points = [];
    const basePrice = token.priceUsd;
    let currentPrice = basePrice * 0.4;
    const now = Date.now();
    
    for (let i = 0; i < 30; i++) {
      const multiplier = 1 + (Math.random() - 0.3) * 0.08 + (i * 0.04);
      currentPrice = currentPrice * multiplier;
      points.push({
        time: new Date(now - (30 - i) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        Price: parseFloat(currentPrice.toFixed(token.symbol === "BONK" ? 8 : 4))
      });
    }
    setChartData(points);
  }, [token]);

  useEffect(() => {
    if (!token || activeTab !== "trades") return;

    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.45;
      const amountSol = 0.05 + Math.exp(Math.random() * 2.8);
      const amountToken = (amountSol * 145.2) / token.priceUsd;
      const isKOL = Math.random() > 0.9;
      const kols = ["@useransem", "@sartoshi", "@mitch", "@cobie"];
      
      const newTrade: LiveTrade = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        type: isBuy ? "buy" : "sell",
        amountSol,
        amountToken,
        priceUsd: token.priceUsd * (1 + (Math.random() - 0.5) * 0.005),
        wallet: isKOL ? kols[Math.floor(Math.random() * kols.length)] : getRandomWallet(),
        isKOL
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 39)]);
    }, 2000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [token, activeTab]);

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-surface/20 border border-dark-border rounded-2xl p-10 text-center glass-panel">
        <Coins className="w-12 h-12 text-gray-600 mb-4 animate-bounce" />
        <h3 className="font-bold text-lg mb-1 text-gray-300">No Token Selected</h3>
        <p className="text-gray-500 text-xs max-w-xs">
          Select a token from the trending list on the left to start analyzing chart feeds and holders.
        </p>
      </div>
    );
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isChadToken = token.symbol === "CHAD";

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-surface/40 border border-dark-border rounded-2xl overflow-hidden glass-panel">
      <div className="p-4 border-b border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0c0e14]/40">
        <div className="flex items-center gap-3">
          {token.iconUrl ? (
            <img 
              src={token.iconUrl} 
              alt={token.symbol} 
              className="w-10 h-10 rounded-full object-cover border border-dark-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/logo/light.png";
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary border border-dark-border">
              {token.symbol[0]}
            </div>
          )}
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">${token.symbol}</h2>
              <span className="text-xs text-gray-400 font-medium truncate max-w-[120px] sm:max-w-none">
                {token.name}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-gray-500 font-mono">
                {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 6)}
              </span>
              <button 
                onClick={handleCopyAddress}
                className="p-1 hover:bg-[#1a1e30] rounded text-gray-500 hover:text-white transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3 text-[#14f195]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">Price</span>
            <span className="font-mono font-bold text-sm text-gray-200">
              ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">24h Change</span>
            <span className={`font-mono font-bold text-sm ${token.priceChange24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {token.priceChange24h >= 0 ? "+" : ""}{token.priceChange24h.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs text-gray-500">24h Volume</span>
            <span className="font-mono text-xs text-gray-300 font-medium">
              ${token.volume24h >= 1000000 
                ? `${(token.volume24h / 1000000).toFixed(1)}M` 
                : token.volume24h.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-dark-border bg-[#08090d]/20 py-2.5 px-4 text-xs font-mono text-gray-400">
        <div>
          Liquidity: <span className="text-gray-200 font-bold">${token.liquidity >= 1000000 ? `${(token.liquidity / 1000000).toFixed(1)}M` : token.liquidity.toLocaleString()}</span>
        </div>
        <div className="text-center">
          FDV: <span className="text-gray-200 font-bold">${token.fdv >= 1000000 ? `${(token.fdv / 1000000).toFixed(1)}M` : token.fdv.toLocaleString()}</span>
        </div>
        <div className="text-end">
          Network: <span className="text-brand-secondary font-bold">Solana</span>
        </div>
      </div>

      <div className="h-[280px] sm:h-[340px] bg-black/40 border-b border-dark-border relative flex flex-col justify-center">
        {isChadToken ? (
          <div className="w-full h-full p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 px-2 font-mono">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                CHAD/SOL Chart (Simulated 1h Candles)
              </span>
              <span className="text-[#14f195]">Live Ticker</span>
            </div>
            <div className="h-[200px] sm:h-[260px] w-full mt-2">
              <ResponsiveContainer width="100%" height="95%">
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#606af7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#606af7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#4b5563" fontSize={9} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#4b5563" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111420', borderColor: '#1e2338', color: '#f3f4f6' }}
                    labelClassName="text-[10px] font-mono text-gray-400"
                  />
                  <Area type="monotone" dataKey="Price" stroke="#606af7" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <iframe 
            src={`https://birdeye.so/tv-widget/${token.address}?chain=solana&viewMode=pair&chartInterval=15&chartType=candle&chartTheme=dark`}
            title={`${token.symbol} Price Chart`}
            className="w-full h-full border-none opacity-90"
            allow="clipboard-write"
          />
        )}
      </div>

      <div className="flex border-b border-dark-border bg-[#08090d]/30">
        <button
          onClick={() => setActiveTab("trades")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "trades" 
              ? "border-brand-primary text-white bg-brand-primary/5" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Live Trades
        </button>

        <button
          onClick={() => setActiveTab("holders")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "holders" 
              ? "border-brand-primary text-white bg-brand-primary/5" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Top Holders
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-[#08090d]/10">
        {activeTab === "trades" && (
          <div className="w-full text-xs">
            <div className="grid grid-cols-4 px-4 py-2 border-b border-dark-border/40 font-mono text-gray-500 bg-[#0c0e14]/20 sticky top-0 z-10 backdrop-blur-sm">
              <div>Time</div>
              <div className="text-right">Action</div>
              <div className="text-right">Amount (SOL)</div>
              <div className="text-right">Wallet</div>
            </div>
            
            <div className="divide-y divide-dark-border/20">
              {trades.map((trade) => {
                const isBuy = trade.type === "buy";
                return (
                  <div 
                    key={trade.id} 
                    className="grid grid-cols-4 px-4 py-2.5 font-mono items-center hover:bg-[#111420]/30 transition-colors animate-fadeIn"
                  >
                    <div className="text-gray-500">
                      {trade.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className={`text-right font-bold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                      {trade.type.toUpperCase()}
                    </div>
                    <div className="text-right text-gray-300">
                      {trade.amountSol.toFixed(2)} SOL
                    </div>
                    <div className="text-right flex items-center justify-end gap-1 font-sans">
                      {trade.isKOL && (
                        <span className="px-1 py-0.5 rounded text-[8px] bg-brand-purple/20 text-[#c084fc] border border-[#a78bfa]/20 font-bold flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5" />
                          KOL
                        </span>
                      )}
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-mono">
                        {trade.wallet}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "holders" && (
          <div className="w-full text-xs">
            <div className="grid grid-cols-4 px-4 py-2 border-b border-dark-border/40 font-mono text-gray-500 bg-[#0c0e14]/20 sticky top-0 z-10 backdrop-blur-sm">
              <div>Rank</div>
              <div>Holder Address</div>
              <div className="text-right">Quantity</div>
              <div className="text-right">Percentage</div>
            </div>

            <div className="divide-y divide-dark-border/20">
              {holders.map((holder) => (
                <div 
                  key={holder.rank}
                  className="grid grid-cols-4 px-4 py-2.5 font-mono items-center hover:bg-[#111420]/30 transition-colors"
                >
                  <div className="text-gray-500 font-bold">#{holder.rank}</div>
                  <div className="flex items-center gap-1 font-sans text-gray-300">
                    {holder.isKOL && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#14f195]/15 text-[#14f195] border border-[#14f195]/20 font-extrabold flex items-center gap-0.5" title={`${holder.kolName} verified account`}>
                        <UserCheck className="w-2.5 h-2.5" />
                        {holder.kolName}
                      </span>
                    )}
                    <span className="font-mono text-xs text-gray-400">
                      {holder.wallet}
                    </span>
                  </div>
                  <div className="text-right text-gray-300">
                    {holder.balance >= 1000000 
                      ? `${(holder.balance / 1000000).toFixed(1)}M` 
                      : Math.round(holder.balance).toLocaleString()}
                  </div>
                  <div className="text-right font-bold text-gray-200">
                    {holder.percentage.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
