import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PortfolioContext = createContext(null);
const STORAGE_KEY = 'stockpulse_portfolio';

export function PortfolioProvider({ children }) {
  const [holdings, setHoldings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  }, [holdings]);

  /**
   * Add shares. If the symbol already exists, update the average cost.
   * @param {{symbol:string, name:string}} stock
   * @param {number} quantity
   * @param {number} purchasePrice  Price per share paid.
   */
  const addHolding = useCallback((stock, quantity, purchasePrice) => {
    setHoldings((prev) => {
      const existing = prev.find((h) => h.symbol === stock.symbol);
      if (existing) {
        return prev.map((h) =>
          h.symbol === stock.symbol
            ? {
                ...h,
                quantity: h.quantity + quantity,
                avgCost:
                  (h.avgCost * h.quantity + purchasePrice * quantity) /
                  (h.quantity + quantity),
              }
            : h
        );
      }
      return [
        ...prev,
        {
          symbol: stock.symbol,
          name: stock.name,
          quantity,
          avgCost: purchasePrice,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeHolding = useCallback((symbol) => {
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));
  }, []);

  const updateQuantity = useCallback(
    (symbol, quantity) => {
      if (quantity <= 0) {
        removeHolding(symbol);
        return;
      }
      setHoldings((prev) =>
        prev.map((h) => (h.symbol === symbol ? { ...h, quantity } : h))
      );
    },
    [removeHolding]
  );

  const isInPortfolio = useCallback(
    (symbol) => holdings.some((h) => h.symbol === symbol),
    [holdings]
  );

  const getHolding = useCallback(
    (symbol) => holdings.find((h) => h.symbol === symbol),
    [holdings]
  );

  return (
    <PortfolioContext.Provider
      value={{ holdings, addHolding, removeHolding, updateQuantity, isInPortfolio, getHolding }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
