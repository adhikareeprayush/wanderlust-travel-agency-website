import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import { PERMISSIONS } from "../../lib/permissions";
import Icon from "../Icon";
import Modal from "./Modal";

function ChangePasswordDialog({ onClose }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (name) => (e) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.next !== form.confirm)
      return setError("The new passwords do not match.");
    setBusy(true);
    try {
      await api("/auth/password", {
        method: "POST",
        body: { currentPassword: form.current, newPassword: form.next },
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Change password"
      description="Use at least 8 characters. You stay signed in on this device."
      onClose={onClose}
      size="sm"
    >
      {done ? (
        <>
          <p className="portal-success-note" role="status">
            <Icon name="check" size={16} /> Your password has been updated.
          </p>
          <div className="portal-modal-actions">
            <button
              type="button"
              className="portal-btn portal-btn-primary"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </>
      ) : (
        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            Current password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.current}
              onChange={set("current")}
            />
          </label>
          <label className="field">
            New password
            <input
              type="password"
              required
              minLength="8"
              maxLength="128"
              autoComplete="new-password"
              value={form.next}
              onChange={set("next")}
            />
          </label>
          <label className="field">
            Confirm new password
            <input
              type="password"
              required
              minLength="8"
              maxLength="128"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
            />
          </label>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <div className="portal-modal-actions">
            <button
              type="button"
              className="portal-btn portal-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="portal-btn portal-btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function DashboardProfileMenu({ initials, user }) {
  const [open, setOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const ref = useRef(null);
  const { logout, isAdmin } = useAuth();
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
  const roleLabel = isAdmin ? "Administrator" : "Staff";
  const areas = user?.permissions?.length ?? 0;
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
          <small>{roleLabel}</small>
        </span>
        <Icon name="chevron" size={15} />
      </button>
      {open && (
        <div className="portal-profile-menu" role="menu">
          <div className="portal-profile-intro">
            <span className="portal-avatar is-lg">{initials}</span>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <div className="portal-profile-access">
            <span className={`portal-role-badge${isAdmin ? " is-admin" : ""}`}>
              <Icon name="shield" size={12} /> {roleLabel}
            </span>
            <small>
              {isAdmin
                ? "Full access and team management"
                : `Access to ${areas} of ${PERMISSIONS.length} areas`}
            </small>
          </div>
          <div className="portal-profile-group">
            {isAdmin && (
              <>
                <Link
                  role="menuitem"
                  to="/dashboard/settings?tab=team"
                  onClick={() => setOpen(false)}
                >
                  <Icon name="users" size={16} /> Team & permissions
                </Link>
                <Link
                  role="menuitem"
                  to="/dashboard/settings?tab=service"
                  onClick={() => setOpen(false)}
                >
                  <Icon name="settings" size={16} /> Service settings
                </Link>
              </>
            )}
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setChanging(true);
              }}
            >
              <Icon name="key" size={16} /> Change password
            </button>
            <Link role="menuitem" to="/" onClick={() => setOpen(false)}>
              <Icon name="northeast" size={16} /> View website
            </Link>
          </div>
          <div className="portal-profile-group">
            <button role="menuitem" className="is-danger" onClick={signOut}>
              <Icon name="logout" size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
      {changing && <ChangePasswordDialog onClose={() => setChanging(false)} />}
    </div>
  );
}
