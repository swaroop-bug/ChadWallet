/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { TokenData } from "@/services/tokens";
import { Search, Flame, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface TrendingListProps {
  tokens: TokenData[];
  activeToken: TokenData | null;
  onSelectToken: (token: TokenData) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

type TabType = "all" | "trending" | "gainers" | "losers";

export default function TrendingList({
  tokens,
  activeToken,
  onSelectToken,
  onSearch,
  isLoading,
  onRefresh
}: TrendingListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const getFilteredTokens = () => {
    let list = [...tokens];
    
    if (activeTab === "trending") {
      list.sort((a, b) => b.volume24h - a.volume24h);
    } else if (activeTab === "gainers") {
      list = list.filter(t => t.priceChange24h > 0).sort((a, b) => b.priceChange24h - a.priceChange24h);
    } else if (activeTab === "losers") {
      list = list.filter(t => t.priceChange24h < 0).sort((a, b) => a.priceChange24h - b.priceChange24h);
    }

    return list;
  };

  const filteredTokens = getFilteredTokens();

  return (
    <div className="flex flex-col h-full bg-dark-surface/40 border border-dark-border rounded-2xl overflow-hidden glass-panel">
      <div className="p-4 border-b border-dark-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-brand-primary animate-pulse" />
            Tokens List
          </h3>
          <button 
            onClick={onRefresh} 
            disabled={isLoading}
            className="p-1.5 hover:bg-[#1a1e30] border border-dark-border/80 text-gray-400 hover:text-white rounded-lg transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-primary" : ""}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search symbol or address..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#08090d]/80 border border-dark-border hover:border-dark-border-hover focus:border-brand-primary/50 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-dark-border bg-[#08090d]/30 text-center">
        {(["all", "trending", "gainers", "losers"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === tab 
                ? "border-brand-primary text-white bg-brand-primary/5" 
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-dark-border/30">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
            <span className="text-xs text-gray-500 font-mono">Loading Raydium markets...</span>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500 font-mono">
            No tokens found.
          </div>
        ) : (
          filteredTokens.map((token) => {
            const isActive = activeToken?.address === token.address;
            const isPositive = token.priceChange24h >= 0;
            return (
              <button
                key={token.address}
                onClick={() => onSelectToken(token)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all cursor-pointer ${
                  isActive 
                    ? "bg-[#181d31] border-l-2 border-brand-primary" 
                    : "hover:bg-[#0c0f1a]/80"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {token.iconUrl ? (
                    <img 
                      src={token.iconUrl} 
                      alt={token.symbol} 
                      className="w-7 h-7 rounded-full object-cover border border-dark-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/logo/light.png";
                      }}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs font-bold border border-dark-border text-brand-primary">
                      {token.symbol[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col">
                    <span className="font-extrabold text-sm text-gray-200 truncate">
                      ${token.symbol}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate">
                      {token.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="font-mono font-bold text-xs text-gray-200">
                    ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-400" />
                    )}
                    <span className={`text-[10px] font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}{token.priceChange24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
