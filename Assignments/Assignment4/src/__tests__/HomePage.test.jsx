/**
 * HomePage.test.jsx
 * Integration tests for the HomePage component.
 * The TMDB API module is fully mocked so no real HTTP calls are made.
 * Tests cover: initial loading state, successful movie rendering, error
 * handling, empty results, search submission, genre filtering, and
 * pagination visibility.
 */
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage'

// ── Mock the entire TMDB API module ──────────────────────────────────
vi.mock('../services/tmdbApi', () => ({
  getPopularMovies: vi.fn(),
  searchMovies: vi.fn(),
  discoverMovies: vi.fn(),
  getGenres: vi.fn(),
  IMAGE_BASE: 'https://image.tmdb.org/t/p',
}))

import * as tmdbApi from '../services/tmdbApi'

// ── Test data ─────────────────────────────────────────────────────────
const mockMovies = [
  { id: 1, title: 'Inception', release_date: '2010-07-16', vote_average: 8.8, poster_path: null },
  { id: 2, title: 'The Matrix', release_date: '1999-03-31', vote_average: 8.7, poster_path: null },
]

const mockGenres = [
  { id: 28, name: 'Action' },
  { id: 878, name: 'Sci-Fi' },
]

/** Render HomePage inside the router context it expects */
function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tmdbApi.getGenres).mockResolvedValue(mockGenres)
    vi.mocked(tmdbApi.getPopularMovies).mockResolvedValue({
      results: mockMovies,
      total_pages: 3,
    })
  })

  // ── Header ───────────────────────────────────────────────────────

  test('renders the page heading', async () => {
    renderHomePage()
    expect(
      screen.getByRole('heading', { name: /Movie Browser/i })
    ).toBeInTheDocument()
  })

  test('renders the subtitle', async () => {
    renderHomePage()
    expect(screen.getByText(/powered by TMDB/i)).toBeInTheDocument()
  })

  // ── Loading state ────────────────────────────────────────────────

  test('shows a loading message while fetching movies', () => {
    // Never resolve to keep the loading state visible
    vi.mocked(tmdbApi.getPopularMovies).mockReturnValue(new Promise(() => {}))
    renderHomePage()
    expect(screen.getByText(/loading movies/i)).toBeInTheDocument()
  })

  // ── Successful fetch ─────────────────────────────────────────────

  test('renders movie titles after a successful fetch', async () => {
    renderHomePage()
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
      expect(screen.getByText('The Matrix')).toBeInTheDocument()
    })
  })

  test('renders genre filter buttons after genres load', async () => {
    renderHomePage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sci-Fi' })).toBeInTheDocument()
    })
  })

  test('shows pagination when there are movies and multiple pages', async () => {
    renderHomePage()
    await waitFor(() => {
      expect(
        screen.getByRole('navigation', { name: /pagination/i })
      ).toBeInTheDocument()
    })
  })

  // ── Error state ──────────────────────────────────────────────────

  test('shows an error message when the API call fails', async () => {
    vi.mocked(tmdbApi.getPopularMovies).mockRejectedValue(new Error('Network error'))
    renderHomePage()
    await waitFor(() => {
      expect(screen.getByText(/Failed to load movies/i)).toBeInTheDocument()
    })
  })

  // ── Empty results ────────────────────────────────────────────────

  test('shows a "no movies found" message when results are empty', async () => {
    vi.mocked(tmdbApi.getPopularMovies).mockResolvedValue({
      results: [],
      total_pages: 0,
    })
    renderHomePage()
    await waitFor(() => {
      expect(screen.getByText(/No movies found/i)).toBeInTheDocument()
    })
  })

  test('hides pagination when there are no results', async () => {
    vi.mocked(tmdbApi.getPopularMovies).mockResolvedValue({
      results: [],
      total_pages: 0,
    })
    renderHomePage()
    await waitFor(() => screen.getByText(/No movies found/i))
    expect(
      screen.queryByRole('navigation', { name: /pagination/i })
    ).not.toBeInTheDocument()
  })

  // ── Search ───────────────────────────────────────────────────────

  test('calls searchMovies when user submits a search query', async () => {
    vi.mocked(tmdbApi.searchMovies).mockResolvedValue({
      results: [mockMovies[0]],
      total_pages: 1,
    })
    renderHomePage()
    await waitFor(() => screen.getByText('Inception'))

    await userEvent.type(screen.getByRole('textbox'), 'inception')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => {
      expect(tmdbApi.searchMovies).toHaveBeenCalledWith('inception', 1)
    })
  })

  // ── Genre filter ─────────────────────────────────────────────────

  test('calls discoverMovies when a genre is selected', async () => {
    vi.mocked(tmdbApi.discoverMovies).mockResolvedValue({
      results: mockMovies,
      total_pages: 1,
    })
    renderHomePage()
    await waitFor(() => screen.getByRole('button', { name: 'Action' }))

    await userEvent.click(screen.getByRole('button', { name: 'Action' }))

    await waitFor(() => {
      expect(tmdbApi.discoverMovies).toHaveBeenCalledWith('28', 1)
    })
  })

  test('calls getPopularMovies again when "All" genre is clicked after a selection', async () => {
    vi.mocked(tmdbApi.discoverMovies).mockResolvedValue({ results: [], total_pages: 0 })
    renderHomePage()
    await waitFor(() => screen.getByRole('button', { name: 'Action' }))

    // Select a genre
    await userEvent.click(screen.getByRole('button', { name: 'Action' }))
    await waitFor(() => expect(tmdbApi.discoverMovies).toHaveBeenCalled())

    // Clear by clicking "All"
    await userEvent.click(screen.getByRole('button', { name: /^all$/i }))
    await waitFor(() => {
      // getPopularMovies should now have been called a second time (page 1 reset)
      expect(tmdbApi.getPopularMovies).toHaveBeenCalledTimes(2)
    })
  })
})
