import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { getStockQuote } from '../../services/stockApi.js';
import {
  formatCurrency, formatPercent, formatCompact, getPriceClass,
} from '../../utils/formatters.js';
import './PortfolioPage.css';

export default function PortfolioPage() {
  const { holdings, removeHolding, updateQuantity } = usePortfolio();
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [editSymbol, setEditSymbol] = useState(null);
  const [editQty, setEditQty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (holdings.length === 0) return;
    setLoading(true);
    Promise.all(
      holdings.map((h) => getStockQuote(h.symbol).then((q) => [h.symbol, q]))
    ).then((entries) => {
      setQuotes(Object.fromEntries(entries));
      setLoading(false);
    });
  }, [holdings]);

  // Portfolio totals
  const totalValue = holdings.reduce((sum, h) => {
    const q = quotes[h.symbol];
    return sum + (q ? q.price * h.quantity : 0);
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + h.avgCost * h.quantity, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  function startEdit(symbol, currentQty) {
    setEditSymbol(symbol);
    setEditQty(String(currentQty));
  }

  function saveEdit(symbol) {
    const qty = parseFloat(editQty);
    if (!isNaN(qty)) updateQuantity(symbol, qty);
    setEditSymbol(null);
  }

  if (holdings.length === 0) {
    return (
      <main className="portfolio-page">
        <h1 className="page-title">My Portfolio</h1>
        <div className="empty-page">
          <span className="empty-icon" aria-hidden="true">💼</span>
          <p>Your portfolio is empty.</p>
          <p className="empty-sub">Find a stock and click &ldquo;+ Portfolio&rdquo; to add a holding.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Explore Stocks</button>
        </div>
      </main>
    );
  }

  return (
    <main className="portfolio-page">
      <h1 className="page-title">My Portfolio</h1>

      {/* Summary cards */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <span className="summary-label">Total Value</span>
          <span className="summary-value">{formatCompact(totalValue)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Cost</span>
          <span className="summary-value">{formatCompact(totalCost)}</span>
        </div>
        <div className={`summary-card gain-card ${getPriceClass(totalGain)}`}>
          <span className="summary-label">Total Gain / Loss</span>
          <span className="summary-value">
            {totalGain >= 0 ? '+' : ''}{formatCompact(totalGain)}
            {' '}
            <span className="summary-sub">({formatPercent(totalGainPct)})</span>
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Holdings</span>
          <span className="summary-value">{holdings.length}</span>
        </div>
      </div>

      {/* Holdings table */}
      <div className="portfolio-table-wrapper" role="region" aria-label="Portfolio holdings">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col">Name</th>
              <th scope="col" className="num-col">Price</th>
              <th scope="col" className="num-col">Change</th>
              <th scope="col" className="num-col">Shares</th>
              <th scope="col" className="num-col">Avg Cost</th>
              <th scope="col" className="num-col">Market Value</th>
              <th scope="col" className="num-col">Gain / Loss</th>
              <th scope="col" className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const q = quotes[holding.symbol];
              const price = q?.price;
              const marketValue = price ? price * holding.quantity : null;
              const costBasis = holding.avgCost * holding.quantity;
              const gain = marketValue !== null ? marketValue - costBasis : null;
              const gainPct = gain !== null && costBasis > 0 ? (gain / costBasis) * 100 : null;
              const priceClass = getPriceClass(q?.changePercent ?? q?.change ?? 0);
              const gainClass = getPriceClass(gain ?? 0);

              return (
                <tr
                  key={holding.symbol}
                  className="portfolio-row"
                  onClick={() => editSymbol !== holding.symbol && navigate(`/stock/${holding.symbol}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && editSymbol !== holding.symbol && navigate(`/stock/${holding.symbol}`)
                  }
                  aria-label={`${holding.symbol} holding`}
                >
                  <td className="symbol-cell">{holding.symbol}</td>
                  <td className="name-cell">{holding.name}</td>
                  <td className="num-col">
                    {loading || !q ? <span className="skeleton-text" /> : formatCurrency(price)}
                  </td>
                  <td className={`num-col change-cell${q ? ` ${priceClass}` : ''}`}>
                    {loading || !q ? (
                      <span className="skeleton-text" />
                    ) : (
                      formatPercent(q.changePercent ?? q.change ?? 0)
                    )}
                  </td>
                  <td className="num-col" onClick={(e) => e.stopPropagation()}>
                    {editSymbol === holding.symbol ? (
                      <input
                        type="number"
                        className="qty-input"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        onBlur={() => saveEdit(holding.symbol)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(holding.symbol)}
                        min="0"
                        step="any"
                        autoFocus
                        aria-label={`Edit shares for ${holding.symbol}`}
                      />
                    ) : (
                      <span
                        className="editable-qty"
                        onClick={() => startEdit(holding.symbol, holding.quantity)}
                        title="Click to edit"
                      >
                        {holding.quantity}
                      </span>
                    )}
                  </td>
                  <td className="num-col">{formatCurrency(holding.avgCost)}</td>
                  <td className="num-col">
                    {marketValue !== null ? formatCurrency(marketValue) : '—'}
                  </td>
                  <td className={`num-col gain-cell${gainClass ? ` ${gainClass}` : ''}`}>
                    {gain !== null ? (
                      <>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                        {gainPct !== null && (
                          <span className="gain-pct"> ({formatPercent(gainPct)})</span>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-remove"
                      onClick={() => removeHolding(holding.symbol)}
                      aria-label={`Remove ${holding.symbol} from portfolio`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
