import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StockCard from '../components/StockCard/StockCard.jsx';
import { WatchlistProvider } from '../context/WatchlistContext.jsx';

const mockStock = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 178.45,
  change: 2.34,
  changePercent: 1.33,
  volume: 56_800_000,
  marketCap: 2_780_000_000_000,
};

function renderCard(stock = mockStock, showActions = true) {
  return render(
    <MemoryRouter>
      <WatchlistProvider>
        <StockCard stock={stock} showActions={showActions} />
      </WatchlistProvider>
    </MemoryRouter>
  );
}

describe('StockCard', () => {
  it('renders the stock symbol', () => {
    renderCard();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('renders the stock name', () => {
    renderCard();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    renderCard();
    expect(screen.getByText('$178.45')).toBeInTheDocument();
  });

  it('renders a positive change indicator', () => {
    renderCard();
    const change = screen.getByText(/\+1\.33%/);
    expect(change).toBeInTheDocument();
    expect(change.className).toContain('positive');
  });

  it('renders a negative change indicator for a losing stock', () => {
    const losingStock = { ...mockStock, changePercent: -1.9, change: -4.55 };
    renderCard(losingStock);
    const change = screen.getByText(/-1\.90%/);
    expect(change.className).toContain('negative');
  });

  it('shows the watchlist toggle button when showActions is true', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /add AAPL to watchlist/i })).toBeInTheDocument();
  });

  it('hides the watchlist button when showActions is false', () => {
    renderCard(mockStock, false);
    expect(screen.queryByRole('button', { name: /watchlist/i })).not.toBeInTheDocument();
  });

  it('toggles watchlist state when clicked', () => {
    renderCard();
    const btn = screen.getByRole('button', { name: /add AAPL to watchlist/i });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /remove AAPL from watchlist/i })).toBeInTheDocument();
  });
});
