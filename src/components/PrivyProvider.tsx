"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import ChadAuthProvider from "./ChadAuthProvider";

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm670v68200f40d12e8x51d8b";

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#606AF7",
          showWalletLoginFirst: false,
          logo: "/assets/logo/light.png",
          walletList: ["phantom", "solflare"],
          walletChainType: "solana-only",
        },
        loginMethods: ["google", "apple", "email", "wallet"],
      }}
    >
      <ChadAuthProvider>
        {children}
      </ChadAuthProvider>
    </PrivyProvider>
  );
}
