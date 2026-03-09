// Mock data used for development and as a fallback when the API rate limit is reached.

export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.34, changePercent: 1.33, volume: 56800000, marketCap: 2780000000000, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.22, change: -1.23, changePercent: -0.30, volume: 22100000, marketCap: 3090000000000, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 171.96, change: 3.45, changePercent: 2.05, volume: 24300000, marketCap: 2140000000000, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 187.02, change: 1.87, changePercent: 1.01, volume: 38900000, marketCap: 1950000000000, sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 235.45, change: -4.55, changePercent: -1.90, volume: 104200000, marketCap: 748300000000, sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.35, change: 22.15, changePercent: 2.60, volume: 43700000, marketCap: 2150000000000, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 527.19, change: 6.29, changePercent: 1.21, volume: 14800000, marketCap: 1350000000000, sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 201.15, change: -0.85, changePercent: -0.42, volume: 9800000, marketCap: 580000000000, sector: 'Financial Services' },
];

export const MOCK_NEWS = [
  {
    id: 1,
    title: 'Fed Signals Potential Rate Cuts as Inflation Cools',
    summary: 'Federal Reserve officials hinted at possible interest rate reductions later this year as inflation data shows continued improvement toward the 2% target.',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    url: '#',
    isBreaking: true,
    relatedSymbols: ['SPY', 'QQQ'],
    imageUrl: null,
  },
  {
    id: 2,
    title: 'NVIDIA Surpasses $2 Trillion Market Cap on AI Demand',
    summary: "NVIDIA's market capitalization crossed the $2 trillion milestone, driven by insatiable demand for its AI chips from cloud providers and enterprises.",
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: '#',
    isBreaking: false,
    relatedSymbols: ['NVDA'],
    imageUrl: null,
  },
  {
    id: 3,
    title: 'Apple Intelligence Features Drive iPhone Upgrade Cycle',
    summary: 'Analysts raise Apple price targets as AI-powered features in iOS are expected to accelerate iPhone upgrades among existing users.',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    url: '#',
    isBreaking: false,
    relatedSymbols: ['AAPL'],
    imageUrl: null,
  },
  {
    id: 4,
    title: 'Tesla Reports Record Q4 Deliveries Despite EV Slowdown',
    summary: 'Tesla delivered 484,507 vehicles in Q4, beating analyst expectations despite broader electric vehicle market challenges.',
    source: 'CNBC',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    url: '#',
    isBreaking: false,
    relatedSymbols: ['TSLA'],
    imageUrl: null,
  },
  {
    id: 5,
    title: 'Microsoft Azure Growth Accelerates on AI Workloads',
    summary: "Microsoft's cloud division posted 29% revenue growth as enterprises rapidly deploy AI workloads on Azure infrastructure.",
    source: 'Wall Street Journal',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: '#',
    isBreaking: false,
    relatedSymbols: ['MSFT'],
    imageUrl: null,
  },
  {
    id: 6,
    title: 'Amazon Expands Same-Day Delivery to 20 New Cities',
    summary: 'Amazon announces major logistics expansion, extending same-day delivery capabilities to 20 additional metropolitan areas across North America.',
    source: 'TechCrunch',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    url: '#',
    isBreaking: false,
    relatedSymbols: ['AMZN'],
    imageUrl: null,
  },
];

/**
 * Generate deterministic-looking mock historical OHLCV data.
 * @param {number} basePrice  Starting price reference.
 * @param {number} days       Number of calendar days to cover.
 * @returns {Array<{date:string,open:number,high:number,low:number,close:number,volume:number}>}
 */
export function generateHistoricalData(basePrice = 150, days = 90) {
  const data = [];
  let price = basePrice * 0.85;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    const drift = (Math.random() - 0.47) * price * 0.025;
    price = Math.max(price + drift, 1);

    const open = parseFloat((price * (1 - Math.random() * 0.008)).toFixed(2));
    const high = parseFloat((price * (1 + Math.random() * 0.018)).toFixed(2));
    const low = parseFloat((price * (1 - Math.random() * 0.018)).toFixed(2));
    const close = parseFloat(price.toFixed(2));

    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 50_000_000 + 10_000_000),
    });
  }

  return data;
}
