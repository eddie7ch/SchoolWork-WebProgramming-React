# Assignment 4 — Testing, Debugging & Performance Report

**Course:** Web Programming — React  
**Project:** Movie Browser (built in Assignment 3)  
**Student:** Eddie  
**Date:** March 8, 2026

---

## 1. Overview

This report documents the **unit testing**, **debugging**, **performance optimisation**, and **responsive/accessibility improvements** applied to the Movie Browser project originally built in Assignment 3. All work was carried out in the `Assignments/Assignment4` folder, which is a copy of the Assignment 3 codebase with the improvements described below applied.

---

## 2. Unit Testing

### 2.1 Framework and Setup

Tests were written using **Vitest** (a Vite-native test runner) and **React Testing Library**. The combination was chosen because:

- Vitest shares the same configuration as Vite, so no separate Babel/Jest config is needed.
- React Testing Library encourages testing user-visible behaviour rather than implementation details, which produces more maintainable tests.

Additional packages:

| Package | Purpose |
|---|---|
| `@testing-library/jest-dom` | Adds matchers like `toBeInTheDocument`, `toHaveAttribute` |
| `@testing-library/user-event` | Simulates realistic user interactions (type, click) |
| `jsdom` | Browser-like DOM environment for Vitest |
| `@vitest/coverage-v8` | Code coverage reporting |

The `vite.config.js` was updated with a `test` block that sets:

```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/__tests__/setup.js'],
  css: { modules: { classNameStrategy: 'non-scoped' } },
}
```

`classNameStrategy: 'non-scoped'` ensures CSS Module class names remain readable in tests (e.g. `styles.active === 'active'`), so assertions like `.toHaveClass('active')` work correctly.

### 2.2 Test Files

| File | Component / Module | Tests |
|---|---|---|
| `tmdbApi.test.js` | `services/tmdbApi.js` | 18 |
| `SearchBar.test.jsx` | `SearchBar` | 11 |
| `GenreFilter.test.jsx` | `GenreFilter` | 11 |
| `MovieCard.test.jsx` | `MovieCard` | 12 |
| `Pagination.test.jsx` | `Pagination` | 12 |
| `HomePage.test.jsx` | `HomePage` (integration) | 12 |
| `MoviePortal.test.jsx` | `MoviePortal` | 13 |
| **Total** | | **89** |

### 2.3 Mocking Strategy

**TMDB API** (`tmdbApi.js`): In component tests (`HomePage`, `MoviePortal`), the entire module is replaced with `vi.mock('../services/tmdbApi')`. Individual functions are typed with `vi.fn()` and given controlled resolved/rejected values using `mockResolvedValue` / `mockRejectedValue`.

**`fetch`** (in `tmdbApi.test.js`): The global `fetch` is replaced with `vi.stubGlobal('fetch', vi.fn())` so API service tests run without network access. A helper function builds a minimal mock response object `{ ok: true, json: () => Promise.resolve(data) }`.

**React Router** (`MoviePortal.test.jsx`): `useParams` and `useNavigate` are mocked via `vi.mock('react-router-dom', async (importOriginal) => ...)` to supply a fixed movie `id` and a `vi.fn()` spy for the navigate function, allowing assertions on navigation calls.

**Portal root** (`MoviePortal.test.jsx`): `createPortal` requires a real DOM node. A `<div id="portal-root">` is created in `beforeEach` and removed in `afterEach` to keep tests isolated.

**`window.scrollTo`** (`setup.js`): jsdom does not implement `window.scrollTo`. It is stubbed globally in the test setup file to prevent "not implemented" console errors from the Pagination component.

### 2.4 Test Design Principles

- **Render from the user's perspective** — queries use accessible roles (`getByRole`, `getByLabelText`) rather than test IDs or class selectors wherever possible.
- **One assertion per concern** — each test verifies a single behaviour so failures pinpoint the exact issue.
- **Isolation** — `vi.clearAllMocks()` runs in `beforeEach` to reset spy call counts between tests.
- **Integration where it matters** — `HomePage.test.jsx` renders the full page including child components (SearchBar, GenreFilter, Pagination) to confirm they wire together correctly.

---

## 3. Debugging

The following bugs were found and fixed during the testing process.

### Bug 1 — `role="dialog"` on the Wrong Element (MoviePortal)

**Location:** `MoviePortal.jsx`  
**Severity:** High (accessibility / ARIA spec violation)

**Problem:** In Assignment 3, the `role="dialog"` attribute was placed on the backdrop/overlay `<div>` — the full-screen dark overlay behind the modal. According to the WAI-ARIA specification, `role="dialog"` must be placed on the element that contains the dialog content, not on a presentation overlay around it. Screen readers (e.g. NVDA, VoiceOver) use this role to identify the interactive region and announce it when it opens.

```jsx
// Assignment 3 — INCORRECT
<div className={styles.backdrop} onClick={handleClose} role="dialog" aria-modal="true">
  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
```

**Fix:** Moved `role="dialog"` and `aria-modal="true"` to the `.modal` element. The backdrop receives `role="presentation"` instead. Added `aria-labelledby="modal-movie-title"` on the dialog and `id="modal-movie-title"` on the `<h1>` so screen readers announce the movie title when the dialog opens.

```jsx
// Assignment 4 — CORRECT
<div className={styles.backdrop} onClick={handleClose} role="presentation">
  <div
    className={styles.modal}
    onClick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-movie-title"
  >
```

**Test that caught this:** `MoviePortal.test.jsx` — *"the modal container has role='dialog'"* — which fails in Assignment 3 because `getByRole('dialog')` returns the backdrop, not the modal, causing `toContainElement(screen.getByRole('dialog'))` to fail for the portal-root assertion.

---

### Bug 2 — SearchBar Doesn't Sync When Parent Resets the Query

**Location:** `SearchBar.jsx`  
**Severity:** Medium (functional regression)

**Problem:** In Assignment 3, `SearchBar` initialises its internal `value` state from `currentQuery` once on mount:

```jsx
const [value, setValue] = useState(currentQuery || '')
```

If the parent later resets `currentQuery` to `''` (e.g. when the user selects a genre and `setQuery('')` is called), the input field still shows the old typed text. The visible input is out of sync with the parent's query state.

**Fix:** A `useEffect` hook was added to synchronise `value` whenever the `currentQuery` prop changes:

```jsx
useEffect(() => {
  setValue(currentQuery || '')
}, [currentQuery])
```

**Test that caught this:** `SearchBar.test.jsx` — *"clears the input when currentQuery prop changes to empty string"* — which fails in Assignment 3 because `rerender` with `currentQuery=""` does not update the input's displayed value.

---

### Bug 3 — Deprecated Placeholder Image Service

**Location:** `MovieCard.jsx`, `MoviePortal.jsx`  
**Severity:** Low (visual)

**Problem:** `https://via.placeholder.com` is a deprecated service that began returning broken images. Both `MovieCard` and `MoviePortal` used it as a fallback when no `poster_path` was available from TMDB.

**Fix:** Replaced with `https://placehold.co`, which is the modern actively-maintained equivalent.

---

## 4. Performance Optimisation

### 4.1 React Developer Tools Profiler Findings

The React DevTools Profiler was used to record a render trace while typing in the search bar. The flame chart revealed that **every keystroke caused all movie cards to re-render**, even though their underlying `movie` data had not changed. The root cause was that `HomePage` re-renders on each `value` state change in `SearchBar` (since query/loading state changes propagate down), which previously cascaded to all children.

### 4.2 Changes Applied

#### `React.memo` on Presentational Components

All pure/presentational components are now wrapped with `React.memo`. This tells React to skip re-rendering a component if its props have not changed (shallow comparison):

| Component | Why memoised |
|---|---|
| `SearchBar` | Avoids re-render during movie grid loading state changes |
| `GenreFilter` | Genres list rarely changes; active set is only updated on click |
| `MovieCard` | Large grid; expensive to re-render all 20 cards on sort/filter changes |
| `Pagination` | Re-renders only when the page number or total pages change |

#### `useCallback` for Event Handlers in `HomePage`

Without `useCallback`, every re-render of `HomePage` creates new function objects for each handler. These new references break the shallow-equality check in `React.memo`, making it ineffective. All handlers are now wrapped:

```jsx
const handleSearch = useCallback((newQuery) => { ... }, [])
const handleGenreToggle = useCallback((genreId) => { ... }, [])
const handleGenreClear = useCallback(() => { ... }, [])
const handleMovieClick = useCallback((id) => { ... }, [navigate])
```

#### `useMemo` for Pagination Page Numbers

`Pagination.jsx` previously recalculated the visible page-number array through a plain function call on every render. This is trivial for small page counts but is now memoised with `useMemo` to demonstrate the pattern:

```jsx
const pageNumbers = useMemo(() => {
  // Build array of pages in [currentPage ± 3] window
}, [currentPage, totalPages])
```

### 4.3 Measured Result

After applying the optimisations, a second Profiler trace showed that typing in the search bar no longer caused `MovieCard`, `GenreFilter`, or `Pagination` to re-render. Only `SearchBar`'s internal state update rendered (as expected), and `HomePage` re-rendered once when the user submitted the form.

---

## 5. Accessibility Improvements

| Issue | WCAG Criterion | Fix Applied |
|---|---|---|
| Search input had no explicit label (only a placeholder) | 1.3.1 Info and Relationships | Added `<label htmlFor="movie-search">` (visually hidden) and `aria-label` on the `<input>` |
| Genre buttons had no selection state for screen readers | 4.1.2 Name, Role, Value | Added `aria-pressed={isActive}` to every genre button |
| Role="group" missing on the genre filter region | 1.3.1 | Added `role="group" aria-label="Filter by genre"` on the wrapper |
| Status messages not announced on change | 4.1.3 Status Messages | Added `role="status" aria-live="polite"` to the loading/error/empty paragraph in `HomePage` |
| Clear search button had no accessible name (`✕` is ambiguous) | 4.1.2 | Added `aria-label="Clear search"` to the clear button |
| Close button in MoviePortal labelled only with `✕` | 4.1.2 | Added `aria-label="Close movie details"` |
| Focus ring on cards removed by CSS `outline: none` | 2.4.7 Focus Visible | Added `focus-visible` outline using `#e50914` red to match the brand colour |
| Pagination had no landmark | 2.4.1 Bypass Blocks | Wrapped in `<nav aria-label="Pagination">` |
| Active pageination button had no programmatic indicator | 4.1.2 | Added `aria-current="page"` to the current page button |

---

## 6. Responsive Design

### 6.1 Approach

CSS Media Queries were added to three modules:

- `HomePage.module.css` — reduced padding and heading font size; switched the grid from `auto-fill` to a fixed `2`-column layout at 480 px.
- `MoviePortal.module.css` — stacks poster + details vertically at 768 px; switches to a full-screen modal (border-radius: 0, 100dvh) at 480 px.
- `SearchBar.module.css` — wraps the form so the search button becomes full-width at 480 px.
- `Pagination.module.css` — reduces button padding and font size at 480 px.

### 6.2 Breakpoints

| Breakpoint | Behaviour |
|---|---|
| ≥ 1024 px (Desktop) | Default styles; 4–5 column auto-fill grid |
| 768 – 1023 px (Tablet) | Smaller page padding; 3-column grid; stacked MoviePortal layout |
| ≤ 480 px (Mobile) | 2-column grid; full-screen modal; stacked SearchBar |

### 6.3 Testing

The layouts were verified using Chrome DevTools Device Toolbar at:
- iPhone SE (375 × 667)
- iPad Mini (768 × 1024)  
- Desktop (1440 × 900)

---

## 7. Summary of All Changes

| Category | File(s) Changed | Change |
|---|---|---|
| Bug fix | `MoviePortal.jsx` | Moved `role="dialog"` from backdrop to modal |
| Bug fix | `SearchBar.jsx` | Added `useEffect` to sync with `currentQuery` prop |
| Bug fix | `MovieCard.jsx`, `MoviePortal.jsx` | Replaced deprecated placeholder image URL |
| Performance | `SearchBar.jsx` | Wrapped with `React.memo` |
| Performance | `GenreFilter.jsx` | Wrapped with `React.memo` |
| Performance | `MovieCard.jsx` | Wrapped with `React.memo` |
| Performance | `Pagination.jsx` | Wrapped with `React.memo`; `useMemo` for page numbers |
| Performance | `HomePage.jsx` | `useCallback` on all event handlers |
| Accessibility | `SearchBar.jsx` | Added `aria-label`, `role="search"`, visually-hidden `<label>` |
| Accessibility | `GenreFilter.jsx` | Added `aria-pressed`, `role="group"`, `aria-label` |
| Accessibility | `MovieCard.jsx` | Added `aria-label` on card, `focus-visible` ring |
| Accessibility | `MoviePortal.jsx` | Fixed `aria-labelledby`, `aria-label` on close button |
| Accessibility | `HomePage.jsx` | Added `role="status" aria-live="polite"` on status messages |
| Accessibility | `Pagination.jsx` | Added `<nav>` landmark, `aria-current`, `focus-visible` ring |
| Responsive | `MoviePortal.module.css` | Mobile full-screen modal; tablet stacked layout |
| Responsive | `HomePage.module.css` | Smaller heading and grid on tablet/mobile |
| Responsive | `SearchBar.module.css` | Full-width button on mobile |
| Responsive | `Pagination.module.css` | Smaller buttons on mobile |
| Testing | `package.json`, `vite.config.js` | Added Vitest + React Testing Library dependencies and config |
| Testing | `src/__tests__/` | 89 unit/integration tests across 7 test files |
