/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { 
  fetchTokens, 
  TokenData 
} from "@/services/tokens";
import { 
  ArrowUpRight, 
  Smartphone, 
  Zap, 
  Users, 
  Coins, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Play,
  CheckCircle,
  PlayCircle
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { login, logout, authenticated, ready, user } = usePrivy();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchTokens();
      setTokens(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStartTrading = () => {
    if (authenticated) {
      router.push("/trade");
    } else {
      login();
    }
  };

  const getWalletDisplay = () => {
    const u = user as any;
    if (!u || !u.wallet) return "";
    const addr = u.wallet.address;
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  const renderChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`text-xs font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
        {isPositive ? "+" : ""}{change.toFixed(1)}%
      </span>
    );
  };

  const topMarquee = tokens.slice(0, Math.ceil(tokens.length / 2));
  const bottomMarquee = tokens.slice(Math.ceil(tokens.length / 2));

  const renderMarqueeItems = (marqueeTokens: TokenData[]) => {
    if (marqueeTokens.length === 0) return null;
    const duplicated = [...marqueeTokens, ...marqueeTokens, ...marqueeTokens, ...marqueeTokens];
    return duplicated.map((token, idx) => (
      <Link 
        key={`${token.symbol}-${idx}`} 
        href={`/trade?token=${token.symbol}`}
        className="flex items-center gap-3 px-6 py-3 border-r border-[#1e2338]/40 hover:bg-[#1a1e30] transition-colors group cursor-pointer"
      >
        {token.iconUrl ? (
          <img 
            src={token.iconUrl || "/assets/logo/light.png"} 
            alt={token.symbol} 
            className="w-5 h-5 rounded-full object-cover border border-[#1e2338]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/logo/light.png";
            }}
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold border border-[#1e2338]">
            {token.symbol[0]}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-gray-200 group-hover:text-brand-primary transition-colors">
              ${token.symbol}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              ${token.priceUsd < 0.001 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {renderChange(token.priceChange24h)}
          </div>
        </div>
      </Link>
    ));
  };

  return (
    <div className="flex-1 flex flex-col relative w-full bg-[#06070a] overflow-x-hidden">
      
      <div className="ticker-wrap select-none border-b border-[#1e2338]/60 bg-black/40">
        <div className="ticker-container animate-marquee-left">
          {renderMarqueeItems(topMarquee)}
        </div>
      </div>

      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-purple p-[1px] shadow-lg shadow-brand-primary/10">
            <div className="w-full h-full bg-[#0c0e14] rounded-[11px] flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/logo/dark.png" 
                alt="ChadWallet logo" 
                className="w-8 h-8 object-contain scale-110" 
              />
            </div>
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            CHAD<span className="text-brand-primary font-bold">WALLET</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/trade" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block">
            Terminal
          </Link>
          
          {ready && authenticated && (user as any)?.wallet ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/trade" 
                className="px-4 py-2 text-xs font-bold bg-[#14f195]/20 text-[#14f195] border border-[#14f195]/30 rounded-xl hover:bg-[#14f195]/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(20,241,149,0.05)]"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {getWalletDisplay()}
              </Link>
              <button 
                onClick={() => logout()} 
                title="Disconnect Wallet"
                className="p-2 bg-[#1e2338]/40 border border-[#1e2338]/60 text-gray-400 hover:text-rose-400 hover:border-rose-500/20 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => login()}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-brand-primary/20 flex items-center gap-2 border border-white/10"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <section className="relative w-full max-w-7xl mx-auto px-6 pt-12 pb-24 flex flex-col items-center justify-center text-center z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold mb-6 animate-pulse-slow">
          <Coins className="w-3.5 h-3.5" />
          The Social Crypto Terminal for Solana Chads
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Meme coin trading, <br />
          <span className="text-gradient-purple-blue font-black relative">
            but social.
            <span className="absolute bottom-1 left-0 w-full h-[6px] bg-brand-primary/20 -z-10 rounded-full blur-[2px]"></span>
          </span>
        </h1>

        <p className="text-base sm:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
          Track top KOL positions, swap instantly with Jupiter aggregator routing, and monitor your portfolio live in a sleek glassmorphic dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 z-20">
          <button 
            onClick={handleStartTrading}
            className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-2.5 group cursor-pointer border border-white/10"
          >
            Start Trading 
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
          
          <a 
            href="#download"
            className="w-full sm:w-auto px-8 py-4 bg-[#111420]/80 border border-[#1e2338] hover:border-brand-primary/40 text-gray-200 hover:text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2.5"
          >
            <Smartphone className="w-5 h-5" />
            Get Mobile App
          </a>
        </div>

        <div className="w-full max-w-5xl rounded-3xl overflow-hidden glass-panel border border-[#1e2338]/60 p-2 sm:p-4 shadow-2xl shadow-black/80 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2338]/40 bg-[#08090d]/60 rounded-t-2xl">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <div className="px-6 py-1 bg-black/60 rounded-lg text-xs font-mono text-gray-500 border border-[#1e2338]/60">
              chadwallet.xyz/trade
            </div>
            <div className="w-12"></div>
          </div>

          <div className="relative aspect-[16/9] w-full bg-[#08090d] rounded-b-2xl overflow-hidden flex items-center justify-center">
            <img 
              src="/assets/flow/buy-sell-4.png"
              alt="ChadWallet Terminal Dashboard Preview"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:scale-[1.01] transition-transform duration-700"
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs">
              <button 
                onClick={handleStartTrading}
                className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary-dark transition-all flex items-center gap-2 border border-white/10"
              >
                Launch Terminal Workspace <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </section>

      <section className="w-full bg-[#08090d]/60 border-y border-[#1e2338]/40 py-20 relative overflow-hidden">
        <div className="glow-spot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          
          <div className="flex-1 flex flex-col text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold mb-4 w-fit">
              <PlayCircle className="w-3.5 h-3.5" />
              Watch Demo
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
              Trade in the speed of <br />
              <span className="text-gradient-purple-blue">light on Solana.</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
              See ChadWallet in action. Experience the lightning-fast quotes, instant transaction executions, visual analytics, and simplified social triggers that give you the ultimate edge in meme token trading.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">0.4s</span>
                <span className="text-xs text-gray-500">Average Network Confirmation</span>
              </div>
              <div className="h-10 w-[1px] bg-[#1e2338]"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[#14f195]">$0.0001</span>
                <span className="text-xs text-gray-500">Average Network Swap Fee</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#1e2338]/80 bg-black shadow-2xl flex items-center justify-center group">
              {isVideoPlaying ? (
                <video 
                  src="/assets/video/chadwallet.mp4" 
                  controls 
                  autoPlay 
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <img 
                    src="/assets/flow/kol-4.png"
                    alt="Video Poster"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                  
                  <button 
                    onClick={() => setIsVideoPlaying(true)}
                    className="absolute w-20 h-20 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-20 cursor-pointer border border-white/20"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <span className="absolute bottom-4 left-4 text-xs font-mono text-gray-400 z-20 bg-black/60 px-3 py-1 rounded-full border border-[#1e2338]">
                    chadwallet_teaser.mp4
                  </span>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-24 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Built for Elite Traders
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Standard wallets are slow. ChadWallet is engineered from the ground up for high-velocity meme coin trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Swap Execution</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Connects directly to Jupiter’s smart path routing for the absolute best swap rates with ultra-low slippage.
            </p>
            <div className="mt-auto pt-6 border-t border-[#1e2338]/40 relative h-48 w-full rounded-xl overflow-hidden bg-black/40">
              <img 
                src="/assets/app_store/token.png" 
                alt="Jupiter Swap UI" 
                className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
              />
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#14f195]/10 border border-[#14f195]/20 flex items-center justify-center text-[#14f195] mb-6 group-hover:bg-[#14f195] group-hover:text-black transition-all duration-300">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Follow KOL Smart Money</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Track the wallets of top influencers and key opinion leaders. Instantly mirror their buys with custom sizes.
            </p>
            <div className="mt-auto pt-6 border-t border-[#1e2338]/40 relative h-48 w-full rounded-xl overflow-hidden bg-black/40">
              <img 
                src="/assets/app_store/kol.png" 
                alt="KOL tracking feed" 
                className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
              />
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-6 group-hover:bg-brand-purple group-hover:text-white transition-all duration-300">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Token Launching</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Launch your own meme token on Solana directly inside the app with immediate DEX pool seeding.
            </p>
            <div className="mt-auto pt-6 border-t border-[#1e2338]/40 relative h-48 w-full rounded-xl overflow-hidden bg-black/40">
              <img 
                src="/assets/app_store/launch.png" 
                alt="Launch new tokens" 
                className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
              />
            </div>
          </div>

        </div>
      </section>

      <section id="download" className="w-full bg-gradient-to-b from-[#08090d] to-[#06070a] border-t border-[#1e2338]/40 py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            <div className="flex-1 text-left max-w-xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary mb-3 block">
                Trade on the Go
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                Now available in your pocket.
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
                Experience full ChadWallet features in our native mobile apps. Deposit funds via Apple Pay, browse trending Solana markets, view live chat channels, and swap instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a 
                  href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-[#111420]/80 border border-[#1e2338] rounded-xl hover:border-brand-primary/40 text-left transition-all"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8 object-contain" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-mono">Download for</div>
                    <div className="text-sm font-extrabold text-gray-200">Android</div>
                  </div>
                </a>

                <a 
                  href="https://apps.apple.com/us/app/chadwallet/id6757367474"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-[#111420]/80 border border-[#1e2338] rounded-xl hover:border-brand-primary/40 text-left transition-all"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8 object-contain" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-mono">Download for</div>
                    <div className="text-sm font-extrabold text-gray-200">iOS iPhone</div>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-gray-500 bg-[#0c0e14] px-4 py-2.5 rounded-xl border border-[#1e2338]/60 w-fit">
                <ShieldCheck className="w-4 h-4 text-[#14f195]" />
                Self-custodial keys secured inside mobile secure enclaves.
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center gap-6 overflow-hidden max-w-2xl relative">
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#08090d] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#08090d] to-transparent z-10 pointer-events-none"></div>

              <div className="relative w-48 h-96 rounded-[36px] border-[6px] border-[#1e2338] overflow-hidden bg-black flex-shrink-0 shadow-2xl">
                <img 
                  src="/assets/app_store/splash.png" 
                  alt="App Splash Screen" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="relative w-56 h-[440px] rounded-[42px] border-[8px] border-[#1e2338] overflow-hidden bg-black flex-shrink-0 shadow-2xl -translate-y-4 ring-4 ring-brand-primary/20">
                <img 
                  src="/assets/app_store/discover.png" 
                  alt="App Discover Market" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="relative w-48 h-96 rounded-[36px] border-[6px] border-[#1e2338] overflow-hidden bg-black flex-shrink-0 shadow-2xl">
                <img 
                  src="/assets/app_store/portfolio.png" 
                  alt="App Portfolio P&L" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center z-10">
        <div className="glass-panel rounded-3xl p-12 relative overflow-hidden border border-[#1e2338] shadow-2xl shadow-brand-primary/5 flex flex-col items-center">
          <div className="glow-spot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
          
          <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight relative z-10">
            Unleash your inner <span className="text-gradient-solana">Solana Chad.</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10 relative z-10">
            Stop waiting for slow transactions. Swap instantly, tracking top traders and copytrading profitable plays automatically.
          </p>
          <button 
            onClick={handleStartTrading}
            className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-2 border border-white/10 relative z-10 cursor-pointer"
          >
            Enter Trading Terminal <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <div className="ticker-wrap select-none border-t border-[#1e2338]/60 bg-black/40 mt-auto">
        <div className="ticker-container animate-marquee-right">
          {renderMarqueeItems(bottomMarquee)}
        </div>
      </div>

      <footer className="w-full bg-[#050609] border-t border-[#1e2338]/40 py-8 px-6 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-400">CHADWALLET</span>
            <span>© 2026. Self-custody Solana meme coin engine.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Google Play</a>
            <a href="https://apps.apple.com/us/app/chadwallet/id6757367474" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">App Store</a>
            <span className="text-gray-700">|</span>
            <span className="text-rose-500/80 font-semibold uppercase font-mono">Disclaimer: High risk. DYOR.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
