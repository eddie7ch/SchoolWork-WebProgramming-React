import { MOCK_NEWS } from '../utils/mockData.js';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch market news. Uses Alpha Vantage News Sentiment API.
 * Falls back to mock data if the API key is missing or the rate limit is hit.
 * @param {string|null} symbol  Optional ticker symbol to filter news.
 * @returns {Promise<Array>}
 */
export async function getMarketNews(symbol = null) {
  try {
    if (!API_KEY || API_KEY === 'your_api_key_here') throw new Error('NO_API_KEY');

    const params = new URLSearchParams({
      function: 'NEWS_SENTIMENT',
      apikey: API_KEY,
      limit: '20',
      sort: 'LATEST',
    });
    if (symbol) params.append('tickers', symbol);

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('HTTP_ERROR');

    const data = await response.json();
    if (!data.feed || data['Note'] || data['Information']) throw new Error('RATE_LIMITED');

    return data.feed.map((article) => ({
      id: article.url,
      title: article.title,
      summary: article.summary,
      source: article.source,
      publishedAt: article.time_published,
      url: article.url,
      isBreaking:
        article.overall_sentiment_label === 'Bearish' &&
        parseFloat(article.overall_sentiment_score) < -0.3,
      relatedSymbols: (article.ticker_sentiment ?? []).map((t) => t.ticker),
      imageUrl: article.banner_image ?? null,
      sentimentLabel: article.overall_sentiment_label,
      sentimentScore: article.overall_sentiment_score,
    }));
  } catch {
    if (symbol) {
      return MOCK_NEWS.filter(
        (n) => n.relatedSymbols.includes(symbol) || n.relatedSymbols.length === 0
      );
    }
    return MOCK_NEWS;
  }
}
