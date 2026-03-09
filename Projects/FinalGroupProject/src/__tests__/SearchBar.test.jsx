import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../components/SearchBar/SearchBar.jsx';
import * as stockApi from '../services/stockApi.js';

vi.mock('../services/stockApi.js');

const MOCK_RESULTS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
];

function renderSearchBar() {
  return render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stockApi.searchStocks.mockResolvedValue(MOCK_RESULTS);
  });

  it('renders the search input', () => {
    renderSearchBar();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('shows results after typing (debounced)', async () => {
    renderSearchBar();
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'apple' } });

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('calls searchStocks with the input value', async () => {
    renderSearchBar();
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'amzn' } });

    await waitFor(() => {
      expect(stockApi.searchStocks).toHaveBeenCalledWith('amzn');
    }, { timeout: 1000 });
  });

  it('clears the dropdown on Escape', async () => {
    renderSearchBar();
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'apple' } });

    await waitFor(() => screen.getByText('AAPL'));
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
    });
  });

  it('shows no-results message when API returns empty array', async () => {
    stockApi.searchStocks.mockResolvedValue([]);
    renderSearchBar();
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'xyz123' } });

    await waitFor(() => {
      expect(screen.getByText(/No results for/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
