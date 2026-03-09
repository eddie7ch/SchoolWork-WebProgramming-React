import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WatchlistProvider, useWatchlist } from '../context/WatchlistContext.jsx';

const STOCK_A = { symbol: 'AAPL', name: 'Apple Inc.' };
const STOCK_B = { symbol: 'MSFT', name: 'Microsoft' };

/** Helper component to expose the context under test. */
function Inspector({ onRender }) {
  const ctx = useWatchlist();
  onRender(ctx);
  return null;
}

function setup() {
  let ctx;
  render(
    <WatchlistProvider>
      <Inspector onRender={(c) => { ctx = c; }} />
    </WatchlistProvider>
  );
  return () => ctx;
}

describe('WatchlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty watchlist', () => {
    const getCtx = setup();
    expect(getCtx().watchlist).toHaveLength(0);
  });

  it('adds a stock to the watchlist', () => {
    const getCtx = setup();
    act(() => getCtx().addToWatchlist(STOCK_A));
    expect(getCtx().watchlist).toHaveLength(1);
    expect(getCtx().watchlist[0].symbol).toBe('AAPL');
  });

  it('does not add a duplicate stock', () => {
    const getCtx = setup();
    act(() => {
      getCtx().addToWatchlist(STOCK_A);
      getCtx().addToWatchlist(STOCK_A);
    });
    expect(getCtx().watchlist).toHaveLength(1);
  });

  it('removes a stock from the watchlist', () => {
    const getCtx = setup();
    act(() => {
      getCtx().addToWatchlist(STOCK_A);
      getCtx().addToWatchlist(STOCK_B);
      getCtx().removeFromWatchlist('AAPL');
    });
    expect(getCtx().watchlist).toHaveLength(1);
    expect(getCtx().watchlist[0].symbol).toBe('MSFT');
  });

  it('isInWatchlist returns true when stock is present', () => {
    const getCtx = setup();
    act(() => getCtx().addToWatchlist(STOCK_A));
    expect(getCtx().isInWatchlist('AAPL')).toBe(true);
  });

  it('isInWatchlist returns false when stock is absent', () => {
    const getCtx = setup();
    expect(getCtx().isInWatchlist('TSLA')).toBe(false);
  });
});
