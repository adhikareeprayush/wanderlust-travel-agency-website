import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Icon from "../Icon";
export default function DashboardProfileMenu({ initials, user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const dismiss = (event) => {
      if (!ref.current?.contains(event.target) || event.key === "Escape")
        setOpen(false);
    };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, []);
  function signOut() {
    setOpen(false);
    logout();
    navigate("/", { replace: true });
  }
  return (
    <div className="portal-profile" ref={ref}>
      <button
        className="portal-profile-button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="portal-avatar">{initials}</span>
        <span className="portal-profile-name">
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </span>
        <Icon name="chevron" size={15} />
      </button>
      {open && (
        <div className="portal-profile-menu" role="menu">
          <div className="portal-profile-intro">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <Link role="menuitem" to="/account" onClick={() => setOpen(false)}>
            <Icon name="users" size={17} /> My profile
          </Link>
          <Link
            role="menuitem"
            to="/dashboard/settings"
            onClick={() => setOpen(false)}
          >
            <Icon name="settings" size={17} /> Agency settings
          </Link>
          <Link role="menuitem" to="/" onClick={() => setOpen(false)}>
            <Icon name="northeast" size={17} /> Public website
          </Link>
          <button role="menuitem" onClick={signOut}>
            <Icon name="close" size={17} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
