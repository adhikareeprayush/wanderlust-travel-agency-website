import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card } from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";

const statusStyles = {
  Available: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  "On tour": "bg-sky-50 text-sky-900 ring-sky-600/15",
  "Leave soon": "bg-amber-50 text-amber-900 ring-amber-600/15",
};

const empty = {
  name: "",
  region: "",
  experienceYears: 5,
  languages: "English",
  status: "Available",
  email: "",
};

const DashboardGuides = () => {
  const [guides, setGuides] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api("/guides")
      .then((d) => setGuides(d.guides))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        languages: form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing)
        await api(`/guides/${editing._id}`, { method: "PATCH", body: payload });
      else await api("/guides", { method: "POST", body: payload });
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
          <p className="eyebrow">THE PEOPLE WHO MAKE IT PERSONAL</p>
          <h2 className="font-volkhov text-3xl">Guides</h2>
          <p className="mt-1 text-sm text-[#75806f]">
            Hosts, languages, and assignments.
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
          Add guide
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((guide) => (
          <Card
            key={guide._id}
            title={guide.name}
            subtitle={`${guide.region} · ${guide.experienceYears} years`}
            action={
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  statusStyles[guide.status] || statusStyles.Available
                }`}
              >
                {guide.status}
              </span>
            }
          >
            <div className="space-y-4">
              <span className="portal-list-avatar" aria-hidden="true">
                {guide.name?.charAt(0).toUpperCase()}
              </span>
              <p className="text-sm">
                Rating {Number(guide.rating).toFixed(1)} / 5
              </p>
              <div className="flex flex-wrap gap-2">
                {(guide.languages || []).map((language) => (
                  <span
                    key={language}
                    className="rounded-full bg-[#f5f7ef] px-3 py-1 text-xs ring-1 ring-black/5"
                  >
                    {language}
                  </span>
                ))}
              </div>
              <ul className="text-sm text-[#52624f]">
                {(guide.tours || []).map((tour) => (
                  <li key={tour._id || tour}>{tour.title || tour}</li>
                ))}
              </ul>
              <button
                type="button"
                className="w-full rounded-xl border border-black/10 py-2 text-sm"
                onClick={() => {
                  setEditing(guide);
                  setForm({
                    name: guide.name,
                    region: guide.region,
                    experienceYears: guide.experienceYears,
                    languages: (guide.languages || []).join(", "),
                    status: guide.status,
                    email: guide.email || "",
                  });
                  setOpen(true);
                }}
              >
                Edit
              </button>
            </div>
          </Card>
        ))}
      </div>
      {open ? (
        <Modal
          title={editing ? "Edit guide" : "Add guide"}
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {["name", "region", "email", "languages"].map((name) => (
              <label className="field" key={name}>
                {
                  {
                    name: "Full name",
                    region: "Region",
                    email: "Email address",
                    languages: "Languages",
                  }[name]
                }
                <input
                  type={name === "email" ? "email" : "text"}
                  required={name === "name"}
                  placeholder={name === "languages" ? "English, French" : name}
                  value={form[name]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [name]: e.target.value }))
                  }
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </label>
            ))}
            <label className="field">
              Years of experience
              <input
                type="number"
                min="0"
                max="70"
                value={form.experienceYears}
                onChange={(e) =>
                  setForm((f) => ({ ...f, experienceYears: e.target.value }))
                }
              />
            </label>
            <label className="field">
              Availability
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              >
                {["Available", "On tour", "Leave soon"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button
              disabled={busy}
              type="submit"
              className="rounded-xl bg-primary py-2.5 text-sm text-white"
            >
              {busy ? "Saving…" : "Save guide"}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default DashboardGuides;
