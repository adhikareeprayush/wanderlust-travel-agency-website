import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Brand from "./Brand";
import Icon from "./Icon";
export default function AuthPage({ registering = false }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const from =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/") &&
    !location.state.from.startsWith("//") &&
    !["/login", "/register"].includes(location.state.from)
      ? location.state.from
      : null;
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = registering
      ? await register(form)
      : await login(form.email, form.password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const staff = ["admin", "staff"].includes(result.user.role);
    const allowedReturn =
      from &&
      (staff ? !from.startsWith("/account") : !from.startsWith("/dashboard"));
    navigate(
      (allowedReturn && from) || (staff ? "/dashboard" : "/account/bookings"),
      { replace: true },
    );
  }
  return (
    <div className="auth-page auth-page-revamp">
      <aside className="auth-visual">
        <div className="auth-visual-image" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-inner">
          <Brand light />
          <div className="auth-visual-story">
            <p className="eyebrow">A WORLD OF POSSIBILITY</p>
            <h2>
              A little further.
              <br />
              <em>A lot closer.</em>
            </h2>
            <p>
              From your first idea to the moments you bring home, every great
              journey begins with a single step.
            </p>
            <div className="auth-visual-rule">
              <span>THOUGHTFULLY MADE</span>
              <span>BEAUTIFULLY TRAVELLED</span>
            </div>
          </div>
          <div className="auth-visual-bottom">
            <span>
              <Icon name="pin" size={15} /> Somewhere extraordinary
            </span>
            <span>01 / 03</span>
          </div>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          <div className="auth-form-top">
            <Link to="/packages" className="auth-back-link">
              <Icon name="arrow" size={16} /> Back to journeys
            </Link>
            <span className="auth-secure">
              <Icon name="shield" size={15} /> Your space, securely
            </span>
          </div>
          <div className="auth-form-content">
            <span className="auth-form-kicker">
              {registering ? "YOUR ADVENTURE AWAITS" : "WELCOME TO WANDERLUST"}
            </span>
            <h1>{registering ? "Make room for more." : "Welcome back."}</h1>
            <p>
              {registering
                ? "Create an account to keep every journey, request and detail together."
                : "Sign in to pick up where your next journey left off."}
            </p>
            <form onSubmit={submit} className="auth-fields">
              <div className="auth-form-grid">
                {registering && (
                  <label className="field">
                    Full name
                    <input
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      minLength="2"
                      maxLength="100"
                      placeholder="Your full name"
                      required
                    />
                  </label>
                )}
                <label className="field">
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    maxLength="254"
                    placeholder="you@example.com"
                    required
                  />
                </label>
                {registering && (
                  <label className="field">
                    Phone <small>Optional</small>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      maxLength="30"
                      placeholder="Including country code"
                    />
                  </label>
                )}
                <label className="field">
                  Password
                  <div className="auth-password-field">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        registering ? "new-password" : "current-password"
                      }
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      minLength={registering ? 8 : undefined}
                      maxLength="128"
                      placeholder={
                        registering
                          ? "At least 8 characters"
                          : "Enter your password"
                      }
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {registering && <small>Use at least 8 characters.</small>}
                </label>
              </div>
              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}
              <button className="button auth-submit" disabled={busy}>
                {busy
                  ? "Just a moment…"
                  : registering
                    ? "Create my account"
                    : "Sign in"}
                <Icon name="arrow" size={17} />
              </button>
            </form>
            <p className="auth-switch">
              {registering
                ? "Already travelling with us?"
                : "New to Wanderlust?"}{" "}
              <Link
                to={registering ? "/login" : "/register"}
                state={location.state}
              >
                {registering ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
          <p className="auth-form-footer">
            Wanderlust Travel · Journeys worth remembering
          </p>
        </div>
      </main>
    </div>
  );
}
