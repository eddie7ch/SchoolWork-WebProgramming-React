import { useParams, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStock } from "../../hooks/useStock.js";
import { useWatchlist } from "../../context/WatchlistContext.jsx";
import { usePortfolio } from "../../context/PortfolioContext.jsx";
import NewsCard from "../../components/NewsCard/NewsCard.jsx";
import ChatRoom from "../../components/ChatRoom/ChatRoom.jsx";
import { getMarketNews } from "../../services/newsApi.js";
import {
  formatCurrency,
  formatPercent,
  formatCompact,
  getPriceClass,
} from "../../utils/formatters.js";
import { useEffect, useState } from "react";
import "./StockDetailsPage.css";

export default function StockDetailsPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [interval, setInterval] = useState("daily");
  const { quote, history, overview, loading, error, refresh } = useStock(
    symbol,
    interval,
  );
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { addHolding, isInPortfolio } = usePortfolio();
  const [news, setNews] = useState([]);
  const [buyShares, setBuyShares] = useState("");
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const inWatchlist = isInWatchlist(symbol);

  useEffect(() => {
    getMarketNews(symbol).then(setNews);
  }, [symbol]);

  function handleBuy(e) {
    e.preventDefault();
    const qty = parseFloat(buyShares);
    if (!qty || qty <= 0 || !quote) return;
    addHolding({ symbol, name: overview?.Name ?? symbol }, qty, quote.price);
    setBuyModalOpen(false);
    setBuyShares("");
  }

  const priceClass = getPriceClass(quote?.changePercent ?? quote?.change ?? 0);

  // Format history data for Recharts — only display close price
  const chartData = history.map((d) => ({ date: d.date, price: d.close }));

  if (loading) {
    return (
      <main className="stock-details-page">
        <div className="loading-state" aria-live="polite">
          Loading {symbol}…
        </div>
      </main>
    );
  }

  if (error && !quote) {
    return (
      <main className="stock-details-page">
        <div className="error-state" role="alert">
          <p>
            Could not load data for <strong>{symbol}</strong>.
          </p>
          <button className="btn-primary" onClick={refresh}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="stock-details-page">
      {/* Back */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ← Back
      </button>

      <div className="details-grid">
        {/* Left column */}
        <div className="details-main">
          {/* Header */}
          <section className="stock-header" aria-label="Stock summary">
            <div className="stock-header-left">
              <h1 className="stock-sym">{symbol}</h1>
              {overview?.Name && (
                <p className="stock-full-name">{overview.Name}</p>
              )}
              {overview?.Sector && (
                <span className="sector-badge">{overview.Sector}</span>
              )}
            </div>
            <div className="stock-header-right">
              <span className="detail-price">
                {formatCurrency(quote?.price)}
              </span>
              <span className={`detail-change ${priceClass}`}>
                {priceClass === "positive"
                  ? "▲"
                  : priceClass === "negative"
                    ? "▼"
                    : ""}
                {formatPercent(quote?.changePercent ?? 0)}
              </span>
              <div className="detail-actions">
                <button
                  className={`btn-watchlist-lg${inWatchlist ? " added" : ""}`}
                  onClick={() =>
                    inWatchlist
                      ? removeFromWatchlist(symbol)
                      : addToWatchlist({
                          symbol,
                          name: overview?.Name ?? symbol,
                        })
                  }
                >
                  {inWatchlist ? "★ Watching" : "☆ Watchlist"}
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setBuyModalOpen(true)}
                >
                  + Portfolio
                </button>
                <button
                  className={`btn-chat-toggle${chatOpen ? " active" : ""}`}
                  onClick={() => setChatOpen((v) => !v)}
                  aria-label={`${chatOpen ? "Close" : "Open"} chat for ${symbol}`}
                >
                  💬 Discuss {symbol}
                </button>
              </div>
            </div>
          </section>

          {/* Key stats */}
          <section className="key-stats" aria-label="Key statistics">
            {[
              { label: "Open", value: formatCurrency(quote?.open) },
              { label: "High", value: formatCurrency(quote?.high) },
              { label: "Low", value: formatCurrency(quote?.low) },
              {
                label: "Prev Close",
                value: formatCurrency(quote?.previousClose),
              },
              { label: "Volume", value: formatCompact(quote?.volume) },
              {
                label: "Mkt Cap",
                value: formatCompact(overview?.MarketCapitalization),
              },
              { label: "P/E", value: overview?.PERatio ?? "N/A" },
              {
                label: "EPS",
                value: overview?.EPS ? `$${overview.EPS}` : "N/A",
              },
              {
                label: "52W High",
                value: formatCurrency(overview?.["52WeekHigh"]),
              },
              {
                label: "52W Low",
                value: formatCurrency(overview?.["52WeekLow"]),
              },
            ].map(({ label, value }) => (
              <div key={label} className="stat-item">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
              </div>
            ))}
          </section>

          {/* Chart */}
          <section className="chart-section" aria-label="Price chart">
            <div className="chart-header">
              <h2 className="section-title">Price History</h2>
              <div
                className="interval-tabs"
                role="group"
                aria-label="Chart interval"
              >
                {["daily", "weekly", "monthly"].map((i) => (
                  <button
                    key={i}
                    className={`interval-tab${interval === i ? " active" : ""}`}
                    onClick={() => setInterval(i)}
                  >
                    {i.charAt(0).toUpperCase() + i.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={
                          priceClass === "negative" ? "#F85149" : "#3FB950"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          priceClass === "negative" ? "#F85149" : "#3FB950"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#21262D" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8B949E", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#8B949E", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    domain={["auto", "auto"]}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#161B22",
                      border: "1px solid #30363D",
                      borderRadius: 8,
                      color: "#E6EDF3",
                      fontSize: 12,
                    }}
                    formatter={(v) => [`$${v.toFixed(2)}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={priceClass === "negative" ? "#F85149" : "#3FB950"}
                    strokeWidth={2}
                    fill="url(#priceGrad)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Company description */}
          {overview?.Description && (
            <section className="company-desc" aria-label="Company description">
              <h2 className="section-title">About</h2>
              <p>{overview.Description}</p>
            </section>
          )}

          {/* Related news */}
          <section className="stock-news" aria-label="Related news">
            <h2 className="section-title">Related News</h2>
            <div className="stock-news-list">
              {news.length === 0 ? (
                <p className="empty-state">No recent news found.</p>
              ) : (
                news.map((a) => <NewsCard key={a.id} article={a} />)
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Floating chat panel — desktop */}
      {chatOpen && (
        <div className="chat-panel" aria-label="Stock discussion">
          <div className="chat-panel-header">
            <span className="chat-panel-title">💬 Discuss {symbol}</span>
            <button
              className="chat-panel-close"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <ChatRoom roomId={symbol.toLowerCase()} roomTitle={`#${symbol}`} />
        </div>
      )}

      {/* Buy Modal */}
      {buyModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Add to portfolio"
        >
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setBuyModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="modal-title">Add {symbol} to Portfolio</h2>
            <p className="modal-price">
              Current price: <strong>{formatCurrency(quote?.price)}</strong>
            </p>
            <form onSubmit={handleBuy} className="modal-form">
              <label htmlFor="shares-input" className="modal-label">
                Number of shares
              </label>
              <input
                id="shares-input"
                type="number"
                className="modal-input"
                value={buyShares}
                onChange={(e) => setBuyShares(e.target.value)}
                min="0.001"
                step="any"
                required
                placeholder="e.g. 10"
                autoFocus
              />
              {buyShares && !isNaN(buyShares) && quote?.price && (
                <p className="modal-total">
                  Total:{" "}
                  <strong>
                    {formatCurrency(parseFloat(buyShares) * quote.price)}
                  </strong>
                </p>
              )}
              <button type="submit" className="btn-primary btn-block">
                Confirm Purchase
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
