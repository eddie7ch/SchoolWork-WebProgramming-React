/**
 * Pagination.jsx
 * Page navigation control with Previous / Next buttons and numbered pages.
 * Shows up to 7 page numbers centred around the current page.
 * Props:
 *   currentPage  — active page number (1-based)
 *   totalPages   — total number of available pages
 *   onPageChange — called with the new page number
 */
import styles from './Pagination.module.css'

function Pagination({ currentPage, totalPages, onPageChange }) {
  /** Build the array of page numbers to display (max 7 visible). */
  function getPageNumbers() {
    const delta = 3
    const pages = []
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)

    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const pageNumbers = getPageNumbers()

  // Scroll to top when changing pages
  function changePage(p) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onPageChange(p)
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Prev
      </button>

      {/* Show ellipsis if not starting from page 1 */}
      {pageNumbers[0] > 1 && (
        <>
          <button className={styles.btn} onClick={() => changePage(1)}>1</button>
          {pageNumbers[0] > 2 && <span className={styles.ellipsis}>…</span>}
        </>
      )}

      {pageNumbers.map((p) => (
        <button
          key={p}
          className={`${styles.btn} ${p === currentPage ? styles.active : ''}`}
          onClick={() => changePage(p)}
        >
          {p}
        </button>
      ))}

      {/* Show ellipsis if not ending at last page */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className={styles.ellipsis}>…</span>
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
      >
        Next →
      </button>
    </div>
  )
}

export default Pagination
