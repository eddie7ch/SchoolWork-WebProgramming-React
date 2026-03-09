/**
 * App.jsx — Root component.
 *
 * Routing structure:
 *   /              → HomePage (movie grid, search, filter, pagination)
 *   /movie/:id     → Nested route; renders MoviePortal as a React Portal
 *                    overlay on top of the visible home page.
 *
 * The nested route pattern means HomePage always renders at "/",
 * and MoviePortal breaks out of the DOM tree via createPortal()
 * into #portal-root (defined in index.html).
 */
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import MoviePortal from './components/MoviePortal/MoviePortal'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<HomePage />}>
          {/* Nested route — MoviePortal renders as portal over the home page */}
          <Route path="movie/:id" element={<MoviePortal />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
