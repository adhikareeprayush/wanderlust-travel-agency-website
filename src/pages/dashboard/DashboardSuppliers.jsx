import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";

const empty = {
  vendor: "",
  type: "Hotels",
  status: "Active",
  action: "",
  notes: "",
};

const DashboardSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api("/suppliers")
      .then((d) => setSuppliers(d.suppliers))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="portal-page space-y-6">
      {error && !open && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div>
        <p className="eyebrow">OUR TRUSTED PARTNERS</p>
        <h2 className="font-volkhov text-3xl">Suppliers</h2>
        <p className="mt-1 text-sm text-[#75806f]">
          Hotels, transport, guides, and experiences.
        </p>
      </div>
      <Card
        title="Partner directory"
        subtitle="Operational follow-ups"
        action={
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditing(null);
              setForm(empty);
              setOpen(true);
            }}
          >
            Add supplier
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {suppliers.map((supplier) => (
            <button
              type="button"
              key={supplier._id}
              className="rounded-2xl border border-black/5 bg-[#f5f7ef] p-4 text-left"
              onClick={() => {
                setEditing(supplier);
                setForm({
                  vendor: supplier.vendor,
                  type: supplier.type,
                  status: supplier.status,
                  action: supplier.action || "",
                  notes: supplier.notes || "",
                });
                setOpen(true);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="portal-settings-icon" aria-hidden="true">
                    {supplier.vendor?.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{supplier.vendor}</p>
                    <p className="mt-1 text-sm text-[#75806f]">
                      {supplier.type}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-black/5">
                  {supplier.status}
                </span>
              </div>
              <div className="mt-5 rounded-xl bg-white p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Next action
                </p>
                <p className="mt-1 text-sm">{supplier.action || "None"}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
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
                placeholder="Vendor"
                value={form.vendor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vendor: e.target.value }))
                }
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
            </label>
            <label className="field">
              Partner type
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              >
                {["Transport", "Hotels", "Guides", "Experiences"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {["status", "action", "notes"].map((name) => (
              <label className="field" key={name}>
                {
                  {
                    status: "Status",
                    action: "Next action",
                    notes: "Team notes",
                  }[name]
                }
                <input
                  key={name}
                  placeholder={name}
                  value={form[name]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [name]: e.target.value }))
                  }
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </label>
            ))}
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-primary py-2.5 text-sm text-white"
            >
              {busy ? "Saving…" : "Save supplier"}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default DashboardSuppliers;
