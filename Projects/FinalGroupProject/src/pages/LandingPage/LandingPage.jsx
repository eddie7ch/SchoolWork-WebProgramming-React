import { useEffect, useState } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import PopularStocks from '../../components/PopularStocks/PopularStocks.jsx';
import NewsCard from '../../components/NewsCard/NewsCard.jsx';
import { getMarketNews } from '../../services/newsApi.js';
import './LandingPage.css';

export default function LandingPage() {
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    getMarketNews().then((data) => {
      setNews(data);
      setNewsLoading(false);
    });
  }, []);

  const breakingNews = news.filter((n) => n.isBreaking);
  const regularNews = news.filter((n) => !n.isBreaking);

  return (
    <main className="landing-page">
      {/* Hero */}
      <section className="hero" aria-label="Site introduction">
        <div className="hero-content">
          <div className="hero-logo">
            <span className="hero-icon" aria-hidden="true">📈</span>
            <h1 className="hero-title">StockPulse</h1>
          </div>
          <p className="hero-tagline">
            Track, analyze, and collaborate on stocks — all in one place.
          </p>
          <div className="hero-search">
            <SearchBar placeholder="Search any stock symbol or company name…" />
          </div>
        </div>
      </section>

      <div className="landing-grid">
        {/* Left: Popular Stocks */}
        <div className="landing-main">
          <PopularStocks />
        </div>

        {/* Right: News Feed */}
        <aside className="news-column" aria-label="Market news">
          <h2 className="section-title">Market News</h2>

          {breakingNews.length > 0 && (
            <div className="breaking-section">
              {breakingNews.map((article) => (
                <NewsCard key={article.id} article={article} featured />
              ))}
            </div>
          )}

          <div className="news-list">
            {newsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton-news" aria-hidden="true" />
                ))
              : regularNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
