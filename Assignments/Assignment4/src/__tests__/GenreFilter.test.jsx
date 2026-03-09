/**
 * GenreFilter.test.jsx
 * Unit tests for the GenreFilter component.
 * Covers rendering, active state, aria-pressed, and click callbacks.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import GenreFilter from '../components/GenreFilter/GenreFilter'

const genres = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
]

describe('GenreFilter', () => {
  // ── Rendering ────────────────────────────────────────────────────

  test('renders the "All" button', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set()} onToggle={() => {}} onClear={() => {}} />
    )
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
  })

  test('renders a button for every genre', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set()} onToggle={() => {}} onClear={() => {}} />
    )
    genres.forEach((g) =>
      expect(screen.getByRole('button', { name: g.name })).toBeInTheDocument()
    )
  })

  test('renders correctly with an empty genres array', () => {
    render(
      <GenreFilter genres={[]} activeGenres={new Set()} onToggle={() => {}} onClear={() => {}} />
    )
    // Only the "All" button should be present
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  test('the wrapper has a group role and accessible label', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set()} onToggle={() => {}} onClear={() => {}} />
    )
    expect(screen.getByRole('group', { name: /filter by genre/i })).toBeInTheDocument()
  })

  // ── Active / aria-pressed state ──────────────────────────────────

  test('"All" button has aria-pressed="true" when no genres are active', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set()} onToggle={() => {}} onClear={() => {}} />
    )
    expect(screen.getByRole('button', { name: /^all$/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('"All" button has aria-pressed="false" when a genre is active', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set([28])} onToggle={() => {}} onClear={() => {}} />
    )
    expect(screen.getByRole('button', { name: /^all$/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('an active genre button has aria-pressed="true"', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set([28])} onToggle={() => {}} onClear={() => {}} />
    )
    expect(screen.getByRole('button', { name: 'Action' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('an inactive genre button has aria-pressed="false"', () => {
    render(
      <GenreFilter genres={genres} activeGenres={new Set([28])} onToggle={() => {}} onClear={() => {}} />
    )
    expect(screen.getByRole('button', { name: 'Drama' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  // ── Callbacks ────────────────────────────────────────────────────

  test('clicking a genre button calls onToggle with that genre id', async () => {
    const onToggle = vi.fn()
    render(
      <GenreFilter genres={genres} activeGenres={new Set()} onToggle={onToggle} onClear={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Action' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith(28)
  })

  test('clicking "All" calls onClear', async () => {
    const onClear = vi.fn()
    render(
      <GenreFilter genres={genres} activeGenres={new Set([28])} onToggle={() => {}} onClear={onClear} />
    )
    await userEvent.click(screen.getByRole('button', { name: /^all$/i }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  test('clicking different genres calls onToggle with the correct id each time', async () => {
    const onToggle = vi.fn()
    render(
      <GenreFilter genres={genres} activeGenres={new Set()} onToggle={onToggle} onClear={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Drama' }))
    await userEvent.click(screen.getByRole('button', { name: 'Horror' }))
    expect(onToggle).toHaveBeenNthCalledWith(1, 18)
    expect(onToggle).toHaveBeenNthCalledWith(2, 27)
  })
})
