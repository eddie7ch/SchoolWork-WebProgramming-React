import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PortfolioProvider, usePortfolio } from '../context/PortfolioContext.jsx';

const AAPL = { symbol: 'AAPL', name: 'Apple Inc.' };
const MSFT = { symbol: 'MSFT', name: 'Microsoft' };

function Inspector({ onRender }) {
  const ctx = usePortfolio();
  onRender(ctx);
  return null;
}

function setup() {
  let ctx;
  render(
    <PortfolioProvider>
      <Inspector onRender={(c) => { ctx = c; }} />
    </PortfolioProvider>
  );
  return () => ctx;
}

describe('PortfolioContext', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no holdings', () => {
    const getCtx = setup();
    expect(getCtx().holdings).toHaveLength(0);
  });

  it('adds a new holding', () => {
    const getCtx = setup();
    act(() => getCtx().addHolding(AAPL, 10, 170));
    const holding = getCtx().holdings[0];
    expect(holding.symbol).toBe('AAPL');
    expect(holding.quantity).toBe(10);
    expect(holding.avgCost).toBe(170);
  });

  it('averages cost when adding more shares to existing holding', () => {
    const getCtx = setup();
    act(() => {
      getCtx().addHolding(AAPL, 10, 100); // cost = 1000
      getCtx().addHolding(AAPL, 10, 200); // cost = 2000 → avg = 150
    });
    const holding = getCtx().holdings[0];
    expect(holding.quantity).toBe(20);
    expect(holding.avgCost).toBe(150);
  });

  it('removes a holding', () => {
    const getCtx = setup();
    act(() => {
      getCtx().addHolding(AAPL, 5, 150);
      getCtx().addHolding(MSFT, 3, 400);
      getCtx().removeHolding('AAPL');
    });
    expect(getCtx().holdings.find((h) => h.symbol === 'AAPL')).toBeUndefined();
    expect(getCtx().holdings).toHaveLength(1);
  });

  it('updateQuantity changes the quantity', () => {
    const getCtx = setup();
    act(() => {
      getCtx().addHolding(AAPL, 5, 150);
      getCtx().updateQuantity('AAPL', 20);
    });
    expect(getCtx().holdings[0].quantity).toBe(20);
  });

  it('updateQuantity with 0 removes the holding', () => {
    const getCtx = setup();
    act(() => {
      getCtx().addHolding(AAPL, 5, 150);
      getCtx().updateQuantity('AAPL', 0);
    });
    expect(getCtx().holdings).toHaveLength(0);
  });

  it('isInPortfolio returns correct boolean', () => {
    const getCtx = setup();
    act(() => getCtx().addHolding(AAPL, 1, 100));
    expect(getCtx().isInPortfolio('AAPL')).toBe(true);
    expect(getCtx().isInPortfolio('TSLA')).toBe(false);
  });
});
