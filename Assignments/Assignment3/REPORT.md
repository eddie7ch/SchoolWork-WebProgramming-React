# Assignment 3 — Movie Browser App
**Course:** Web Programming — React | Bow Valley College

---

## Overview

This project is a single-page movie browsing application built with React. It allows users to search for movies, filter by genre, paginate through results, and view detailed information for any movie — all powered by the TMDB (The Movie Database) public API.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| React Router v6 | Client-side SPA routing |
| React Portals (`createPortal`) | Movie detail overlay rendering |
| CSS Modules | Scoped, component-level styling |
| Vite | Build tool and dev server |
| TMDB API v3 | Movie data source |

---

## Application Structure

```
src/
├── App.jsx                         ← Root component, React Router setup
├── main.jsx                        ← Entry point with BrowserRouter
├── services/
│   └── tmdbApi.js                  ← All TMDB API calls centralised here
├── pages/
│   └── HomePage/
│       ├── HomePage.jsx            ← Main page: search, filter, grid, pagination
│       └── HomePage.module.css
└── components/
    ├── SearchBar/                  ← Text search input
    ├── GenreFilter/                ← Multi-select genre filter buttons
    ├── MovieCard/                  ← Individual movie card in the grid
    ├── Pagination/                 ← Page navigation with ellipsis
    └── MoviePortal/                ← Movie detail overlay using React Portal
```

---

## Key Features

### 1. Home Page
- Displays a paginated grid of popular movies on load (20 per page)
- Search by movie title (text search via TMDB `/search/movie`)
- Multi-select genre filter (via TMDB `/discover/movie` with `with_genres`)
- Pagination component showing current page, prev/next, and nearby page numbers

### 2. React Router Navigation
- URL `/` renders the home page
- URL `/movie/:id` is a **nested route** under `/` — the home page stays mounted and visible behind the movie detail overlay
- Navigation back uses `useNavigate(-1)`, preserving the user's scroll position and filter state

### 3. React Portals — Movie Detail Page
The movie detail overlay is rendered using `ReactDOM.createPortal()`.

**Why Portals?**  
Normally, React renders components inside their parent DOM node (`#root`). For a full-screen overlay, this can cause z-index and overflow clipping issues. `createPortal` lets us render the modal into `#portal-root` — a sibling div to `#root` in `index.html` — while keeping the component in the React tree (so hooks, context, and event bubbling all work normally).

```jsx
// MoviePortal.jsx
return createPortal(content, document.getElementById('portal-root'))
```

This approach satisfies both requirements: React Router manages the URL, and React Portal manages the DOM rendering.

### 4. CSS Modules
Every component uses a `.module.css` file. Styles are imported as objects:
```jsx
import styles from './MovieCard.module.css'
// Used as: className={styles.card}
```
This ensures class names are locally scoped and never collide between components.

---

## Setup Instructions

1. Clone the repository
2. Navigate to `Assignments/Assignment3/`
3. Copy `.env.example` to `.env` and add your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   ```
4. Get a free API key at [themoviedb.org](https://www.themoviedb.org/signup) → Settings → API
5. Run:
   ```bash
   npm install
   npm run dev
   ```

---

## Development Challenges

### Challenge 1: Combining Search and Genre Filter with Pagination
**Problem:** TMDB's search API and discover API are separate endpoints. Combining text search with genre filtering on different pages required a unified state management approach.

**Solution:** A single `useEffect` with `[query, activeGenres, page]` as dependencies handles all three fetch modes: popular (default), search (if query exists), and discover (if genres selected). When either query or genres change, `page` resets to 1 automatically.

### Challenge 2: React Portal with Nested Route
**Problem:** Making the movie detail page render as an overlay over the home page while also supporting URL-based navigation (React Router) required combining two React concepts.

**Solution:** The `/movie/:id` route is nested inside `/`, so `HomePage` always stays mounted. `MoviePortal` is the component for that nested route — it uses `createPortal` to break out of the DOM hierarchy and render into `#portal-root`. The home page remains visible beneath the overlay. Closing the portal navigates back to `/` with `useNavigate(-1)`.

### Challenge 3: Stale State on Fast Navigation
**Problem:** If a user clicks a movie, then immediately clicks another, two simultaneous API requests could land out of order, showing the wrong movie.

**Solution:** A `cancelled` flag in the fetch `useEffect` ensures that if the component re-renders before the request completes, the stale response is discarded.

---

## API Reference

All TMDB API calls are in `src/services/tmdbApi.js`:

| Function | Endpoint | Used For |
|---|---|---|
| `getPopularMovies(page)` | `/movie/popular` | Default home page listing |
| `searchMovies(query, page)` | `/search/movie` | Text search |
| `discoverMovies(genreIds, page)` | `/discover/movie` | Genre filter |
| `getGenres()` | `/genre/movie/list` | Genre filter labels |
| `getMovieDetails(id)` | `/movie/{id}` | Movie detail overlay |
| `getMovieCredits(id)` | `/movie/{id}/credits` | Cast list in detail overlay |
