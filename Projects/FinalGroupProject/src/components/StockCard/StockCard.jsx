import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext.jsx';
import { formatCurrency, formatPercent, formatCompact, getPriceClass } from '../../utils/formatters.js';
import './StockCard.css';

/**
 * Reusable card that displays a stock's key metrics.
 * @param {{ stock: Object, showActions?: boolean }} props
 */
export default function StockCard({ stock, showActions = true }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const navigate = useNavigate();
  const inWatchlist = isInWatchlist(stock.symbol);
  const priceClass = getPriceClass(stock.changePercent ?? stock.change);

  function handleWatchlistToggle(e) {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(stock.symbol);
    } else {
      addToWatchlist(stock);
    }
  }

  return (
    <article
      className="stock-card"
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/stock/${stock.symbol}`)}
      aria-label={`View details for ${stock.name || stock.symbol}`}
    >
      <div className="stock-card-header">
        <div>
          <span className="stock-symbol">{stock.symbol}</span>
          {stock.name && <span className="stock-name">{stock.name}</span>}
        </div>
        {showActions && (
          <button
            className={`btn-watchlist${inWatchlist ? ' added' : ''}`}
            onClick={handleWatchlistToggle}
            aria-label={inWatchlist ? `Remove ${stock.symbol} from watchlist` : `Add ${stock.symbol} to watchlist`}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="stock-card-price">
        <span className="price">{formatCurrency(stock.price)}</span>
        <span className={`change ${priceClass}`}>
          {priceClass === 'positive' ? '▲' : priceClass === 'negative' ? '▼' : ''}
          {formatPercent(stock.changePercent ?? stock.change)}
        </span>
      </div>

      {(stock.volume !== undefined || stock.marketCap !== undefined) && (
        <div className="stock-card-meta">
          {stock.volume !== undefined && (
            <span className="meta-item">
              <span className="meta-label">Vol</span>
              <span className="meta-value">{formatCompact(stock.volume)}</span>
            </span>
          )}
          {stock.marketCap !== undefined && (
            <span className="meta-item">
              <span className="meta-label">Mkt Cap</span>
              <span className="meta-value">{formatCompact(stock.marketCap)}</span>
            </span>
          )}
        </div>
      )}
    </article>
  );
}
