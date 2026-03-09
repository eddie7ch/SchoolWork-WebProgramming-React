/**
 * Pagination.test.jsx
 * Unit tests for the Pagination component.
 * Covers Prev/Next button state, page number rendering, active page
 * indicator, ellipsis logic, callback values, and aria attributes.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeAll } from 'vitest'
import Pagination from '../components/Pagination/Pagination'

// window.scrollTo is already stubbed in setup.js

describe('Pagination', () => {
  // ── Rendering ────────────────────────────────────────────────────

  test('renders a Prev and Next button', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  test('renders the component inside a <nav> landmark', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
  })

  test('renders visible page number buttons around the current page', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />)
    // The window is ±3 from currentPage, so pages 2–8 for currentPage=5
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  // ── Disabled state ───────────────────────────────────────────────

  test('Prev button is disabled on the first page', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  test('Next button is disabled on the last page', () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  test('Prev button is enabled when not on the first page', () => {
    render(<Pagination currentPage={2} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).not.toBeDisabled()
  })

  // ── Active page indicator ────────────────────────────────────────

  test('the current page button has aria-current="page"', () => {
    render(<Pagination currentPage={4} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('non-current page buttons do not have aria-current', () => {
    render(<Pagination currentPage={4} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '3' })).not.toHaveAttribute('aria-current')
  })

  // ── Callbacks ────────────────────────────────────────────────────

  test('clicking Next calls onPageChange with currentPage + 1', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  test('clicking Prev calls onPageChange with currentPage - 1', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  test('clicking a numbered page button calls onPageChange with that number', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '7' }))
    expect(onPageChange).toHaveBeenCalledWith(7)
  })

  // ── Ellipsis logic ───────────────────────────────────────────────

  test('shows ellipsis before the visible range when far from the start', () => {
    render(<Pagination currentPage={8} totalPages={20} onPageChange={() => {}} />)
    // Page 1 is shown separately and there should be a "…" separator
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1)
  })

  test('shows page 1 when currentPage is far from the start', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
  })
})
