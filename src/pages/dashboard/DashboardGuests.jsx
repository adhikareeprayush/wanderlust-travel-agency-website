import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import { formatMoney } from "../../lib/tourImages";

const empty = {
  name: "",
  email: "",
  phone: "",
  segment: "Traveler",
  notes: "",
  nextTrip: "",
};

const DashboardGuests = () => {
  const [guests, setGuests] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api("/guests")
      .then((d) => setGuests(d.guests))
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
        await api(`/guests/${editing._id}`, { method: "PATCH", body: form });
      else await api("/guests", { method: "POST", body: form });
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">PEOPLE BEHIND THE JOURNEYS</p>
          <h2 className="font-volkhov text-3xl">Travellers</h2>
          <p className="mt-1 text-sm text-[#75806f]">
            Contact details, future plans and confirmed trip value.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setOpen(true);
          }}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
        >
          Add traveller
        </button>
      </div>
      <Card
        title="Traveller directory"
        subtitle={`${guests.length} live profiles`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {guests.map((guest) => (
            <div
              key={guest._id}
              className="rounded-2xl border border-black/5 bg-[#f5f7ef] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="portal-list-avatar" aria-hidden="true">
                    {guest.name?.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{guest.name}</p>
                    <p className="mt-1 text-sm text-[#75806f]">
                      {guest.segment} · {guest.nextTrip || "No upcoming trip"}
                    </p>
                    <p className="mt-1 text-xs text-[#75806f]">{guest.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary ring-1 ring-black/5">
                  {formatMoney(guest.lifetimeValue)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-black/5">
                  {guest.notes || "No notes"}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  onClick={() => {
                    setEditing(guest);
                    setForm({
                      name: guest.name,
                      email: guest.email,
                      phone: guest.phone || "",
                      segment: guest.segment,
                      notes: guest.notes || "",
                      nextTrip: guest.nextTrip || "",
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {open ? (
        <Modal
          title={editing ? "Edit traveller" : "Add traveller"}
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {["name", "email", "phone", "segment", "nextTrip", "notes"].map(
              (name) => (
                <label className="field" key={name}>
                  {
                    {
                      name: "Full name",
                      email: "Email address",
                      phone: "Phone number",
                      segment: "Traveller segment",
                      nextTrip: "Next journey",
                      notes: "Team notes",
                    }[name]
                  }
                  <input
                    type={
                      name === "email"
                        ? "email"
                        : name === "phone"
                          ? "tel"
                          : "text"
                    }
                    required={name === "name" || name === "email"}
                    placeholder={name}
                    value={form[name]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [name]: e.target.value }))
                    }
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  />
                </label>
              ),
            )}
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-primary py-2.5 text-sm text-white"
            >
              {busy ? "Saving…" : "Save traveller"}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default DashboardGuests;
