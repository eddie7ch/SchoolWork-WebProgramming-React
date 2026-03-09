import { formatRelativeTime } from '../../utils/formatters.js';
import './NewsCard.css';

/**
 * Displays a single news article card.
 * @param {{ article: Object, featured?: boolean }} props
 */
export default function NewsCard({ article, featured = false }) {
  return (
    <article className={`news-card${featured ? ' featured' : ''}`}>
      {article.isBreaking && (
        <span className="breaking-badge" aria-label="Breaking news">⚡ BREAKING</span>
      )}

      <div className="news-card-body">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-title"
          aria-label={article.title}
        >
          {article.title}
        </a>

        {featured && article.summary && (
          <p className="news-summary">{article.summary}</p>
        )}

        <div className="news-meta">
          <span className="news-source">{article.source}</span>
          <span className="news-dot" aria-hidden="true">·</span>
          <time
            className="news-time"
            dateTime={article.publishedAt}
            title={new Date(article.publishedAt).toLocaleString()}
          >
            {formatRelativeTime(article.publishedAt)}
          </time>
          {article.relatedSymbols?.length > 0 && (
            <>
              <span className="news-dot" aria-hidden="true">·</span>
              <span className="news-tickers">
                {article.relatedSymbols.slice(0, 3).map((sym) => (
                  <span key={sym} className="ticker-tag">{sym}</span>
                ))}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
