import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchStocks } from '../../services/stockApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import './SearchBar.css';

export default function SearchBar({ placeholder = 'Search stocks by symbol or name…' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchStocks(debouncedQuery).then((data) => {
      if (!cancelled) {
        setResults(data);
        setOpen(true);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(symbol) {
    setQuery('');
    setOpen(false);
    navigate(`/stock/${symbol}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div className="search-bar" ref={wrapperRef} role="search">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search stocks"
          aria-expanded={open}
          aria-controls="search-results"
          autoComplete="off"
        />
        {loading && <span className="search-spinner" aria-label="Searching…" />}
      </div>

      {open && results.length > 0 && (
        <ul
          id="search-results"
          className="search-dropdown"
          role="listbox"
          aria-label="Search results"
        >
          {results.map((item) => (
            <li
              key={item.symbol}
              role="option"
              className="search-result-item"
              onClick={() => handleSelect(item.symbol)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(item.symbol)}
              tabIndex={0}
            >
              <span className="result-symbol">{item.symbol}</span>
              <span className="result-name">{item.name}</span>
              <span className="result-type">{item.type}</span>
            </li>
          ))}
        </ul>
      )}

      {open && results.length === 0 && !loading && (
        <div className="search-empty" role="status">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
