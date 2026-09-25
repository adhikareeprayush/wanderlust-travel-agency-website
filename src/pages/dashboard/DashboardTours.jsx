import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import { formatMoney, resolveTourImage } from "../../lib/tourImages";

const empty = {
  title: "",
  region: "Europe",
  durationDays: 7,
  basePrice: 1200,
  excerpt: "",
  description: "",
  imageKey: "pkg0",
  featured: false,
  published: true,
};
const coverChoices = [
  { value: "pkg0", label: "Alpine peaks" },
  { value: "pkg1", label: "Italian coast" },
  { value: "pkg2", label: "Scottish Highlands" },
  { value: "view1", label: "Lisbon" },
  { value: "banner1", label: "Patagonia" },
  { value: "banner2", label: "Kyoto" },
  { value: "holiday", label: "Bali" },
  { value: "sec3", label: "Morocco" },
];

const DashboardTours = () => {
  const [tours, setTours] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api("/tours?published=all")
      .then((d) => setTours(d.tours))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await api(`/tours/${editing._id}`, { method: "PATCH", body: form });
      } else {
        await api("/tours", { method: "POST", body: form });
      }
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this tour?")) return;
    try {
      await api(`/tours/${id}`, { method: "DELETE" });
      load();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="portal-page space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">YOUR JOURNEY COLLECTION</p>
          <h2 className="font-volkhov text-3xl">Journeys</h2>
          <p className="mt-1 text-sm text-[#75806f]">
            Curate the journeys travellers can discover and request.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setOpen(true);
          }}
          className="w-fit rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          Add journey
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((t) => {
          const next = t.nextDeparture;
          const fill = next
            ? Math.round((next.bookedCount / next.seats) * 100)
            : 0;
          return (
            <Card
              key={t._id}
              title={t.title}
              subtitle={`${t.region} · ${t.durationDays} days`}
              action={
                <span
                  className={`portal-card-tag${t.published ? "" : " is-draft"}`}
                >
                  {t.published ? "Published" : "Draft"}
                </span>
              }
            >
              <div className="space-y-4">
                <img
                  className="portal-feature-image"
                  src={resolveTourImage(t.imageKey, t.slug)}
                  alt={t.title}
                />
                {t.featured && (
                  <span className="portal-card-tag">Featured journey</span>
                )}
                <p className="text-2xl font-medium">
                  {formatMoney(t.basePrice)}
                  <span className="text-sm text-[#75806f]"> / guest</span>
                </p>
                <p className="text-sm text-[#75806f]">
                  Next departure fill{" "}
                  {next
                    ? `${next.bookedCount}/${next.seats} (${fill}%)`
                    : "n/a"}
                </p>
                <div
                  className="portal-capacity-track"
                  aria-label={`${fill}% of next departure filled`}
                >
                  <span
                    style={{ width: `${Math.min(100, Math.max(0, fill))}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-black/10 py-2 text-sm"
                    onClick={() => {
                      setEditing(t);
                      setForm({
                        title: t.title,
                        region: t.region,
                        durationDays: t.durationDays,
                        basePrice: t.basePrice,
                        excerpt: t.excerpt,
                        description: t.description,
                        imageKey: t.imageKey,
                        featured: t.featured,
                        published: t.published,
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-black/10 py-2 text-sm"
                    onClick={() => remove(t._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {open ? (
        <Modal
          title={editing ? "Edit journey" : "Add journey"}
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {["title", "region"].map((name) => (
              <label className="field" key={name}>
                {
                  {
                    title: "Journey name",
                    region: "Region",
                  }[name]
                }
                <input
                  required={name === "title"}
                  placeholder={name}
                  value={form[name]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [name]: e.target.value }))
                  }
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </label>
            ))}
            <label className="field">
              Cover image
              <select
                value={
                  coverChoices.some((choice) => choice.value === form.imageKey)
                    ? form.imageKey
                    : "custom"
                }
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    imageKey: e.target.value === "custom" ? "" : e.target.value,
                  }))
                }
              >
                {coverChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
                <option value="custom">Custom image URL</option>
              </select>
            </label>
            {!coverChoices.some((choice) => choice.value === form.imageKey) && (
              <label className="field">
                Image URL
                <input
                  value={form.imageKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageKey: e.target.value }))
                  }
                  placeholder="https://example.com/journey.jpg"
                />
              </label>
            )}
            <img
              className="portal-modal-preview"
              src={resolveTourImage(form.imageKey)}
              alt="Selected journey cover preview"
            />
            <div className="form-row">
              <label className="field">
                Duration in days
                <input
                  type="number"
                  aria-label="Duration in days"
                  min="1"
                  max="365"
                  step="1"
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationDays: e.target.value }))
                  }
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </label>
              <label className="field">
                Price per traveller in USD
                <input
                  type="number"
                  aria-label="Price per traveller in USD"
                  min="1"
                  max="1000000"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basePrice: e.target.value }))
                  }
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="field">
              Short description
              <textarea
                aria-label="Short description"
                placeholder="Short description"
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
            </label>
            <label className="field">
              Full description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows="4"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published: e.target.checked }))
                }
              />
              Published
            </label>
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-primary py-2.5 text-sm text-white"
            >
              {busy ? "Saving…" : "Save journey"}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default DashboardTours;
