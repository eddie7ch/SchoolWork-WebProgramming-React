import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { PortfolioProvider } from './context/PortfolioContext.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import StockDetailsPage from './pages/StockDetailsPage/StockDetailsPage.jsx';
import WatchlistPage from './pages/WatchlistPage/WatchlistPage.jsx';
import PortfolioPage from './pages/PortfolioPage/PortfolioPage.jsx';
import ChatPage from './pages/ChatPage/ChatPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <PortfolioProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/stock/:symbol" element={<StockDetailsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </PortfolioProvider>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
