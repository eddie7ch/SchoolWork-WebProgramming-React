# Final Group Project — StockPulse
**Course:** Web Programming — React | Bow Valley College  
**Student:** Eddie  
**Date:** March 2026

---

## Overview

StockPulse is a full-stack stock market dashboard built with React. It allows users to search for stocks, view real-time quotes and historical price charts, manage a personal watchlist and portfolio, read market news, and communicate with other users in live chat rooms — all in a single-page application.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| React Router v6 | Client-side SPA routing |
| React Context API | Global state (auth, watchlist, portfolio) |
| Recharts | Interactive price history line charts |
| Socket.io (client) | Real-time bidirectional chat |
| Express + Socket.io (server) | WebSocket chat server |
| Axios | HTTP requests to Alpha Vantage API |
| date-fns | Date formatting utilities |
| Vite | Build tool and dev server |
| Vitest + React Testing Library | Unit and integration testing |
| Alpha Vantage API | Real-time stock quotes, company info, and news |

---

## Application Structure

```
src/
├── App.jsx                         ← Root component, React Router setup
├── main.jsx                        ← Entry point
├── context/
│   ├── AuthContext.jsx             ← Username-based login state (localStorage)
│   ├── WatchlistContext.jsx        ← Watchlist state (localStorage-persisted)
│   └── PortfolioContext.jsx        ← Portfolio holdings with weighted-avg cost
├── hooks/
│   ├── useDebounce.js              ← Debounce hook (300 ms) for search input
│   └── useStock.js                 ← Single-symbol data loader (quote + overview)
├── services/
│   ├── stockApi.js                 ← Alpha Vantage: quote, search, historical, overview
│   ├── newsApi.js                  ← Alpha Vantage: news sentiment feed
│   └── chatService.js             ← Socket.io singleton, room management, XSS sanitise
├── utils/
│   ├── formatters.js               ← Currency, percent, volume, date formatters
│   └── mockData.js                 ← Fallback mock stocks and news
├── components/
│   ├── Navbar/                     ← Top navigation bar with auth + route links
│   ├── SearchBar/                  ← Debounced symbol search
│   ├── StockCard/                  ← Quote card (price, change, %)
│   ├── PopularStocks/              ← Grid of pre-set popular tickers
│   ├── NewsCard/                   ← Market news article card
│   └── ChatRoom/                   ← Real-time chat UI with room switching
└── pages/
    ├── LandingPage/                ← Home: search + popular stocks + news feed
    ├── LoginPage/                  ← Username entry (no password required)
    ├── StockDetailsPage/           ← Full quote + chart + company info for one symbol
    ├── WatchlistPage/              ← Saved symbols with live quotes
    ├── PortfolioPage/              ← Holdings table with P&L calculation
    └── ChatPage/                   ← Chat room browser and messaging UI

server/
├── index.js                        ← Express + Socket.io server (chat backend)
└── package.json
```

---

## Key Features

### 1. Stock Search
- `SearchBar` uses `useDebounce(300 ms)` to rate-limit keystrokes before calling `searchStocks()`.
- Alpha Vantage `SYMBOL_SEARCH` endpoint returns matching tickers and company names.
- Falls back to filtering the `POPULAR_STOCKS` mock array when the API key is missing or the daily rate limit is hit.

### 2. Stock Quotes
- `StockCard` calls `getStockQuote(symbol)` → Alpha Vantage `GLOBAL_QUOTE`.
- Displays current price, change in dollars, percentage change, and volume.
- Green/red colouring applied based on positive/negative change.

### 3. Historical Price Charts
- `StockDetailsPage` calls `getHistoricalData(symbol)` → Alpha Vantage `TIME_SERIES_DAILY`.
- Returns up to 90 trading days of adjusted close prices.
- Rendered as a responsive `LineChart` via Recharts with custom tooltip.

### 4. Company Overview
- `useStock` hook calls `getCompanyOverview(symbol)` → Alpha Vantage `OVERVIEW`.
- Displays sector, industry, market cap, P/E ratio, 52-week high/low, and description.

### 5. Watchlist
- `WatchlistContext` stores an array of symbol strings in `localStorage`.
- `useCallback`-optimised `addSymbol` / `removeSymbol` / `isWatched` helpers.
- `WatchlistPage` maps each saved symbol to a live `StockCard`.

### 6. Portfolio Tracker
- `PortfolioContext` persists holdings in `localStorage`.
- Each holding stores `symbol`, `name`, `quantity`, and `avgCost`.
- Adding an existing symbol uses a **weighted-average cost** formula:
  ```
  newAvgCost = (prevAvgCost × prevQty + purchasePrice × newQty) / (prevQty + newQty)
  ```
- `PortfolioPage` shows unrealised P&L based on the current live quote.

### 7. Market News
- `newsApi.getMarketNews(symbol?)` calls Alpha Vantage `NEWS_SENTIMENT`.
- Optional `symbol` parameter filters news to a specific ticker.
- Returns sentiment label (Bullish/Bearish/Neutral) and score per article.
- Falls back to `MOCK_NEWS` from `mockData.js` on any error.

### 8. Real-Time Chat Rooms
- `ChatPage` lists available rooms; clicking one opens `ChatRoom`.
- Six preset stock-themed rooms plus a **custom room creator** — any room name is sanitised and joined instantly.
- `chatService.js` wraps a **Socket.io singleton** with lazy initialisation.
- Users join/leave named rooms (`join_room` / `leave_room` events).
- The server (`server/index.js`) tracks per-room user lists and broadcasts `room_users` on every join/leave.
- **Link and image sharing:** `renderMessage()` in `ChatRoom.jsx` parses each message for `http(s)://` URLs. Non-image URLs become `<a target="_blank" rel="noopener noreferrer">` links; URLs that end in `.jpg`, `.jpeg`, `.png`, `.gif`, or `.webp` additionally render an inline image preview below the link.
- XSS prevention is applied at **both layers**:
  - Client: `sanitize()` in `chatService.js` escapes HTML before emitting.
  - Server: `sanitize()` in `index.js` escapes all incoming text before broadcasting.

---

## Security Considerations

| Risk | Protection |
|---|---|
| Stored XSS via chat messages | HTML-escaped on client before send; re-escaped on server before broadcast |
| CORS on WebSocket server | Explicit `allowedOrigins` array; configurable via `ALLOWED_ORIGINS` env var |
| API key exposure | Key read from `import.meta.env` (Vite env) — never hardcoded |
| Rate limiting / API key abuse | `alphaRequest()` detects `Note` / `Information` fields and throws `RATE_LIMITED`; automatic mock fallback prevents crashes |
| Reconnection storms | Socket.io configured with `reconnectionAttempts: 5` and `reconnectionDelay: 1000 ms` |

---

## Mock Data Fallback

All three service modules (`stockApi.js`, `newsApi.js`, `chatService.js` does not need it) fall back to static mock data from `utils/mockData.js` when:
- `VITE_ALPHA_VANTAGE_KEY` is not set or is the placeholder value, **or**
- The Alpha Vantage free-tier rate limit (25 requests/day) is hit.

This ensures the app is always functional for demonstration even without a valid API key.

---

## Deployment

The project consists of two separately deployed services.

| Service | Platform | Live URL |
|---|---|---|
| Frontend | Vercel | https://stockpulse-blush.vercel.app |
| Backend (chat server) | Railway | https://stockpulse-server-production.up.railway.app |

### Frontend — Vercel

1. Connect the GitHub repository to [vercel.com](https://vercel.com).
2. Set the **Root Directory** to `Projects/FinalGroupProject`.
3. Add the following environment variables in the Vercel project settings:
   ```
   VITE_ALPHA_VANTAGE_KEY=<your_key>
   VITE_SOCKET_URL=<backend_url>   # e.g. https://stockpulse-server.railway.app
   ```
4. Deploy. The `vercel.json` rewrite rule forwards all routes to `index.html` for client-side routing.

### Backend (Chat Server) — Railway / Render

Vercel does not support long-running WebSocket connections, so the Express + Socket.io server must be deployed on a platform that does (e.g., [Railway](https://railway.app) or [Render](https://render.com) — both have free tiers).

1. Create a new service pointing to the `Projects/FinalGroupProject/server/` subdirectory (or set the root to that folder).
2. Set the start command to `node index.js`.
3. Set the environment variable:
   ```
   ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
   ```
4. Copy the service URL into the frontend's `VITE_SOCKET_URL` variable in Vercel.

---

## Bonus Features

The following features go beyond the core requirements and contribute toward extra credit:

| Feature | Description |
|---|---|
| **Link & image sharing in chat** | URLs in chat messages are auto-converted to clickable links; image URLs (jpg/png/gif/webp) additionally render an inline preview. |
| **Weighted-average cost basis** | Portfolio handles multiple purchases of the same stock using the correct weighted-average formula rather than simple last-price tracking. |
| **API response caching** | A 5-minute in-memory cache (`stockApi.js`) prevents redundant Alpha Vantage calls, staying well within the 25 req/day free-tier limit. |
| **Skeleton loading states** | News feed and stock cards show animated placeholder skeletons during data fetches for a polished UX. |
| **Chart interval selector** | The price history chart on `StockDetailsPage` supports switching between daily and weekly time intervals. |
| **Defence-in-depth XSS protection** | HTML is sanitised independently on both the client (`chatService.js`) and the server (`server/index.js`) before any chat message is stored or broadcast. |
| **News sentiment labelling** | Market news articles display a Bullish / Bearish / Neutral sentiment badge sourced from Alpha Vantage's NEWS_SENTIMENT endpoint. |
| **Always-functional demo mode** | Automatic fallback to `mockData.js` ensures the full UI is demonstrable without a live API key. |

---

## Routing

| Path | Page | Auth Required |
|---|---|---|
| `/` | `LandingPage` | No |
| `/stock/:symbol` | `StockDetailsPage` | No |
| `/watchlist` | `WatchlistPage` | No |
| `/portfolio` | `PortfolioPage` | No |
| `/chat` | `ChatPage` | Yes (redirects to `/login`) |
| `/login` | `LoginPage` | No |

---

## Setup Instructions

### Frontend

1. Navigate to `Projects/FinalGroupProject/`
2. Copy `.env.example` to `.env`:
   ```
   VITE_ALPHA_VANTAGE_KEY=your_api_key_here
   VITE_SOCKET_URL=http://localhost:3001
   ```
3. Get a free Alpha Vantage key at [alphavantage.co](https://www.alphavantage.co/support/#api-key)
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

### Backend (Chat Server)

1. Navigate to `Projects/FinalGroupProject/server/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node index.js
   ```
   Or from the root folder: `npm run dev:full` to start both concurrently.

---

## API Reference

### Alpha Vantage (`stockApi.js`)

| Function | AV Function | Purpose |
|---|---|---|
| `searchStocks(query)` | `SYMBOL_SEARCH` | Search ticker symbols by name/symbol |
| `getStockQuote(symbol)` | `GLOBAL_QUOTE` | Real-time price, change, volume |
| `getHistoricalData(symbol)` | `TIME_SERIES_DAILY` | Daily OHLCV for 90-day chart |
| `getCompanyOverview(symbol)` | `OVERVIEW` | Sector, P/E, market cap, description |

### Alpha Vantage (`newsApi.js`)

| Function | AV Function | Purpose |
|---|---|---|
| `getMarketNews(symbol?)` | `NEWS_SENTIMENT` | Latest market news with sentiment scores |

### Socket.io Events

| Event | Direction | Payload |
|---|---|---|
| `join_room` | Client → Server | `{ roomId }` |
| `leave_room` | Client → Server | `{ roomId }` |
| `send_message` | Client → Server | `{ roomId, message, username, timestamp }` |
| `receive_message` | Server → Client | `{ message, username, timestamp }` |
| `room_users` | Server → Client | `string[]` (usernames in room) |

---

## Testing

Tests are written with **Vitest** and **React Testing Library**.

| File | Scope | Tests |
|---|---|---|
| `formatters.test.js` | Unit — `utils/formatters.js` | 20 |
| `PortfolioContext.test.jsx` | Unit — `PortfolioContext` | 7 |
| `WatchlistContext.test.jsx` | Unit — `WatchlistContext` | 6 |
| `StockCard.test.jsx` | Component — `StockCard` | 8 |
| `SearchBar.test.jsx` | Component — `SearchBar` (debounce-aware) | 5 |
| **Total** | | **46** |

Run tests:
```bash
npm test
```

Test output is saved in `fgp-test-out.txt`.

---

## Development Challenges

### Challenge 1: Alpha Vantage Rate Limiting (25 req/day on Free Tier)
**Problem:** The Alpha Vantage free tier allows only 25 API requests per day. During development, this limit is easily exceeded when testing multiple components.

**Solution:** A 5-minute in-memory cache (`_cache` Map in `stockApi.js`) prevents duplicate requests for the same symbol within a session. A mock data fallback (`mockData.js`) ensures the app stays fully functional when the limit is hit or the key is not set, so demos always work.

### Challenge 2: Real-Time Chat with Concurrent State
**Problem:** Integrating Socket.io into a React app requires careful lifecycle management. The socket connection must survive route changes and component unmounts without leaking connections, while still delivering messages to the correct component in real time.

**Solution:** `chatService.js` manages a **singleton socket instance** shared across the app. Components use `useEffect` cleanup functions to call `leaveRoom()` and remove socket event listeners when they unmount. The singleton is destroyed on explicit logout via `disconnectSocket()`.

### Challenge 3: Persistent Portfolio with Weighted-Average Cost
**Problem:** A basic "add to portfolio" feature that only stores the last purchase price is inaccurate. Real portfolio trackers compute the weighted-average cost basis across multiple purchases at different prices.

**Solution:** `PortfolioContext` accumulates holdings with the weighted-average formula on each `addHolding` call. The calculation is: `newAvgCost = (prevAvgCost × prevQty + newPrice × newQty) / totalQty`. This is tested in `PortfolioContext.test.jsx`.
