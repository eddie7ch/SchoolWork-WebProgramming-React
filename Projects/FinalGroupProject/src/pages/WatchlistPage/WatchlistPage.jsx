import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext.jsx';
import { getStockQuote } from '../../services/stockApi.js';
import { formatCurrency, formatPercent, formatDate, getPriceClass } from '../../utils/formatters.js';
import './WatchlistPage.css';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (watchlist.length === 0) return;

    setLoading(true);
    Promise.all(
      watchlist.map((item) =>
        getStockQuote(item.symbol).then((q) => [item.symbol, q])
      )
    ).then((entries) => {
      setQuotes(Object.fromEntries(entries));
      setLoading(false);
    });
  }, [watchlist]);

  if (watchlist.length === 0) {
    return (
      <main className="watchlist-page">
        <h1 className="page-title">My Watchlist</h1>
        <div className="empty-page">
          <span className="empty-icon" aria-hidden="true">☆</span>
          <p>Your watchlist is empty.</p>
          <p className="empty-sub">Search for a stock and click ☆ to add it.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Explore Stocks</button>
        </div>
      </main>
    );
  }

  return (
    <main className="watchlist-page">
      <h1 className="page-title">My Watchlist</h1>
      <p className="page-subtitle">{watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} watched</p>

      <div className="watchlist-table-wrapper" role="region" aria-label="Watchlist">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col">Name</th>
              <th scope="col" className="num-col">Price</th>
              <th scope="col" className="num-col">Change</th>
              <th scope="col">Added</th>
              <th scope="col" className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((item) => {
              const q = quotes[item.symbol];
              const priceClass = getPriceClass(q?.changePercent ?? q?.change ?? 0);
              return (
                <tr
                  key={item.symbol}
                  className="watchlist-row"
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/stock/${item.symbol}`)}
                  aria-label={`View ${item.symbol}`}
                >
                  <td className="symbol-cell">{item.symbol}</td>
                  <td className="name-cell">{item.name}</td>
                  <td className="num-col">
                    {loading || !q ? (
                      <span className="skeleton-text" aria-label="Loading" />
                    ) : (
                      formatCurrency(q.price)
                    )}
                  </td>
                  <td className={`num-col change-cell${q ? ` ${priceClass}` : ''}`}>
                    {loading || !q ? (
                      <span className="skeleton-text" aria-label="Loading" />
                    ) : (
                      formatPercent(q.changePercent ?? q.change ?? 0)
                    )}
                  </td>
                  <td className="date-cell">{formatDate(item.addedAt)}</td>
                  <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-remove"
                      onClick={() => removeFromWatchlist(item.symbol)}
                      aria-label={`Remove ${item.symbol} from watchlist`}
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
