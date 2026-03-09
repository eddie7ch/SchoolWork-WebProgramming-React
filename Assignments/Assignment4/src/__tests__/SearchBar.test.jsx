/**
 * SearchBar.test.jsx
 * Unit tests for the SearchBar component.
 * Covers rendering, controlled value, form submission, clear button,
 * and the bug-fix sync behaviour when currentQuery changes externally.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import SearchBar from '../components/SearchBar/SearchBar'

describe('SearchBar', () => {
  // ── Rendering ────────────────────────────────────────────────────

  test('renders a text input', () => {
    render(<SearchBar onSearch={() => {}} currentQuery="" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('renders a Search submit button', () => {
    render(<SearchBar onSearch={() => {}} currentQuery="" />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  test('input has an accessible label', () => {
    render(<SearchBar onSearch={() => {}} currentQuery="" />)
    // The aria-label attribute makes the input accessible
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Search movies by title'
    )
  })

  test('input displays the currentQuery prop as its value', () => {
    render(<SearchBar onSearch={() => {}} currentQuery="batman" />)
    expect(screen.getByRole('textbox')).toHaveValue('batman')
  })

  // ── Clear button ─────────────────────────────────────────────────

  test('does not render the clear button when the query is empty', () => {
    render(<SearchBar onSearch={() => {}} currentQuery="" />)
    expect(
      screen.queryByRole('button', { name: /clear search/i })
    ).not.toBeInTheDocument()
  })

  test('renders the clear button when currentQuery is populated', () => {
    render(<SearchBar onSearch={() => {}} currentQuery="batman" />)
    expect(
      screen.getByRole('button', { name: /clear search/i })
    ).toBeInTheDocument()
  })

  test('clicking the clear button calls onSearch with an empty string', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} currentQuery="batman" />)
    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))
    expect(onSearch).toHaveBeenCalledWith('')
  })

  test('clicking the clear button empties the input', async () => {
    render(<SearchBar onSearch={() => {}} currentQuery="batman" />)
    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  // ── Submission ───────────────────────────────────────────────────

  test('calls onSearch with the trimmed value on form submit', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} currentQuery="" />)
    await userEvent.type(screen.getByRole('textbox'), '  inception  ')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    expect(onSearch).toHaveBeenCalledWith('inception')
  })

  test('calls onSearch when the user presses Enter', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} currentQuery="" />)
    await userEvent.type(screen.getByRole('textbox'), 'inception{Enter}')
    expect(onSearch).toHaveBeenCalledWith('inception')
  })

  // ── Bug-fix: external query reset sync (Assignment 4) ────────────

  test('clears the input when currentQuery prop changes to empty string', async () => {
    const { rerender } = render(<SearchBar onSearch={() => {}} currentQuery="batman" />)
    expect(screen.getByRole('textbox')).toHaveValue('batman')

    // Simulate parent resetting the query (e.g. user clicks "Clear all filters")
    rerender(<SearchBar onSearch={() => {}} currentQuery="" />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  test('updates the input when currentQuery prop changes to a new value', async () => {
    const { rerender } = render(<SearchBar onSearch={() => {}} currentQuery="batman" />)
    rerender(<SearchBar onSearch={() => {}} currentQuery="inception" />)
    expect(screen.getByRole('textbox')).toHaveValue('inception')
  })
})
