/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { TokenData } from "@/services/tokens";
import { fetchJupiterQuote, SwapQuote } from "@/services/jupiter";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowUpDown, RefreshCw, Wallet, Flame, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import confetti from "canvas-confetti";

interface SwapWidgetProps {
  token: TokenData | null;
  solBalance: number;
  tokenBalance: number;
  position: {
    amount: number;
    avgBuyPrice: number;
    totalCost: number;
  } | null;
  onSwapSuccess: (type: "buy" | "sell", amountSol: number, amountToken: number, priceUsd: number) => void;
}

export default function SwapWidget({
  token,
  solBalance,
  tokenBalance,
  position,
  onSwapSuccess
}: SwapWidgetProps) {
  const { login, authenticated } = usePrivy();
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [executingSwap, setExecutingSwap] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [slippage, setSlippage] = useState("0.5");

  useEffect(() => {
    if (!token || !inputAmount || parseFloat(inputAmount) <= 0) {
      setOutputAmount("");
      setQuote(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingQuote(true);
      try {
        const amt = parseFloat(inputAmount);
        
        const inMint = tab === "buy" ? "So11111111111111111111111111111111111111112" : token.address;
        const outMint = tab === "buy" ? token.address : "So11111111111111111111111111111111111111112";
        const inSymbol = tab === "buy" ? "SOL" : token.symbol;
        const outSymbol = tab === "buy" ? token.symbol : "SOL";

        const q = await fetchJupiterQuote(inMint, outMint, amt, inSymbol, outSymbol);
        setQuote(q);
        setOutputAmount(q.outputAmount.toFixed(token.symbol === "BONK" ? 2 : 4));
      } catch (err) {
        console.error("Quote failed", err);
      } finally {
        setLoadingQuote(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [inputAmount, tab, token]);

  if (!token) return null;

  const handlePresetClick = (amount: number) => {
    if (tab === "buy") {
      setInputAmount(amount.toString());
    } else {
      const pctAmount = tokenBalance * (amount / 100);
      setInputAmount(pctAmount.toFixed(4));
    }
  };

  const handleMaxClick = () => {
    if (tab === "buy") {
      const maxSol = Math.max(0, solBalance - 0.01);
      setInputAmount(maxSol.toFixed(4));
    } else {
      setInputAmount(tokenBalance.toString());
    }
  };

  const handleSwapExecute = async () => {
    if (!authenticated) {
      login();
      return;
    }

    const amt = parseFloat(inputAmount);
    const outAmt = parseFloat(outputAmount);
    
    if (isNaN(amt) || amt <= 0 || isNaN(outAmt) || outAmt <= 0) return;

    if (tab === "buy" && amt > solBalance) {
      alert("Insufficient SOL balance!");
      return;
    }

    if (tab === "sell" && amt > tokenBalance) {
      alert(`Insufficient $${token.symbol} balance!`);
      return;
    }

    setExecutingSwap(true);

    setTimeout(() => {
      setExecutingSwap(false);
      
      const pricePaid = token.priceUsd;
      
      if (tab === "buy") {
        onSwapSuccess("buy", amt, outAmt, pricePaid);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#606af7", "#14f195", "#9945ff"]
        });
      } else {
        onSwapSuccess("sell", outAmt, amt, pricePaid);
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#ef4444", "#f59e0b"]
        });
      }
      
      setInputAmount("");
      setOutputAmount("");
      setQuote(null);
    }, 1200);
  };

  const hasPosition = position && position.amount > 0;
  const currentValUsd = hasPosition ? position.amount * token.priceUsd : 0;
  const rawProfitUsd = hasPosition ? currentValUsd - position.totalCost : 0;
  const pnlPercent = hasPosition && position.totalCost > 0 ? (rawProfitUsd / position.totalCost) * 100 : 0;
  const isPnlPositive = rawProfitUsd >= 0;

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="bg-dark-surface/40 border border-dark-border rounded-2xl p-4 flex flex-col glass-panel relative overflow-hidden">
        
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
            <Wallet className="w-3.5 h-3.5 text-brand-primary" />
            Jupiter Swap Aggregator
          </span>
          <div className="flex items-center gap-1">
            <span>Slippage:</span>
            {["0.5", "1.0", "Auto"].map((slip) => (
              <button
                key={slip}
                onClick={() => setSlippage(slip)}
                className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  slippage === slip 
                    ? "bg-brand-primary/20 text-[#a78bfa] border border-brand-primary/30" 
                    : "bg-[#0c0e14] hover:bg-[#111420]/60 text-gray-400 border border-transparent"
                }`}
              >
                {slip}%
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 bg-[#08090d]/60 rounded-xl p-1 border border-dark-border/60 mb-4">
          <button
            onClick={() => { setTab("buy"); setInputAmount(""); setOutputAmount(""); setQuote(null); }}
            className={`py-2 text-xs uppercase font-extrabold tracking-wider rounded-lg transition-all cursor-pointer ${
              tab === "buy" 
                ? "bg-[#181d31] text-emerald-400 shadow-sm border border-emerald-500/10" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Buy Token
          </button>
          <button
            onClick={() => { setTab("sell"); setInputAmount(""); setOutputAmount(""); setQuote(null); }}
            className={`py-2 text-xs uppercase font-extrabold tracking-wider rounded-lg transition-all cursor-pointer ${
              tab === "sell" 
                ? "bg-[#181d31] text-rose-400 shadow-sm border border-rose-500/10" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Sell Token
          </button>
        </div>

        <div className="bg-[#08090d]/60 border border-dark-border/60 rounded-xl p-3.5 flex flex-col mb-2.5">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5 font-mono">
            <span>You Pay</span>
            <span>
              Balance: {tab === "buy" ? `${solBalance.toFixed(3)} SOL` : `${tokenBalance.toFixed(2)} ${token.symbol}`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              disabled={executingSwap}
              className="bg-transparent border-none text-xl font-bold font-mono focus:outline-none focus:ring-0 text-white w-full placeholder-gray-700"
            />
            <span className="font-extrabold text-sm text-gray-300 bg-[#12131a] px-2.5 py-1.5 rounded-lg border border-dark-border">
              {tab === "buy" ? "SOL" : token.symbol}
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full border border-dark-border/80 bg-[#08090d]/80 flex items-center justify-center mx-auto -my-1 z-10 text-gray-500 hover:text-white transition-colors cursor-pointer">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </div>

        <div className="bg-[#08090d]/60 border border-dark-border/60 rounded-xl p-3.5 flex flex-col mt-2.5 mb-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5 font-mono">
            <span>You Receive</span>
            <span>
              Balance: {tab === "buy" ? `${tokenBalance.toFixed(2)} ${token.symbol}` : `${solBalance.toFixed(3)} SOL`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="0.0"
              value={outputAmount}
              readOnly
              className="bg-transparent border-none text-xl font-bold font-mono focus:outline-none focus:ring-0 text-gray-300 w-full placeholder-gray-700"
            />
            <span className="font-extrabold text-sm text-gray-300 bg-[#12131a] px-2.5 py-1.5 rounded-lg border border-dark-border">
              {tab === "buy" ? token.symbol : "SOL"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-5 text-[10px] font-mono font-bold">
          {tab === "buy" ? (
            [0.1, 0.5, 1.0, 5.0].map((amt) => (
              <button
                key={amt}
                onClick={() => handlePresetClick(amt)}
                className="py-1.5 bg-[#0c0e14]/80 hover:bg-[#111420] border border-dark-border/60 hover:border-dark-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                +{amt} SOL
              </button>
            ))
          ) : (
            [25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePresetClick(pct)}
                className="py-1.5 bg-[#0c0e14]/80 hover:bg-[#111420] border border-dark-border/60 hover:border-dark-border text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                {pct}%
              </button>
            ))
          )}
          <button
            onClick={handleMaxClick}
            className="py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-[#a78bfa] rounded-lg transition-colors cursor-pointer"
          >
            MAX
          </button>
        </div>

        {quote && (
          <div className="flex flex-col gap-1.5 px-1 pb-4 text-[10px] font-mono text-gray-500 border-b border-dark-border/30 mb-4 animate-fadeIn">
            <div className="flex justify-between">
              <span>Rate:</span>
              <span className="text-gray-300">1 {quote.inputSymbol} = {quote.rate.toFixed(token.symbol === "BONK" ? 2 : 4)} {quote.outputSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact:</span>
              <span className={quote.priceImpactPct > 1.0 ? "text-amber-500" : "text-emerald-400"}>
                {quote.priceImpactPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Path Routing:</span>
              <span className="text-brand-secondary">{quote.routePlan[0]?.name || "Jupiter Dynamic Pool"}</span>
            </div>
            <div className="flex justify-between">
              <span>Aggregator Swap Fee:</span>
              <span className="text-gray-400">~{quote.feeAmount} SOL</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSwapExecute}
          disabled={executingSwap || loadingQuote || !inputAmount || parseFloat(inputAmount) <= 0}
          className={`w-full py-4 text-sm font-extrabold rounded-2xl uppercase tracking-wider transition-all border border-white/10 shadow-lg cursor-pointer ${
            !authenticated 
              ? "bg-brand-primary hover:bg-brand-primary-dark text-white shadow-brand-primary/20" 
              : executingSwap 
                ? "bg-[#1e2338]/60 text-gray-500 border-none shadow-none cursor-not-allowed" 
                : tab === "buy" 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
          }`}
        >
          {executingSwap ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Swapping on Solana...
            </span>
          ) : !authenticated ? (
            "Connect Wallet to Swap"
          ) : tab === "buy" ? (
            `Buy $${token.symbol}`
          ) : (
            `Sell $${token.symbol}`
          )}
        </button>

      </div>

      <div className="bg-dark-surface/40 border border-dark-border rounded-2xl p-4 flex flex-col glass-panel">
        <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#14f195]" />
          Your Active Position
        </h3>

        {hasPosition ? (
          <div className="flex flex-col font-mono text-xs text-gray-400 gap-2.5">
            <div className="flex justify-between">
              <span>Your Balance:</span>
              <span className="text-gray-200 font-bold font-sans">
                {position.amount.toFixed(2)} ${token.symbol}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Current Value:</span>
              <span className="text-white font-bold font-sans">
                ${currentValUsd.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Average Buy Price:</span>
              <span className="text-gray-300">
                ${position.avgBuyPrice < 0.01 ? position.avgBuyPrice.toFixed(6) : position.avgBuyPrice.toFixed(4)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Cost Basis:</span>
              <span className="text-gray-300">${position.totalCost.toFixed(2)}</span>
            </div>

            <div className={`mt-2 p-3 rounded-xl border flex items-center justify-between ${
              isPnlPositive 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Unrealized P&L</span>
                <span className="text-sm font-black font-sans">
                  {isPnlPositive ? "+" : ""}${rawProfitUsd.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-1 font-bold text-xs font-sans">
                {isPnlPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPnlPositive ? "+" : ""}{pnlPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-500 font-mono">
            You do not own any ${token.symbol}.
          </div>
        )}
      </div>
    </div>
  );
}
