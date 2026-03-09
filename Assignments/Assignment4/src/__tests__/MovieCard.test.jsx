/**
 * MovieCard.test.jsx
 * Unit tests for the MovieCard component.
 * Covers rendering of title, year, rating, poster fallback,
 * keyboard and click interactions, and accessibility attributes.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import MovieCard from '../components/MovieCard/MovieCard'

// Mock the service module so IMAGE_BASE is a predictable string in tests
vi.mock('../services/tmdbApi', () => ({
  IMAGE_BASE: 'https://image.tmdb.org/t/p',
}))

const movie = {
  id: 550,
  title: 'Fight Club',
  release_date: '1999-10-15',
  vote_average: 8.8,
  poster_path: '/fight-club.jpg',
}

describe('MovieCard', () => {
  // ── Rendering ────────────────────────────────────────────────────

  test('renders the movie title', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    expect(screen.getByText('Fight Club')).toBeInTheDocument()
  })

  test('renders the release year extracted from release_date', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    expect(screen.getByText('1999')).toBeInTheDocument()
  })

  test('displays "N/A" when release_date is absent', () => {
    render(<MovieCard movie={{ ...movie, release_date: null }} onClick={() => {}} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  test('renders the vote_average formatted to one decimal', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    expect(screen.getByText(/8\.8/)).toBeInTheDocument()
  })

  test('renders the poster image with the movie title as alt text', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    const img = screen.getByAltText('Fight Club')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('/w300'))
  })

  test('builds the poster URL using IMAGE_BASE and poster_path', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    const img = screen.getByAltText('Fight Club')
    expect(img.src).toBe('https://image.tmdb.org/t/p/w300/fight-club.jpg')
  })

  test('uses the fallback image URL when poster_path is null', () => {
    render(<MovieCard movie={{ ...movie, poster_path: null }} onClick={() => {}} />)
    const img = screen.getByAltText('Fight Club')
    expect(img.src).toContain('placehold.co')
  })

  // ── Accessibility ────────────────────────────────────────────────

  test('has role="button" for keyboard navigation', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('the card button has an accessible aria-label', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Fight Club')
    )
  })

  test('the card is focusable (has tabIndex 0)', () => {
    render(<MovieCard movie={movie} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0')
  })

  // ── Interactions ─────────────────────────────────────────────────

  test('calls onClick when the card is clicked', async () => {
    const onClick = vi.fn()
    render(<MovieCard movie={movie} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('calls onClick when the Enter key is pressed on the card', () => {
    const onClick = vi.fn()
    render(<MovieCard movie={movie} onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when a non-Enter key is pressed', () => {
    const onClick = vi.fn()
    render(<MovieCard movie={movie} onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(onClick).not.toHaveBeenCalled()
  })
})
