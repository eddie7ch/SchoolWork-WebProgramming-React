/**
 * MoviePortal.test.jsx
 * Unit tests for the MoviePortal component.
 *
 * Challenges:
 *   1. The component uses react-router-dom hooks (useParams, useNavigate)
 *      → mocked via vi.mock so tests control the id and navigate spy.
 *   2. The component renders into #portal-root via createPortal
 *      → the DOM node is created in beforeEach and removed in afterEach.
 *   3. The component fetches two API endpoints in parallel
 *      → both are mocked via vi.mock on the tmdbApi module.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// ── Mock react-router-dom hooks ──────────────────────────────────────
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  }
})
import { useParams, useNavigate } from 'react-router-dom'

// ── Mock TMDB API ────────────────────────────────────────────────────
vi.mock('../services/tmdbApi', () => ({
  getMovieDetails: vi.fn(),
  getMovieCredits: vi.fn(),
  IMAGE_BASE: 'https://image.tmdb.org/t/p',
}))
import * as tmdbApi from '../services/tmdbApi'

// ── Import component after all mocks are registered ──────────────────
import MoviePortal from '../components/MoviePortal/MoviePortal'

// ── Test data ─────────────────────────────────────────────────────────
const mockMovie = {
  id: 550,
  title: 'Fight Club',
  tagline: 'Mischief. Mayhem. Soap.',
  overview: 'An insomniac office worker forms an underground fight club.',
  release_date: '1999-10-15',
  vote_average: 8.8,
  runtime: 139,
  status: 'Released',
  backdrop_path: null,
  poster_path: null,
  genres: [{ id: 18, name: 'Drama' }],
}

const mockCredits = {
  cast: [
    { id: 1, name: 'Brad Pitt' },
    { id: 2, name: 'Edward Norton' },
    { id: 3, name: 'Helena Bonham Carter' },
  ],
}

describe('MoviePortal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Provide a portal root in the jsdom document
    const portalRoot = document.createElement('div')
    portalRoot.id = 'portal-root'
    document.body.appendChild(portalRoot)

    // Default router hook return values
    vi.mocked(useParams).mockReturnValue({ id: '550' })
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    // Default API mock responses
    vi.mocked(tmdbApi.getMovieDetails).mockResolvedValue(mockMovie)
    vi.mocked(tmdbApi.getMovieCredits).mockResolvedValue(mockCredits)
  })

  afterEach(() => {
    const portalRoot = document.getElementById('portal-root')
    if (portalRoot) portalRoot.remove()
  })

  // ── Loading state ────────────────────────────────────────────────

  test('shows a loading indicator initially', () => {
    // Keep promises pending so the loading state persists
    vi.mocked(tmdbApi.getMovieDetails).mockReturnValue(new Promise(() => {}))
    vi.mocked(tmdbApi.getMovieCredits).mockReturnValue(new Promise(() => {}))

    render(<MoviePortal />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  // ── Successful render ────────────────────────────────────────────

  test('renders the movie title after data loads', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Fight Club' })).toBeInTheDocument()
    })
  })

  test('renders the movie tagline', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText(/Mischief\. Mayhem\. Soap\./)).toBeInTheDocument()
    })
  })

  test('renders the movie overview', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText(/insomniac office worker/i)).toBeInTheDocument()
    })
  })

  test('renders the release year', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText('1999')).toBeInTheDocument()
    })
  })

  test('renders the runtime', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText('139 min')).toBeInTheDocument()
    })
  })

  test('renders genre tags', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText('Drama')).toBeInTheDocument()
    })
  })

  test('renders cast member names', async () => {
    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText(/Brad Pitt/)).toBeInTheDocument()
      expect(screen.getByText(/Edward Norton/)).toBeInTheDocument()
    })
  })

  // ── Accessibility: dialog role (bug-fix verification) ────────────

  test('the modal container has role="dialog"', async () => {
    render(<MoviePortal />)
    await waitFor(() => screen.getByRole('heading', { name: 'Fight Club' }))
    // The dialog should be findable — this fails if role is on the wrong element
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('the dialog has aria-modal="true"', async () => {
    render(<MoviePortal />)
    await waitFor(() => screen.getByRole('dialog'))
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  test('the close button has an accessible aria-label', async () => {
    render(<MoviePortal />)
    await waitFor(() => screen.getByRole('button', { name: /close movie details/i }))
    expect(
      screen.getByRole('button', { name: /close movie details/i })
    ).toBeInTheDocument()
  })

  // ── Error state ──────────────────────────────────────────────────

  test('shows an error message when the API fetch fails', async () => {
    vi.mocked(tmdbApi.getMovieDetails).mockRejectedValue(new Error('API error'))
    vi.mocked(tmdbApi.getMovieCredits).mockRejectedValue(new Error('API error'))

    render(<MoviePortal />)
    await waitFor(() => {
      expect(screen.getByText(/Failed to load movie details/i)).toBeInTheDocument()
    })
  })

  // ── Navigation / close behaviour ────────────────────────────────

  test('clicking the close button calls navigate(-1)', async () => {
    render(<MoviePortal />)
    await waitFor(() =>
      screen.getByRole('button', { name: /close movie details/i })
    )
    await userEvent.click(screen.getByRole('button', { name: /close movie details/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  test('clicking "Back to Movies" button calls navigate(-1)', async () => {
    render(<MoviePortal />)
    await waitFor(() => screen.getByRole('button', { name: /back to movies/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to movies/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  // ── Portal rendering ─────────────────────────────────────────────

  test('content is rendered into the portal-root element', async () => {
    render(<MoviePortal />)
    await waitFor(() => screen.getByRole('heading', { name: 'Fight Club' }))
    const portalRoot = document.getElementById('portal-root')
    // The dialog should be a descendant of portal-root
    expect(portalRoot).toContainElement(screen.getByRole('dialog'))
  })
})
