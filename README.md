# ChadWallet Terminal

A modern, high-fidelity social crypto landing platform and decentralized trading terminal optimized for the Solana network. Designed with glassmorphic aesthetics, live blockchain activity simulations, real-time token tracking, and smart swap routing.

## Key Features

### 1. Landing Platform
*   **Rotating Banners**: Real-time rotating token banners scrolling along the top and bottom of the page. Interactive elements link directly to specific token trading sessions.
*   **Hero Dashboard & Teaser**: Premium preview card demonstrating responsive workspace interfaces.
*   **Teaser Promo Loop**: In-app HTML5 showcase video playing high-definition terminal workflows.
*   **Mobile App Gateways**: Direct download badge links for Android (Play Store) and iOS (App Store).
*   **Secure Authentication**: Fully integrated Privy authentication context supporting Google, Apple, email, and Web3 wallets inside a dark modal theme.

### 2. Live Trading Terminal (`/trade`)
*   **Trending Panel**: Searchable left-column market monitor categorized by general availability, high volume, 24h gainers, and 24h losers.
*   **Real-time Charts**: Embeddable TradingView/DexScreener interactive charting interfaces for active Raydium pool pairs, and a custom Area Chart (recharts) rendering the native `$CHAD` token.
*   **Live Trades Ticker**: Interactive feed displaying buy/sell activity, trade values (in SOL), and verification tags for Key Opinion Leaders (KOLs).
*   **Top Holders Ledger**: Wallet allocation distribution list verifying prominent whale and influencer positions.
*   **Jupiter Swap Aggregator**: Complete token swapping module featuring dynamic slippage adjustments, input presets, path routing calculations, and cost-basis analysis.
*   **Active Positions Card**: Interactive unrealized P&L tracker demonstrating average buy entries, cost basis, current valuations, and live portfolio returns.

---

## Technical Stack

*   **Framework**: Next.js 15+ (App Router, React 19)
*   **Styling**: Tailwind CSS v4, custom glassmorphism components, and marquee scrolling keyframes.
*   **Authentication**: @privy-io/react-auth (Self-custodial keys & social logins)
*   **Charts**: Recharts (native area graphs) & DexScreener Embeds
*   **APIs**: DexScreener API (token lookup & metadata), Jupiter Quote API (rate comparison)
*   **Interactions**: canvas-confetti, Lucide React icons

---

## Local Development Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18.0.0 or higher) installed on your system.

### 1. Clone & Install Dependencies
Install the required packages using npm:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Privy App ID (if using a custom project):
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```
*Note: If no custom key is provided, the application will fallback to a default sandbox configuration for evaluation.*

### 3. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to explore the dashboard.

### 4. Build for Production
Verify typescript compilation, linting, and compile optimized bundles:
```bash
npm run build
```
