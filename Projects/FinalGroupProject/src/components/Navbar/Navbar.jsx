import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useWatchlist } from "../../context/WatchlistContext.jsx";
import { usePortfolio } from "../../context/PortfolioContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const { holdings } = usePortfolio();
  const navigate = useNavigate();

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <button
        className="navbar-brand"
        onClick={() => navigate("/")}
        aria-label="StockPulse home"
      >
        <span className="logo-icon" aria-hidden="true">
          📈
        </span>
        <span className="logo-text">StockPulse</span>
      </button>

      <ul className="navbar-links" role="list">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/watchlist"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Watchlist
            {watchlist.length > 0 && (
              <span className="badge" aria-label={`${watchlist.length} items`}>
                {watchlist.length}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/portfolio"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Portfolio
            {holdings.length > 0 && (
              <span
                className="badge"
                aria-label={`${holdings.length} holdings`}
              >
                {holdings.length}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/chat"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Chat
          </NavLink>
        </li>
      </ul>

      <div className="navbar-user">
        {user ? (
          <div className="user-info">
            <span className="user-avatar" aria-hidden="true">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{user.displayName}</span>
            <button className="btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <button
            className="btn-primary btn-sm"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
