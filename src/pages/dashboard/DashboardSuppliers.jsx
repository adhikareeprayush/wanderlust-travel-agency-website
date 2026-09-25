import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  Segmented,
  SummaryStrip,
  Toolbar,
} from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import Icon from "../../components/Icon";
import { formatDate } from "../../lib/tourImages";

const TYPES = ["Transport", "Hotels", "Guides", "Experiences"];
const TYPE_ICONS = {
  Transport: "globe",
  Hotels: "pin",
  Guides: "shield",
  Experiences: "star",
};
const STATUS_SUGGESTIONS = [
  "Active",
  "Contracted",
  "Awaiting release",
  "Review due",
  "Paused",
];
const statusTone = (status = "") => {
  const s = status.toLowerCase();
  if (/(active|contract|confirm)/.test(s)) return "confirmed";
  if (/(await|review|due|pending)/.test(s)) return "pending";
  if (/(pause|inactive|ended)/.test(s)) return "closed";
  return "in_progress";
};

const empty = {
  vendor: "",
  type: "Hotels",
  status: "Active",
  action: "",
  notes: "",
};

const DashboardSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [removing, setRemoving] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const load = () =>
    api("/suppliers")
      .then((d) => setSuppliers(d.suppliers))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        (type === "all" || s.type === type) &&
        (!term ||
          [s.vendor, s.status, s.action, s.notes]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))),
    );
  }, [suppliers, query, type]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const startEdit = (supplier) => {
    setError("");
    setEditing(supplier);
    setForm(
      supplier
        ? {
            vendor: supplier.vendor,
            type: supplier.type,
            status: supplier.status,
            action: supplier.action || "",
            notes: supplier.notes || "",
          }
        : empty,
    );
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing)
        await api(`/suppliers/${editing._id}`, { method: "PATCH", body: form });
      else await api("/suppliers", { method: "POST", body: form });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setRemoveError("");
    try {
      await api(`/suppliers/${removing._id}`, { method: "DELETE" });
      setRemoving(null);
      load();
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const count = (t) => suppliers.filter((s) => s.type === t).length;

  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="OUR TRUSTED PARTNERS"
        title="Suppliers"
        accent="behind every stay."
        description="Hotels, transport, local guides and experiences, with the next follow-up for each partner."
        actions={
          <button
            type="button"
            className="portal-btn portal-btn-primary"
            onClick={() => startEdit(null)}
          >
            <Icon name="plus" size={15} /> Add supplier
          </button>
        }
      />
      <SummaryStrip
        items={[
          { label: "Partners", value: suppliers.length, icon: "leaf" },
          {
            label: "Active or contracted",
            value: suppliers.filter(
              (s) => statusTone(s.status) === "confirmed",
            ).length,
            icon: "check",
            tone: "good",
          },
          {
            label: "Need attention",
            value: suppliers.filter((s) => statusTone(s.status) === "pending")
              .length,
            icon: "alert",
            tone: "warn",
          },
          {
            label: "Open follow-ups",
            value: suppliers.filter((s) => s.action).length,
            icon: "clock",
            tone: "info",
          },
        ]}
      />
      {error && !open && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search partners, status or actions"
        />
        <Segmented
          label="Filter by type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All", count: suppliers.length },
            ...TYPES.map((t) => ({ value: t, label: t, count: count(t) })),
          ]}
        />
      </Toolbar>
      {loading ? (
        <LoadingState>Loading partners…</LoadingState>
      ) : !visible.length ? (
        <div className="portal-card">
          <EmptyState
            icon="leaf"
            title={suppliers.length ? "No partners match" : "No partners yet"}
          >
            {suppliers.length
              ? "Try another type or search term."
              : "Add the hotels, transport and experiences you work with."}
          </EmptyState>
        </div>
      ) : (
        <div className="portal-people-grid is-wide">
          {visible.map((supplier) => (
            <article key={supplier._id} className="portal-person-card">
              <header>
                <span className="portal-settings-icon" aria-hidden="true">
                  <Icon name={TYPE_ICONS[supplier.type] || "leaf"} size={18} />
                </span>
                <div>
                  <h3>{supplier.vendor}</h3>
                  <p>{supplier.type}</p>
                </div>
                <span
                  className={`portal-status portal-status-${statusTone(supplier.status)}`}
                >
                  <span className="portal-status-dot" aria-hidden="true" />
                  {supplier.status}
                </span>
              </header>
              <div className="portal-next-action">
                <p className="portal-mini-label">NEXT ACTION</p>
                <p>{supplier.action || "Nothing scheduled"}</p>
              </div>
              {supplier.notes && (
                <p className="portal-person-notes">{supplier.notes}</p>
              )}
              <footer>
                <span className="portal-muted">
                  Updated {formatDate(supplier.updatedAt)}
                </span>
                <div className="portal-row-actions">
                  <button
                    type="button"
                    className="portal-icon-btn"
                    aria-label={`Edit ${supplier.vendor}`}
                    onClick={() => startEdit(supplier)}
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    type="button"
                    className="portal-icon-btn is-danger"
                    aria-label={`Delete ${supplier.vendor}`}
                    onClick={() => {
                      setRemoveError("");
                      setRemoving(supplier);
                    }}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
      {open ? (
        <Modal
          title={editing ? "Edit supplier" : "Add supplier"}
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <label className="field">
              Supplier name
              <input
                required
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
                placeholder="e.g. Alpine Rail Partners"
              />
            </label>
            <div className="form-row">
              <label className="field">
                Partner type
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Status
                <input
                  list="supplier-statuses"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                />
                <datalist id="supplier-statuses">
                  {STATUS_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>
            </div>
            <label className="field">
              Next action
              <input
                value={form.action}
                onChange={(e) => set("action", e.target.value)}
                placeholder="e.g. Confirm June seat block"
              />
            </label>
            <label className="field">
              Team notes
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
            <div className="portal-modal-actions">
              <button
                type="button"
                className="portal-btn portal-btn-secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={busy}
                type="submit"
                className="portal-btn portal-btn-primary"
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Add supplier"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {removing && (
        <ConfirmDialog
          title="Remove this supplier?"
          confirmLabel="Remove supplier"
          busy={busy}
          error={removeError}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        >
          <strong>{removing.vendor}</strong> will be removed from your partner
          directory.
        </ConfirmDialog>
      )}
    </div>
  );
};

export default DashboardSuppliers;
