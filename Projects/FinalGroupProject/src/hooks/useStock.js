import { useState, useEffect, useCallback } from 'react';
import { getStockQuote, getHistoricalData, getCompanyOverview } from '../services/stockApi.js';

/**
 * Fetch all data for a single stock symbol.
 * @param {string|null} symbol
 * @returns {{ quote, history, overview, loading, error, refresh }}
 */
export function useStock(symbol) {
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const [q, h, o] = await Promise.all([
        getStockQuote(symbol),
        getHistoricalData(symbol),
        getCompanyOverview(symbol),
      ]);
      setQuote(q);
      setHistory(h);
      setOverview(o);
    } catch (err) {
      setError(err.message || 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quote, history, overview, loading, error, refresh };
}
