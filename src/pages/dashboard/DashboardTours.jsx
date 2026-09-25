import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  formatDate,
  formatMoney,
  resolveTourImage,
} from "../../lib/tourImages";

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
const regions = ["Europe", "Asia", "Africa", "South America", "North America"];

const DashboardTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");
  const [removing, setRemoving] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const load = () =>
    api("/tours?published=all")
      .then((d) => setTours(d.tours))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tours.filter(
      (t) =>
        (view === "all" ||
          (view === "published" && t.published) ||
          (view === "draft" && !t.published) ||
          (view === "featured" && t.featured)) &&
        (!term ||
          `${t.title} ${t.region}`.toLowerCase().includes(term)),
    );
  }, [tours, query, view]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const [uploading, setUploading] = useState(false);
  // The browser sends the file straight to ImageKit using a short-lived
  // signature from our server, so the private key never leaves the server.
  async function uploadCover(file) {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type))
      return setError("Choose a JPG, PNG, WebP or AVIF image.");
    if (file.size > 10 * 1024 * 1024)
      return setError("Choose an image smaller than 10 MB.");
    setUploading(true);
    try {
      const auth = await api("/uploads/auth");
      const body = new FormData();
      body.append("file", file);
      body.append("fileName", file.name);
      body.append("folder", auth.folder);
      body.append("useUniqueFileName", "true");
      for (const key of ["publicKey", "signature", "expire", "token"])
        body.append(key, auth[key]);
      const response = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        { method: "POST", body },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "The image could not be uploaded.");
      set("imageKey", data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const startEdit = (tour) => {
    setError("");
    setEditing(tour);
    setForm(
      tour
        ? {
            title: tour.title,
            region: tour.region,
            durationDays: tour.durationDays,
            basePrice: tour.basePrice,
            excerpt: tour.excerpt || "",
            description: tour.description || "",
            imageKey: tour.imageKey,
            featured: tour.featured,
            published: tour.published,
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

  const remove = async () => {
    setBusy(true);
    setRemoveError("");
    try {
      await api(`/tours/${removing._id}`, { method: "DELETE" });
      setRemoving(null);
      load();
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const published = tours.filter((t) => t.published).length;
  const avgPrice = tours.length
    ? tours.reduce((sum, t) => sum + Number(t.basePrice || 0), 0) / tours.length
    : 0;

  return (
    <div className="portal-page">
      <PageHeader
        eyebrow="YOUR JOURNEY COLLECTION"
        title="Journeys worth"
        accent="the long way round."
        description="Curate the journeys travellers can discover and request. Drafts stay hidden from the website until you publish them."
        actions={
          <button
            type="button"
            className="portal-btn portal-btn-primary"
            onClick={() => startEdit(null)}
          >
            <Icon name="plus" size={15} /> Add journey
          </button>
        }
      />
      <SummaryStrip
        items={[
          { label: "Journeys", value: tours.length, icon: "pin" },
          {
            label: "Live on the website",
            value: published,
            icon: "globe",
            tone: "good",
          },
          {
            label: "Drafts",
            value: tours.length - published,
            icon: "edit",
            tone: "muted",
          },
          {
            label: "Average price per guest",
            value: formatMoney(Math.round(avgPrice)),
            icon: "dollar",
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
          placeholder="Search journeys or regions"
        />
        <Segmented
          label="Filter journeys"
          value={view}
          onChange={setView}
          options={[
            { value: "all", label: "All", count: tours.length },
            { value: "published", label: "Published", count: published },
            {
              value: "draft",
              label: "Drafts",
              count: tours.length - published,
            },
            {
              value: "featured",
              label: "Featured",
              count: tours.filter((t) => t.featured).length,
            },
          ]}
        />
      </Toolbar>
      {loading ? (
        <LoadingState>Loading journeys…</LoadingState>
      ) : !visible.length ? (
        <div className="portal-card">
          <EmptyState
            icon="pin"
            title={tours.length ? "No journeys match" : "No journeys yet"}
            action={
              !tours.length && (
                <button
                  type="button"
                  className="portal-btn portal-btn-primary"
                  onClick={() => startEdit(null)}
                >
                  <Icon name="plus" size={15} /> Add your first journey
                </button>
              )
            }
          >
            {tours.length
              ? "Try a different filter or search term."
              : "Create a journey, then add departure dates so travellers can request it."}
          </EmptyState>
        </div>
      ) : (
        <div className="portal-tour-grid">
          {visible.map((t) => {
            const next = t.nextDeparture;
            const fill = next
              ? Math.round((next.bookedCount / Math.max(next.seats, 1)) * 100)
              : 0;
            return (
              <article key={t._id} className="portal-tour-card">
                <div className="portal-tour-media">
                  <img src={resolveTourImage(t.imageKey, t.slug, 700)} alt="" />
                  <div className="portal-tour-tags">
                    <span
                      className={`portal-status portal-status-${t.published ? "published" : "draft"}`}
                    >
                      <span className="portal-status-dot" aria-hidden="true" />
                      {t.published ? "Published" : "Draft"}
                    </span>
                    {t.featured && (
                      <span className="portal-chip is-brand">
                        <Icon name="star" size={11} /> Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="portal-tour-body">
                  <p className="portal-tour-meta">
                    {t.region} · {t.durationDays} days
                  </p>
                  <h3>{t.title}</h3>
                  <p className="portal-tour-price">
                    {formatMoney(t.basePrice)} <span>per guest</span>
                  </p>
                  <div className="portal-tour-next">
                    <p>
                      <span>
                        {next
                          ? `Next departure ${formatDate(next.startDate)}`
                          : "No upcoming departure"}
                      </span>
                      {next && (
                        <strong>
                          {next.bookedCount}/{next.seats}
                        </strong>
                      )}
                    </p>
                    <span
                      className={`portal-capacity-track${fill >= 100 ? " is-full" : ""}`}
                    >
                      <span style={{ width: `${Math.min(100, fill)}%` }} />
                    </span>
                  </div>
                  <div className="portal-tour-actions">
                    <button
                      type="button"
                      className="portal-btn portal-btn-secondary is-small"
                      onClick={() => startEdit(t)}
                    >
                      <Icon name="edit" size={14} /> Edit
                    </button>
                    {t.published && (
                      <Link
                        className="portal-btn portal-btn-ghost is-small"
                        to={`/packages/${t.slug}`}
                        target="_blank"
                      >
                        View <Icon name="northeast" size={13} />
                      </Link>
                    )}
                    <button
                      type="button"
                      className="portal-icon-btn is-danger"
                      aria-label={`Delete ${t.title}`}
                      onClick={() => {
                        setRemoveError("");
                        setRemoving(t);
                      }}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {open ? (
        <Modal
          title={editing ? "Edit journey" : "Add journey"}
          description="Prices are per traveller. Totals are always calculated by the server."
          onClose={() => setOpen(false)}
          size="lg"
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="form-row">
              <label className="field">
                Journey name
                <input
                  required
                  minLength="3"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Norwegian Fjords"
                />
              </label>
              <label className="field">
                Region
                <input
                  list="tour-regions"
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                />
                <datalist id="tour-regions">
                  {regions.map((region) => (
                    <option key={region} value={region} />
                  ))}
                </datalist>
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                Duration in days
                <input
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={form.durationDays}
                  onChange={(e) => set("durationDays", e.target.value)}
                />
              </label>
              <label className="field">
                Price per traveller (USD)
                <input
                  type="number"
                  min="1"
                  max="1000000"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => set("basePrice", e.target.value)}
                />
              </label>
            </div>
            <div className="portal-cover-picker">
              <img
                className="portal-modal-preview"
                src={resolveTourImage(form.imageKey, undefined, 700)}
                alt="Selected journey cover preview"
              />
              <div className="form-stack">
                <label className="field">
                  Cover image
                  <select
                    value={
                      coverChoices.some((c) => c.value === form.imageKey)
                        ? form.imageKey
                        : "custom"
                    }
                    onChange={(e) =>
                      set(
                        "imageKey",
                        e.target.value === "custom" ? "" : e.target.value,
                      )
                    }
                  >
                    {coverChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                    <option value="custom">Your own image</option>
                  </select>
                </label>
                <div className="portal-upload-row">
                  <label
                    className={`portal-btn portal-btn-secondary is-small${uploading ? " is-busy" : ""}`}
                  >
                    <Icon name="plus" size={14} />
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      disabled={uploading}
                      onChange={(e) => {
                        uploadCover(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <small>JPG, PNG or WebP up to 10 MB. Stored on ImageKit.</small>
                </div>
              </div>
            </div>
            {!coverChoices.some((c) => c.value === form.imageKey) && (
              <label className="field">
                Image URL
                <input
                  value={form.imageKey}
                  onChange={(e) => set("imageKey", e.target.value)}
                  placeholder="Upload an image or paste an https:// link"
                />
              </label>
            )}
            <label className="field">
              Short description
              <textarea
                rows="2"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="One or two lines shown on journey cards"
              />
            </label>
            <label className="field">
              Full description
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </label>
            <div className="portal-check-row">
              <label className="portal-check">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                <span>
                  <strong>Published</strong>
                  <small>Visible and bookable on the website</small>
                </span>
              </label>
              <label className="portal-check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                />
                <span>
                  <strong>Featured</strong>
                  <small>Highlighted on the homepage</small>
                </span>
              </label>
            </div>
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
                {busy ? "Saving…" : editing ? "Save changes" : "Add journey"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {removing && (
        <ConfirmDialog
          title="Delete this journey?"
          confirmLabel="Delete journey"
          busy={busy}
          error={removeError}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        >
          <strong>{removing.title}</strong> and its departure dates will be
          removed. Journeys with booking history cannot be deleted; unpublish
          them instead.
        </ConfirmDialog>
      )}
    </div>
  );
};

export default DashboardTours;
