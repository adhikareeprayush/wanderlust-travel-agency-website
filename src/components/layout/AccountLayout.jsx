import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Brand from "../Brand";
import Icon from "../Icon";
export default function AccountLayout() {
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  function signOut() {
    logout();
    navigate("/", { replace: true });
  }
  return (
    <div className="account-shell">
      <header className="account-topbar">
        <div className="account-topbar-inner">
          <Brand />
          <div className="account-top-actions">
            <Link to="/packages" className="account-explore">
              Explore journeys <Icon name="northeast" size={16} />
            </Link>
            {isStaff && (
              <Link className="account-staff-link" to="/dashboard">
                Staff workspace
              </Link>
            )}
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="account-signout"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="account-hero">
        <div className="account-hero-inner">
          <div>
            <p className="eyebrow">YOUR WANDERLUST SPACE</p>
            <h1>
              Every journey has a story.
              <br />
              <em>Yours starts here.</em>
            </h1>
            <p>Your travel plans, details and next steps, all in one place.</p>
          </div>
          <span className="account-hero-mark" aria-hidden="true">
            <Icon name="globe" size={76} />
          </span>
        </div>
      </div>
      <div className="account-content">
        <aside className="account-sidebar">
          <div className="account-user-card">
            <span className="account-user-avatar">
              {user?.name
                ?.split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "WT"}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <nav aria-label="My account">
            <NavLink
              to="/account/bookings"
              className={({ isActive }) =>
                `account-nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon name="calendar" size={18} /> My journeys{" "}
              <Icon name="arrow" size={15} />
            </NavLink>
            <NavLink
              to="/account"
              end
              className={({ isActive }) =>
                `account-nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon name="users" size={18} /> Personal details{" "}
              <Icon name="arrow" size={15} />
            </NavLink>
            <Link to="/packages" className="account-nav-link">
              <Icon name="globe" size={18} /> Discover more{" "}
              <Icon name="arrow" size={15} />
            </Link>
          </nav>
          <div className="account-sidebar-note">
            <Icon name="mail" size={20} />
            <strong>Need a hand?</strong>
            <p>
              Our team is here to help with any question about your journey.
            </p>
            <Link to="/contact">
              Talk to us <Icon name="arrow" size={15} />
            </Link>
          </div>
        </aside>
        <main className="account-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
