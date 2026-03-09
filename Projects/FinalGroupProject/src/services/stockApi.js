import axios from 'axios';
import { POPULAR_STOCKS, generateHistoricalData } from '../utils/mockData.js';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const _cache = new Map();

function getCached(key) {
  const item = _cache.get(key);
  if (!item || Date.now() - item.timestamp > CACHE_TTL) {
    _cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  _cache.set(key, { data, timestamp: Date.now() });
}

async function alphaRequest(params) {
  if (!API_KEY || API_KEY === 'your_api_key_here') throw new Error('NO_API_KEY');

  const response = await axios.get(BASE_URL, {
    params: { ...params, apikey: API_KEY },
    timeout: 10_000,
  });

  const data = response.data;
  if (data['Note'] || data['Information']) throw new Error('RATE_LIMITED');
  return data;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get a real-time quote for a single symbol.
 * Falls back to mock data on any error.
 * @param {string} symbol
 * @returns {Promise<Object>}
 */
export async function getStockQuote(symbol) {
  const key = `quote_${symbol}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const data = await alphaRequest({ function: 'GLOBAL_QUOTE', symbol });
    const q = data['Global Quote'];
    if (!q || !q['05. price']) throw new Error('NO_DATA');

    const result = {
      symbol: q['01. symbol'],
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change']),
      changePercent: parseFloat(q['10. change percent'].replace('%', '')),
      volume: parseInt(q['06. volume'], 10),
      previousClose: parseFloat(q['08. previous close']),
      open: parseFloat(q['02. open']),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
    };

    setCache(key, result);
    return result;
  } catch {
    const mock = POPULAR_STOCKS.find((s) => s.symbol === symbol);
    if (mock) return mock;

    const base = 100 + Math.random() * 400;
    return {
      symbol,
      name: symbol,
      price: parseFloat(base.toFixed(2)),
      change: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),
      changePercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
      volume: Math.floor(Math.random() * 50_000_000),
    };
  }
}

/**
 * Get historical OHLCV data for charting.
 * @param {string} symbol
 * @param {'daily'|'weekly'|'monthly'} interval
 * @returns {Promise<Array>}
 */
export async function getHistoricalData(symbol, interval = 'daily') {
  const key = `history_${symbol}_${interval}`;
  const cached = getCached(key);
  if (cached) return cached;

  const functionMap = {
    daily: 'TIME_SERIES_DAILY',
    weekly: 'TIME_SERIES_WEEKLY',
    monthly: 'TIME_SERIES_MONTHLY',
  };

  try {
    const data = await alphaRequest({ function: functionMap[interval], symbol, outputsize: 'compact' });
    const seriesKey = Object.keys(data).find((k) => k.includes('Time Series'));
    if (!seriesKey) throw new Error('NO_DATA');

    const result = Object.entries(data[seriesKey])
      .slice(0, 90)
      .map(([date, v]) => ({
        date,
        open: parseFloat(v['1. open']),
        high: parseFloat(v['2. high']),
        low: parseFloat(v['3. low']),
        close: parseFloat(v['4. close']),
        volume: parseInt(v['5. volume'], 10),
      }))
      .reverse();

    setCache(key, result);
    return result;
  } catch {
    const mock = POPULAR_STOCKS.find((s) => s.symbol === symbol);
    return generateHistoricalData(mock?.price ?? 150);
  }
}

/**
 * Search for stocks by keyword.
 * @param {string} query
 * @returns {Promise<Array<{symbol,name,type,region,currency}>>}
 */
export async function searchStocks(query) {
  if (!query || query.trim().length === 0) return [];

  const key = `search_${query.toLowerCase().trim()}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const data = await alphaRequest({ function: 'SYMBOL_SEARCH', keywords: query });
    const result = (data['bestMatches'] || []).slice(0, 8).map((m) => ({
      symbol: m['1. symbol'],
      name: m['2. name'],
      type: m['3. type'],
      region: m['4. region'],
      currency: m['8. currency'],
    }));

    setCache(key, result);
    return result;
  } catch {
    const q = query.toUpperCase();
    return POPULAR_STOCKS.filter(
      (s) => s.symbol.includes(q) || s.name.toLowerCase().includes(query.toLowerCase())
    ).map((s) => ({ symbol: s.symbol, name: s.name, type: 'Equity', region: 'United States', currency: 'USD' }));
  }
}

/**
 * Get company overview / fundamentals.
 * @param {string} symbol
 * @returns {Promise<Object>}
 */
export async function getCompanyOverview(symbol) {
  const key = `overview_${symbol}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const data = await alphaRequest({ function: 'OVERVIEW', symbol });
    if (!data.Symbol) throw new Error('NO_DATA');
    setCache(key, data);
    return data;
  } catch {
    const mock = POPULAR_STOCKS.find((s) => s.symbol === symbol);
    return {
      Symbol: symbol,
      Name: mock?.name ?? symbol,
      Description: `${mock?.name ?? symbol} is a publicly traded company listed on major U.S. stock exchanges.`,
      Sector: mock?.sector ?? 'Technology',
      Industry: 'N/A',
      MarketCapitalization: mock?.marketCap?.toString() ?? '1000000000',
      PERatio: (15 + Math.random() * 25).toFixed(2),
      EPS: (2 + Math.random() * 8).toFixed(2),
      DividendYield: (Math.random() * 0.03).toFixed(4),
      '52WeekHigh': mock ? (mock.price * 1.3).toFixed(2) : '200.00',
      '52WeekLow': mock ? (mock.price * 0.7).toFixed(2) : '100.00',
    };
  }
}

/**
 * Get the list of popular stocks (uses mock data to avoid unnecessary API calls on load).
 * @returns {Promise<Array>}
 */
export async function getPopularStocks() {
  return POPULAR_STOCKS;
}
