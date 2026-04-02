import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // Where to go after login — from router state, query param, or default home
  const searchParams = new URLSearchParams(location.search);
  const from = location.state?.from ?? searchParams.get("from") ?? "/";

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    login(trimmed);
    navigate(from, { replace: true });
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo" aria-hidden="true">
          📈
        </div>
        <h1 className="login-title">Welcome to StockPulse</h1>
        <p className="login-sub">Choose a display name to get started.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">
              Display Name
            </label>
            <input
              id="username-input"
              type="text"
              className={`form-input${error ? " invalid" : ""}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="e.g. TraderJoe"
              maxLength={30}
              required
              autoFocus
              aria-describedby={error ? "username-error" : undefined}
              aria-invalid={!!error}
            />
            {error && (
              <p id="username-error" className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary btn-block">
            Enter StockPulse
          </button>
        </form>

        <p className="login-note">
          No account needed — your data is saved locally in your browser.
        </p>
      </div>
    </main>
  );
}
