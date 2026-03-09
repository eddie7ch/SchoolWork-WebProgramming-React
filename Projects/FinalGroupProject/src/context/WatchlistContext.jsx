import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WatchlistContext = createContext(null);
const STORAGE_KEY = 'stockpulse_watchlist';

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((stock) => {
    setWatchlist((prev) => {
      if (prev.some((s) => s.symbol === stock.symbol)) return prev;
      return [...prev, { symbol: stock.symbol, name: stock.name, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
  }, []);

  const isInWatchlist = useCallback(
    (symbol) => watchlist.some((s) => s.symbol === symbol),
    [watchlist]
  );

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
