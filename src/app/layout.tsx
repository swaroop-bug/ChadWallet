import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import PrivyWrapper from "@/components/PrivyProvider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ChadWallet | The Ultimate Solana Meme Coin Trading Terminal",
  description: "Trade Solana meme coins instantly, follow expert KOLS, copytrade profitable wallets, and track your P&L in a sleek, high-speed terminal. Built for Chads.",
  keywords: ["Solana", "Meme coins", "Crypto Wallet", "Trading Terminal", "Jupiter Swap", "Privy Auth", "DeFi"],
  authors: [{ name: "ChadWallet Team" }],
  openGraph: {
    title: "ChadWallet | The Ultimate Solana Meme Coin Trading Terminal",
    description: "Trade Solana meme coins instantly, follow expert KOLS, copytrade profitable wallets, and track your P&L in a sleek, high-speed terminal. Built for Chads.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col font-sans bg-[#06070a] text-gray-100 selection:bg-brand-primary selection:text-white">
        <PrivyWrapper>
          <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
            <div className="glow-spot top-[-100px] left-[-50px] opacity-70"></div>
            <div className="glow-spot top-[500px] right-[-100px] opacity-40"></div>
            
            <main className="flex-1 flex flex-col z-10">
              {children}
            </main>
          </div>
        </PrivyWrapper>
      </body>
    </html>
  );
}
