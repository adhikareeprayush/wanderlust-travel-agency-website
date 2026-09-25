import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Brand from "./Brand";
import Icon from "./Icon";
export default function Nav() {
  const [open, setOpen] = useState(false);
  const { user, isStaff, logout } = useAuth();
  const { pathname } = useLocation();
  const home = pathname === "/";
  return (
    <header className={`site-header ${home ? "header-home" : ""}`}>
      <div className="nav-inner">
        <Brand light={home} />
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/packages">Destinations</NavLink>
          <NavLink to="/about">Our story</NavLink>
          <NavLink to="/contact">Get in touch</NavLink>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link
                className="nav-account"
                to={isStaff ? "/dashboard" : "/account/bookings"}
              >
                {isStaff ? "Dashboard" : "My trips"}
              </Link>
              <button className="text-button desktop-only" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <Link className="nav-account desktop-only" to="/login">
              Sign in
            </Link>
          )}
          <Link to="/contact" className="button button-light nav-cta">
            Plan my trip <Icon name="northeast" size={17} />
          </Link>
        </div>
        <button
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ["/", "Home"],
            ["/packages", "Destinations"],
            ["/about", "Our story"],
            ["/contact", "Plan my trip"],
            [
              user ? "/account/bookings" : "/login",
              user ? "My trips" : "Sign in",
            ],
            ...(isStaff ? [["/dashboard", "Dashboard"]] : []),
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}>
              {label}
              <Icon name="arrow" size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
