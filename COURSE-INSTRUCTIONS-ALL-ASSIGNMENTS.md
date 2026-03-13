# Web Programming (React) — All Assignments & Course Context
**Course:** Web Programming — React | Bow Valley College
**Student:** Eddie Chongtham (eddie7ch)
**Repo:** SchoolWork-WebProgramming-React (Public on GitHub)
**Submission filename format:** `chongtham_eddie_[assignment]_#`

---

## Course Overview

This course covers modern front-end development with React:
- React 18 — functional components, hooks (useState, useEffect, useCallback, useMemo)
- React Router v6 — SPA routing, nested routes, useNavigate, useParams
- React Context API — global state management
- React Portals — rendering outside the normal DOM tree
- CSS Modules — scoped component styling
- Vite — build tool and dev server
- API integration (REST APIs, third-party services)
- React.memo — performance optimization
- Unit testing with Vitest + React Testing Library
- Accessibility (WCAG AA, ARIA attributes)
- Responsive design (CSS media queries)

---

## Repository Structure

```
SchoolWork-WebProgramming-React/
├── Activities/         ← in-class lab exercises
├── Assignments/
│   ├── Assignment1/    ← Weather App (static data + component basics)
│   ├── Assignment2/    ← Recipe Search App (API + hooks)
│   ├── Assignment3/    ← Movie Browser App (TMDB API + Router + Portals)
│   └── Assignment4/    ← Testing, Debugging, Performance (extends A3)
└── Projects/
    └── FinalGroupProject/  ← StockPulse (full-stack React + Socket.io + Alpha Vantage)
```

---

## Assignment 1 — Weather App

**Folder:** `Assignments/Assignment1/`
**Package name:** `weather-app`
**Focus:** React fundamentals — components, props, state, static data

### What was built
A weather display application using hardcoded/static data:
- `WeatherDisplay` component
- Static location data from `src/data/locations.json`
- Basic React component structure with props and state

### Folder Structure
```
Assignment1/
├── src/
│   ├── components/
│   │   └── WeatherDisplay/   ← Main weather display component
│   ├── data/
│   │   └── locations.json    ← Static location/weather data
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

### Key Concepts Demonstrated
- Functional components with JSX
- `useState` for managing selected location
- `props` passing between components
- Conditional rendering
- Iterating over arrays with `.map()`
- CSS styling for a weather UI

### Run
```bash
cd Assignments/Assignment1
npm install
npm run dev
```

---

## Assignment 2 — Recipe Search App

**Folder:** `Assignments/Assignment2/`
**Package name:** `recipe-search-app`
**Focus:** API integration, hooks, component composition

### What was built
A recipe search application using TheMealDB API:
- Search for recipes by keyword
- Filter recipes by category/area
- View full recipe details (ingredients, instructions)
- `mealApi.js` service layer for all API calls

### Component Structure
```
Assignment2/
├── src/
│   ├── components/
│   │   ├── FilterBar/      ← Category and area filter UI
│   │   ├── RecipeCard/     ← Individual recipe card in the grid
│   │   ├── RecipeDetail/   ← Full recipe detail view (ingredients + instructions)
│   │   └── SearchBar/      ← Text search input
│   ├── services/
│   │   └── mealApi.js      ← TheMealDB API calls
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

### Key Concepts Demonstrated
- `useEffect` for fetching data on mount and when search/filter changes
- `useState` for multiple state values (query, filters, results, selected)
- API service layer pattern (all calls in one file)
- Controlled component inputs
- Loading and error states

### API
- TheMealDB: `https://www.themealdb.com/api/json/v1/1/`
- No API key required (free public API)

### Run
```bash
cd Assignments/Assignment2
npm install
npm run dev
```

---

## Assignment 3 — Movie Browser App

**Folder:** `Assignments/Assignment3/`
**Focus:** React Router v6, React Portals, CSS Modules, TMDB API, advanced state

### What was built
A single-page movie browsing application:
- Search by movie title (TMDB `/search/movie`)
- Multi-select genre filter (TMDB `/discover/movie`)
- Paginated movie grid (20 per page)
- Movie detail overlay using **React Portals**
- URL-based navigation with **React Router v6**
- All styles via **CSS Modules** (no class name collisions)

### Application Structure
```
Assignment3/
├── src/
│   ├── services/
│   │   └── tmdbApi.js              ← All TMDB API calls centralised
│   ├── pages/
│   │   └── HomePage/
│   │       ├── HomePage.jsx        ← Search, filter, grid, pagination
│   │       └── HomePage.module.css
│   ├── components/
│   │   ├── SearchBar/              ← Text search input
│   │   ├── GenreFilter/            ← Multi-select genre buttons
│   │   ├── MovieCard/              ← Individual movie card
│   │   ├── Pagination/             ← Page nav with ellipsis
│   │   └── MoviePortal/            ← Movie detail overlay (React Portal)
│   ├── App.jsx
│   └── main.jsx
└── .env (needs VITE_TMDB_API_KEY)
```

### TMDB API Functions (in tmdbApi.js)

| Function | Endpoint | Used For |
|---|---|---|
| `getTopRatedMovies(page)` | `/movie/top_rated` | Default home listing |
| `searchMovies(query, page)` | `/search/movie` | Text search |
| `discoverMovies(genreIds, page)` | `/discover/movie` | Genre filter |
| `getGenres()` | `/genre/movie/list` | Genre filter labels |
| `getMovieDetails(id)` | `/movie/{id}` | Movie detail overlay |
| `getMovieCredits(id)` | `/movie/{id}/credits` | Cast list |

### React Router Setup
```jsx
// Nested route: home page stays mounted while movie detail is shown
<Routes>
  <Route path="/" element={<HomePage />}>
    <Route path="/movie/:id" element={<MoviePortal />} />
  </Route>
</Routes>
```

### React Portal Usage
```jsx
// MoviePortal.jsx — renders into #portal-root (sibling of #root)
return createPortal(content, document.getElementById('portal-root'))
```

Why: Breaks out of DOM hierarchy for full-screen overlays without z-index/overflow clipping issues.

### Setup
```bash
cd Assignments/Assignment3
cp .env.example .env
# Add your TMDB API key: VITE_TMDB_API_KEY=your_key_here
# Get free key at https://www.themoviedb.org → Settings → API
npm install
npm run dev
```

---

## Assignment 4 — Testing, Debugging & Performance

**Folder:** `Assignments/Assignment4/`
**Focus:** Unit testing (Vitest), debugging, React.memo / useCallback / useMemo, accessibility, responsive

### What was built
Assignment 4 is Assignment 3's codebase with the following improvements applied:

---

### Testing Framework
- **Vitest** (Vite-native test runner, no separate Babel/Jest config)
- **React Testing Library** (tests user-visible behaviour)
- **@testing-library/jest-dom** — matchers like `toBeInTheDocument`
- **@testing-library/user-event** — realistic user interactions
- **jsdom** — browser-like DOM environment
- **@vitest/coverage-v8** — code coverage

### Test Files (95 tests total)

| File | Component | Tests |
|---|---|---|
| `tmdbApi.test.js` | `services/tmdbApi.js` | 19 |
| `SearchBar.test.jsx` | `SearchBar` | 12 |
| `GenreFilter.test.jsx` | `GenreFilter` | 11 |
| `MovieCard.test.jsx` | `MovieCard` | 13 |
| `Pagination.test.jsx` | `Pagination` | 13 |
| `HomePage.test.jsx` | `HomePage` (integration) | 12 |
| `MoviePortal.test.jsx` | `MoviePortal` | 15 |

### Mocking Strategy
- **TMDB API** in component tests: `vi.mock('../services/tmdbApi')` + `mockResolvedValue`
- **fetch** in API tests: `vi.stubGlobal('fetch', vi.fn())`
- **React Router**: `vi.mock('react-router-dom', async (importOriginal) => ...)` for `useParams` and `useNavigate`
- **Portal root**: Create/remove `<div id="portal-root">` in `beforeEach`/`afterEach`
- **window.scrollTo**: Stubbed globally in `setup.js` (jsdom doesn't implement it)

### Vite Config for Tests
```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/__tests__/setup.js'],
  css: { modules: { classNameStrategy: 'non-scoped' } },
}
// 'non-scoped' ensures CSS Module class names are readable in tests
// (e.g. styles.active === 'active' so .toHaveClass('active') works)
```

---

### 3 Bugs Fixed

**Bug 1 — `role="dialog"` on wrong element (MoviePortal)**
- Problem: `role="dialog"` was on the backdrop instead of the modal content div → ARIA spec violation, screen readers announce wrong element
- Fix: Move to `.modal` div, add `role="presentation"` to backdrop, add `aria-labelledby`

**Bug 2 — SearchBar doesn't sync when parent resets query**
- Problem: `useState(currentQuery)` only sets initial value; if parent resets to `''`, the input shows stale text
- Fix: Add `useEffect(() => { setValue(currentQuery || '') }, [currentQuery])`

**Bug 3 — Deprecated placeholder image service**
- Problem: `https://via.placeholder.com` is deprecated and returns broken images
- Fix: Replace with `https://placehold.co`

---

### Performance Optimizations

**React.memo on all presentational components:**
```jsx
export default React.memo(MovieCard)
export default React.memo(SearchBar)
export default React.memo(GenreFilter)
export default React.memo(Pagination)
```

**useCallback for all event handlers in HomePage:**
```jsx
const handleSearch = useCallback((newQuery) => { ... }, [])
const handleGenreToggle = useCallback((genreId) => { ... }, [])
const handleGenreClear = useCallback(() => { ... }, [])
const handleMovieClick = useCallback((id) => { ... }, [navigate])
```

**useMemo for pagination page number array:**
```jsx
const pageNumbers = useMemo(() => {
  // Build array of pages in [currentPage ± 3] window
}, [currentPage, totalPages])
```

---

### Accessibility Improvements

| Issue | WCAG | Fix |
|---|---|---|
| Search input no explicit label | 1.3.1 | `<label htmlFor="movie-search">` + `aria-label` |
| Genre buttons no selection state | 4.1.2 | `aria-pressed={isActive}` on each button |
| No group role on genre filter | 1.3.1 | `role="group" aria-label="Filter by genre"` |
| Status messages not announced | 4.1.3 | `role="status" aria-live="polite"` |
| Clear button ambiguous (✕) | 4.1.2 | `aria-label="Clear search"` |
| Close button ambiguous (✕) | 4.1.2 | `aria-label="Close movie details"` |
| Focus ring removed by CSS | 2.4.7 | `focus-visible` outline in CSS |
| Pagination no landmark | 2.4.1 | `<nav aria-label="Pagination">` |
| Active page no indicator | 4.1.2 | `aria-current="page"` on current button |

### Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| ≥ 1024 px | Default — 4–5 column auto-fill grid |
| 768–1023 px | Tablet — smaller padding, 3-column, stacked portal |
| ≤ 480 px | Mobile — 2-column, full-screen modal, stacked SearchBar |

### Run Tests
```bash
cd Assignments/Assignment4
npm install
npm test
npm run coverage
```

---

## Final Group Project — StockPulse

**Folder:** `Projects/FinalGroupProject/`
**Student (solo):** Eddie Chongtham
**Live Frontend:** https://stockpulse-blush.vercel.app
**Live Backend:** https://stockpulse-server-production.up.railway.app

### What was built
A full-stack stock market dashboard with real-time features:
1. **Stock Search** — debounced search (300 ms), Alpha Vantage `SYMBOL_SEARCH`
2. **Stock Quotes** — price, change $, change %, volume via `GLOBAL_QUOTE`
3. **Historical Charts** — 90-day price history via `TIME_SERIES_DAILY`, Recharts `LineChart`
4. **Company Overview** — sector, industry, market cap, P/E, 52-week range
5. **Watchlist** — localStorage-persisted symbol list with live quotes
6. **Portfolio Tracker** — holdings with weighted-average cost, unrealised P&L
7. **Market News** — Alpha Vantage `NEWS_SENTIMENT` with Bullish/Bearish/Neutral labels
8. **Real-Time Chat** — Socket.io rooms with link/image sharing + XSS protection

### Application Structure
```
src/
├── App.jsx
├── context/
│   ├── AuthContext.jsx          ← Username login (localStorage)
│   ├── WatchlistContext.jsx     ← Watchlist (localStorage)
│   └── PortfolioContext.jsx     ← Portfolio holdings (weighted-avg cost)
├── hooks/
│   ├── useDebounce.js           ← 300 ms debounce for search
│   └── useStock.js              ← Loads quote + overview for one symbol
├── services/
│   ├── stockApi.js              ← Alpha Vantage: quote, search, historical, overview
│   ├── newsApi.js               ← Alpha Vantage: news sentiment feed
│   └── chatService.js          ← Socket.io singleton, XSS sanitise
├── utils/
│   ├── formatters.js            ← Currency, percent, volume, date
│   └── mockData.js              ← Fallback mock stocks and news
├── components/
│   ├── Navbar/
│   ├── SearchBar/               ← Debounced symbol search
│   ├── StockCard/               ← Quote card (price, change, %)
│   ├── PopularStocks/           ← Grid of pre-set tickers
│   ├── NewsCard/
│   └── ChatRoom/                ← Real-time chat + room switching
└── pages/
    ├── LandingPage/             ← Search + popular stocks + news
    ├── LoginPage/               ← Username entry (no password)
    ├── StockDetailsPage/        ← Full quote + chart + company info
    ├── WatchlistPage/
    ├── PortfolioPage/           ← P&L calculation
    └── ChatPage/                ← Chat room browser

server/
├── index.js                     ← Express + Socket.io backend
└── package.json
```

### Key Technical Details

**Weighted-average cost formula (Portfolio):**
```
newAvgCost = (prevAvgCost × prevQty + purchasePrice × newQty) / (prevQty + newQty)
```

**Mock data fallback** — triggers when:
- `VITE_ALPHA_VANTAGE_KEY` not set or is placeholder
- Alpha Vantage rate limit hit (25 requests/day on free tier)

**XSS protection (defence-in-depth):**
- Client: `sanitize()` in `chatService.js` escapes HTML before emitting
- Server: `sanitize()` in `server/index.js` escapes before broadcasting

**API response caching:**
- 5-minute in-memory cache in `stockApi.js` prevents redundant calls

### Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://stockpulse-blush.vercel.app |
| Backend (chat) | Railway | https://stockpulse-server-production.up.railway.app |

**Deploy Frontend (Vercel):**
1. Connect GitHub repo, set Root Directory to `Projects/FinalGroupProject`
2. Add env vars: `VITE_ALPHA_VANTAGE_KEY`, `VITE_SOCKET_URL`
3. Deploy — `vercel.json` rewrites all routes to `index.html`

**Deploy Backend (Railway/Render):**
1. Point to `Projects/FinalGroupProject/server/`
2. Start command: `node index.js`
3. Set `ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`

### Run Locally
```bash
# Frontend
cd Projects/FinalGroupProject
cp .env.example .env
# Set VITE_ALPHA_VANTAGE_KEY and VITE_SOCKET_URL in .env
npm install
npm run dev

# Backend (in a separate terminal)
cd Projects/FinalGroupProject/server
npm install
node index.js
```

### Bonus Features (Extra Credit)
- Link & image sharing in chat (URLs auto-linked; image URLs render inline previews)
- Weighted-average cost basis in Portfolio (correct formula)
- 5-minute API response cache (stays within 25 req/day free limit)
- Skeleton loading states for news and stock cards
- Chart interval selector (daily / weekly)
- Defence-in-depth XSS: sanitised on client AND server
- News sentiment badges (Bullish / Bearish / Neutral)
- Always-functional demo mode with mock data fallback

---

## Run Summary

```bash
# Assignment 1 — Weather App
cd Assignments/Assignment1; npm install; npm run dev

# Assignment 2 — Recipe Search
cd Assignments/Assignment2; npm install; npm run dev

# Assignment 3 — Movie Browser
cd Assignments/Assignment3
cp .env.example .env   # add VITE_TMDB_API_KEY
npm install; npm run dev

# Assignment 4 — Testing
cd Assignments/Assignment4
cp .env.example .env   # add VITE_TMDB_API_KEY
npm install
npm test               # run tests
npm run coverage       # coverage report
npm run dev            # run the app

# Final Project — StockPulse
cd Projects/FinalGroupProject
cp .env.example .env   # add VITE_ALPHA_VANTAGE_KEY + VITE_SOCKET_URL
npm install; npm run dev
# In separate terminal:
cd Projects/FinalGroupProject/server
npm install; node index.js
```
