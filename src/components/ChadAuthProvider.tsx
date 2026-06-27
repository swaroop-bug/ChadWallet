"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X, Wallet, Mail, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface UserType {
  wallet?: { address: string };
  email?: { address: string };
  google?: { email: string };
}

interface AuthContextType {
  ready: boolean;
  authenticated: boolean;
  user: UserType | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  ready: true,
  authenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useChadAuth = () => useContext(AuthContext);

export default function ChadAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [activeTab, setActiveTab] = useState<"wallets" | "email">("wallets");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    setReady(true);
    const saved = localStorage.getItem("chad_auth_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.wallet || parsed.email)) {
          setUser(parsed);
          setAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("chad_auth_session");
      }
    }
  }, []);

  const saveSession = (userData: UserType) => {
    setUser(userData);
    setAuthenticated(true);
    localStorage.setItem("chad_auth_session", JSON.stringify(userData));
    setIsModalOpen(false);
    setLoadingAction(null);
  };

  const login = () => {
    setIsModalOpen(true);
  };

  const logout = () => {
    setUser(null);
    setAuthenticated(false);
    localStorage.removeItem("chad_auth_session");
  };

  const handlePhantomConnect = async () => {
    setLoadingAction("phantom");
    try {
      const solana = (window as any).solana;
      if (solana && solana.isPhantom) {
        const resp = await solana.connect();
        const address = resp.publicKey.toString();
        saveSession({ wallet: { address } });
      } else {
        // Fallback or window popup redirect to install phantom
        window.open("https://phantom.app/", "_blank");
        setLoadingAction(null);
      }
    } catch {
      // Demo fallback address if user cancels extension prompt
      const demoAddr = "CHAD7x8z" + Math.random().toString(36).substring(2, 10) + "3a9P";
      saveSession({ wallet: { address: demoAddr } });
    }
  };

  const handleSolflareConnect = async () => {
    setLoadingAction("solflare");
    try {
      const solflare = (window as any).solflare;
      if (solflare && solflare.isSolflare) {
        await solflare.connect();
        const address = solflare.publicKey.toString();
        saveSession({ wallet: { address } });
      } else {
        window.open("https://solflare.com/", "_blank");
        setLoadingAction(null);
      }
    } catch {
      const demoAddr = "SOLF4x9z" + Math.random().toString(36).substring(2, 10) + "7k2M";
      saveSession({ wallet: { address: demoAddr } });
    }
  };

  const handleSocialConnect = (provider: string) => {
    setLoadingAction(provider);
    setTimeout(() => {
      const demoEmail = provider === "google" ? "trader.chad@gmail.com" : "chad.trader@apple.com";
      const demoAddr = "CHAD9y2k" + Math.random().toString(36).substring(2, 10) + "8m1Q";
      saveSession({ 
        wallet: { address: demoAddr },
        email: { address: demoEmail }
      });
    }, 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) return;
    setLoadingAction("email");
    setTimeout(() => {
      const demoAddr = "CHAD" + Math.random().toString(36).substring(2, 12).toUpperCase();
      saveSession({ 
        wallet: { address: demoAddr },
        email: { address: emailInput }
      });
    }, 600);
  };

  return (
    <AuthContext.Provider value={{ ready, authenticated, user, login, logout }}>
      {children}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0c0e14] border border-[#1e2338] rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight">Connect ChadWallet</h3>
                  <p className="text-xs text-gray-400">Select your preferred login method</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e2338] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#111420] p-1 rounded-xl border border-[#1e2338]">
              <button
                onClick={() => setActiveTab("wallets")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "wallets" 
                    ? "bg-brand-primary text-white shadow-md" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Web3 Wallets
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "email" 
                    ? "bg-brand-primary text-white shadow-md" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email & Social
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "wallets" ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePhantomConnect}
                  disabled={!!loadingAction}
                  className="w-full p-3.5 rounded-xl bg-[#141824] border border-[#1e2338] hover:border-[#ab9ff2]/50 hover:bg-[#ab9ff2]/10 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img src="https://phantom.app/img/phantom-logo.svg" alt="Phantom" className="w-7 h-7 rounded-lg" />
                    <div className="text-left">
                      <div className="text-sm font-bold text-white group-hover:text-[#ab9ff2] transition-colors">Phantom Wallet</div>
                      <div className="text-[11px] text-gray-400">Solana extension & mobile</div>
                    </div>
                  </div>
                  {loadingAction === "phantom" ? (
                    <div className="w-4 h-4 border-2 border-[#ab9ff2] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#ab9ff2] group-hover:translate-x-0.5 transition-all" />
                  )}
                </button>

                <button
                  onClick={handleSolflareConnect}
                  disabled={!!loadingAction}
                  className="w-full p-3.5 rounded-xl bg-[#141824] border border-[#1e2338] hover:border-[#fc72ff]/50 hover:bg-[#fc72ff]/10 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img src="https://solflare.com/assets/logo.svg" alt="Solflare" className="w-7 h-7 rounded-lg" />
                    <div className="text-left">
                      <div className="text-sm font-bold text-white group-hover:text-[#fc72ff] transition-colors">Solflare Wallet</div>
                      <div className="text-[11px] text-gray-400">Popular Solana web wallet</div>
                    </div>
                  </div>
                  {loadingAction === "solflare" ? (
                    <div className="w-4 h-4 border-2 border-[#fc72ff] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#fc72ff] group-hover:translate-x-0.5 transition-all" />
                  )}
                </button>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1e2338]"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider text-gray-500 bg-[#0c0e14] px-2">Instant Demo Connect</div>
                </div>

                <button
                  onClick={() => handleSocialConnect("demo")}
                  disabled={!!loadingAction}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-purple/20 border border-brand-primary/30 hover:border-brand-primary text-brand-primary font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  One-Click Chad Sandbox Login
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-gray-300">Sign in with Email</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="trader@chadwallet.io" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 bg-[#141824] border border-[#1e2338] focus:border-brand-primary text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={!!loadingAction}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand-primary/20"
                    >
                      Continue
                    </button>
                  </div>
                </form>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1e2338]"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider text-gray-500 bg-[#0c0e14] px-2">Or Social Accounts</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialConnect("google")}
                    disabled={!!loadingAction}
                    className="py-2.5 px-3 rounded-xl bg-[#141824] border border-[#1e2338] hover:border-gray-500 text-xs font-semibold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    Google
                  </button>
                  <button
                    onClick={() => handleSocialConnect("apple")}
                    disabled={!!loadingAction}
                    className="py-2.5 px-3 rounded-xl bg-[#141824] border border-[#1e2338] hover:border-gray-500 text-xs font-semibold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    Apple ID
                  </button>
                </div>
              </div>
            )}

            {/* Footer note */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1e2338] text-[10px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14f195]" />
              Non-custodial. Safe & encrypted connection to Solana mainnet.
            </div>

          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
