import { useState } from "react";
import { useAuth } from "../context/useAuth";
import Icon from "../components/Icon";
export default function AccountProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setForm((value) => ({ ...value, password: "" }));
      setMessage("Your details have been saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-page">
      <div className="account-page-header">
        <div>
          <p className="eyebrow">THE DETAILS THAT MATTER</p>
          <h1>Personal details</h1>
          <p>
            Keep your contact information current so we can reach you about your
            journeys.
          </p>
        </div>
      </div>
      <div className="account-profile-grid">
        <section className="account-panel">
          <h2>Update your details</h2>
          <p>Your email address is used for booking updates and sign in.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              Full name
              <input
                required
                minLength="2"
                maxLength="100"
                autoComplete="name"
                value={form.name}
                onChange={(e) =>
                  setForm((value) => ({ ...value, name: e.target.value }))
                }
              />
            </label>
            <label className="field">
              Phone number
              <input
                type="tel"
                maxLength="30"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((value) => ({ ...value, phone: e.target.value }))
                }
                placeholder="Including country code"
              />
            </label>
            <label className="field">
              New password <small>Optional</small>
              <input
                type="password"
                autoComplete="new-password"
                minLength="8"
                maxLength="128"
                value={form.password}
                onChange={(e) =>
                  setForm((value) => ({ ...value, password: e.target.value }))
                }
                placeholder="Leave blank to keep your password"
              />
            </label>
            {message && (
              <p className="text-sm text-emerald-700" role="status">
                {message}
              </p>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="button" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
              <Icon name="arrow" size={16} />
            </button>
          </form>
        </section>
        <aside className="account-panel">
          <h2>Account at a glance</h2>
          <p>The details currently linked to your travel requests.</p>
          <div className="account-info-list">
            <div>
              <small>Account name</small>
              <strong>{user?.name}</strong>
            </div>
            <div>
              <small>Email address</small>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <small>Phone number</small>
              <strong>{user?.phone || "Not added yet"}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
