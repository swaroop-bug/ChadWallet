/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { fetchTokens, searchTokens, TokenData, DEFAULT_TOKENS } from "@/services/tokens";
import TrendingList from "@/components/trade/TrendingList";
import TokenDetails from "@/components/trade/TokenDetails";
import SwapWidget from "@/components/trade/SwapWidget";
import { ArrowLeft, Coins, RefreshCw, CheckCircle, ShieldAlert, BadgeInfo } from "lucide-react";

interface Position {
  amount: number;
  avgBuyPrice: number;
  totalCost: number;
}

function TradeWorkspace() {
  const searchParams = useSearchParams();
  const { login, authenticated, ready, user } = usePrivy();
  
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [activeToken, setActiveToken] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [solBalance, setSolBalance] = useState(10.0); // starts with 10 SOL default
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [isSandboxMode, setIsSandboxMode] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchTokens();
      setTokens(data);
      
      const queryToken = searchParams ? (searchParams as any).get("token") : null;
      if (queryToken) {
        const found = data.find(t => t.symbol.toLowerCase() === queryToken.toLowerCase());
        if (found) {
          setActiveToken(found);
        } else {
          setActiveToken(data.find(t => t.symbol === "CHAD") || data[0] || null);
        }
      } else {
        setActiveToken(data.find(t => t.symbol === "CHAD") || data[0] || null);
      }
      setIsLoading(false);
    }
    loadData();

    const savedSol = localStorage.getItem("chad_mock_sol");
    if (savedSol) setSolBalance(parseFloat(savedSol));

    const savedPos = localStorage.getItem("chad_mock_positions");
    if (savedPos) setPositions(JSON.parse(savedPos));
  }, [searchParams]);

  const handleSelectToken = (token: TokenData) => {
    setActiveToken(token);
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const data = await searchTokens(query);
    setTokens(data);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    const data = await fetchTokens();
    setTokens(data);
    
    if (activeToken) {
      const updated = data.find(t => t.address === activeToken.address);
      if (updated) setActiveToken(updated);
    }
    setIsLoading(false);
  };

  const handleSwapSuccess = (
    type: "buy" | "sell",
    amountSol: number,
    amountToken: number,
    priceUsd: number
  ) => {
    if (!activeToken) return;

    let nextSol = solBalance;
    const nextPositions = { ...positions };
    const currentPos = nextPositions[activeToken.address] || { amount: 0, avgBuyPrice: 0, totalCost: 0 };

    if (type === "buy") {
      nextSol = solBalance - amountSol;
      
      const newAmount = currentPos.amount + amountToken;
      const newTotalCost = currentPos.totalCost + amountSol * 145.2;
      const newAvgBuy = newAmount > 0 ? newTotalCost / newAmount : 0;
      
      nextPositions[activeToken.address] = {
        amount: newAmount,
        avgBuyPrice: newAvgBuy,
        totalCost: newTotalCost
      };
    } else {
      nextSol = solBalance + amountSol;
      
      const soldRatio = Math.min(1, amountToken / currentPos.amount);
      const remainingCost = currentPos.totalCost * (1 - soldRatio);
      const remainingAmount = Math.max(0, currentPos.amount - amountToken);
      
      if (remainingAmount <= 0) {
        delete nextPositions[activeToken.address];
      } else {
        nextPositions[activeToken.address] = {
          amount: remainingAmount,
          avgBuyPrice: remainingAmount > 0 ? remainingCost / remainingAmount : 0,
          totalCost: remainingCost
        };
      }
    }

    setSolBalance(nextSol);
    setPositions(nextPositions);
    
    localStorage.setItem("chad_mock_sol", nextSol.toString());
    localStorage.setItem("chad_mock_positions", JSON.stringify(nextPositions));
  };

  const getWalletDisplay = () => {
    const u = user as any;
    if (!u) return "";
    if (u.wallet?.address) {
      const addr = u.wallet.address;
      return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
    }
    if (u.email?.address) return u.email.address;
    if (u.google?.email) return u.google.email;
    if (u.apple?.email) return u.apple.email;
    return "Connected";
  };

  const activeTokenBalance = activeToken ? (positions[activeToken.address]?.amount || 0) : 0;
  const activePosition = activeToken ? (positions[activeToken.address] || null) : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#06070a] text-gray-100">
      
      <header className="w-full border-b border-dark-border bg-[#08090d]/80 backdrop-blur-md px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          
          <div className="h-4 w-[1px] bg-dark-border hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight text-white">
              CHAD<span className="text-brand-primary">WALLET</span>
            </span>
            <span className="text-[9px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              Terminal Workspace v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <Coins className="w-3.5 h-3.5 text-brand-secondary animate-spin-slow" />
            SOL/USD: <span className="text-white font-bold">$145.20</span>
          </div>

          <div 
            onClick={() => setIsSandboxMode(!isSandboxMode)}
            className="flex items-center gap-1.5 text-[10px] font-bold font-sans cursor-pointer px-2 py-1 rounded bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] hover:bg-[#fbbf24]/20 transition-all select-none"
            title="Simulated balance"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            DEMO MODE
          </div>

          <div className="h-4 w-[1px] bg-dark-border hidden sm:block"></div>

          {ready && authenticated ? (
            <div className="flex items-center gap-2 text-xs font-bold font-sans px-3.5 py-1.5 bg-[#14f195]/15 border border-[#14f195]/20 text-[#14f195] rounded-xl shadow-[0_0_10px_rgba(20,241,149,0.05)]">
              <CheckCircle className="w-3.5 h-3.5" />
              {getWalletDisplay()}
            </div>
          ) : (
            <button 
              onClick={() => login()}
              className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/10 shadow-md shadow-brand-primary/10"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        <div className="lg:col-span-3 h-[400px] lg:h-[calc(100vh-140px)] min-h-0">
          <TrendingList 
            tokens={tokens}
            activeToken={activeToken}
            onSelectToken={handleSelectToken}
            onSearch={handleSearch}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="lg:col-span-6 h-[600px] lg:h-[calc(100vh-140px)] min-h-0 flex flex-col">
          <TokenDetails token={activeToken} />
        </div>

        <div className="lg:col-span-3 h-auto lg:h-[calc(100vh-140px)] overflow-y-auto flex flex-col gap-6 scrollbar-none pr-1">
          <SwapWidget 
            token={activeToken}
            solBalance={solBalance}
            tokenBalance={activeTokenBalance}
            position={activePosition}
            onSwapSuccess={handleSwapSuccess}
          />
        </div>

      </div>

    </div>
  );
}

export default function TradePage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-[#06070a] text-gray-100 min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
        <span className="text-xs text-gray-500 font-mono mt-3">Initializing Chad Terminal...</span>
      </div>
    }>
      <TradeWorkspace />
    </React.Suspense>
  );
}
