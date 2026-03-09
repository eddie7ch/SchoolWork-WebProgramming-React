import { useEffect, useState } from 'react';
import { getPopularStocks } from '../../services/stockApi.js';
import StockCard from '../StockCard/StockCard.jsx';
import './PopularStocks.css';

export default function PopularStocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularStocks().then((data) => {
      setStocks(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="popular-stocks" aria-busy="true">
        <h2 className="section-title">Popular Stocks</h2>
        <div className="stocks-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" aria-hidden="true" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="popular-stocks">
      <h2 className="section-title">Popular Stocks</h2>
      <div className="stocks-grid">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </section>
  );
}
