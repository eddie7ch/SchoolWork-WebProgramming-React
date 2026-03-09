/**
 * Pagination.jsx
 * Page navigation control with Previous / Next buttons and numbered pages.
 * Shows up to 7 page numbers centred around the current page.
 *
 * PERFORMANCE:
 *   - Wrapped in React.memo — skips re-render when page/totalPages unchanged.
 *   - pageNumbers array is memoised with useMemo to avoid recomputing the
 *     visible range on unrelated parent re-renders.
 *
 * ACCESSIBILITY:
 *   - Wrapped in <nav> with aria-label="Pagination" for landmark navigation.
 *   - Current page button gets aria-current="page" so screen readers
 *     announce which page is active.
 *   - Prev/Next buttons have descriptive aria-labels.
 *
 * Props:
 *   currentPage  — active page number (1-based)
 *   totalPages   — total number of available pages
 *   onPageChange — called with the new page number
 */
import { memo, useMemo } from 'react'
import styles from './Pagination.module.css'

function Pagination({ currentPage, totalPages, onPageChange }) {
  /** Build the array of page numbers to display (max 7 visible). */
  const pageNumbers = useMemo(() => {
    const delta = 3
    const pages = []
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, totalPages])

  function changePage(p) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onPageChange(p)
  }

  return (
    <nav aria-label="Pagination" className={styles.wrapper}>
      <button
        className={styles.btn}
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {/* Show ellipsis if not starting from page 1 */}
      {pageNumbers[0] > 1 && (
        <>
          <button className={styles.btn} onClick={() => changePage(1)}>1</button>
          {pageNumbers[0] > 2 && <span className={styles.ellipsis} aria-hidden="true">…</span>}
        </>
      )}

      {pageNumbers.map((p) => (
        <button
          key={p}
          className={`${styles.btn} ${p === currentPage ? styles.active : ''}`}
          onClick={() => changePage(p)}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {/* Show ellipsis if not ending at last page */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className={styles.ellipsis} aria-hidden="true">…</span>
          )}
          <button className={styles.btn} onClick={() => changePage(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className={styles.btn}
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  )
}

export default memo(Pagination)
