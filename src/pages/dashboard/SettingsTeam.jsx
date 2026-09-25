import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import {
  Avatar,
  Card,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  SearchField,
  Segmented,
  SummaryStrip,
  Toolbar,
} from "../../components/dashboard/DashboardUi";
import Modal from "../../components/dashboard/Modal";
import Icon from "../../components/Icon";
import { PERMISSIONS, PERMISSION_KEYS } from "../../lib/permissions";
import { formatDate } from "../../lib/tourImages";

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

function PasswordField({ value, onChange, label = "Temporary password" }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      {label}
      <span className="portal-password-row">
        <input
          type={visible ? "text" : "password"}
          required
          minLength="8"
          maxLength="128"
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="portal-btn portal-btn-ghost is-small"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          className="portal-btn portal-btn-secondary is-small"
          onClick={() => {
            onChange(generatePassword());
            setVisible(true);
          }}
        >
          Generate
        </button>
      </span>
      <small>
        At least 8 characters. Share it privately; they can change it after
        signing in.
      </small>
    </label>
  );
}

function PermissionPicker({ value, onChange, disabled }) {
  const toggle = (key) =>
    onChange(
      value.includes(key) ? value.filter((k) => k !== key) : [...value, key],
    );
  return (
    <fieldset className="portal-fieldset" disabled={disabled}>
      <legend className="portal-legend-row">
        <span>Workspace access</span>
        {!disabled && (
          <span>
            <button type="button" onClick={() => onChange(PERMISSION_KEYS)}>
              Select all
            </button>
            <button type="button" onClick={() => onChange([])}>
              Clear
            </button>
          </span>
        )}
      </legend>
      {disabled ? (
        <p className="portal-form-hint is-boxed">
          <Icon name="shield" size={14} /> Administrators can open every area
          and manage the team.
        </p>
      ) : (
        <div className="portal-option-grid">
          {PERMISSIONS.map((item) => (
            <label key={item.key} className="portal-check">
              <input
                type="checkbox"
                checked={value.includes(item.key)}
                onChange={() => toggle(item.key)}
              />
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

function MemberDialog({ member, self, onClose, onSaved }) {
  const editing = Boolean(member);
  const [form, setForm] = useState({
    name: member?.name || "",
    email: member?.email || "",
    password: "",
    role: member?.role || "staff",
    permissions: member?.permissions || [
      "bookings",
      "departures",
      "enquiries",
    ],
    active: member ? member.active : true,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = editing
        ? {
            name: form.name,
            ...(self ? {} : { role: form.role, active: form.active }),
            ...(form.role === "staff" ? { permissions: form.permissions } : {}),
          }
        : form;
      const data = await api(editing ? `/team/${member.id}` : "/team", {
        method: editing ? "PATCH" : "POST",
        body,
      });
      onSaved(data.member);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={editing ? `Edit ${member.name}` : "Add a team member"}
      description={
        editing
          ? "Changes apply the next time they open a page."
          : "Create a sign-in for someone on your team and choose what they can work on."
      }
      onClose={onClose}
      size="lg"
    >
      <form className="form-stack" onSubmit={submit}>
        <div className="form-row">
          <label className="field">
            Full name
            <input
              required
              minLength="2"
              maxLength="100"
              autoComplete="off"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label className="field">
            Work email
            <input
              type="email"
              required
              autoComplete="off"
              disabled={editing}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>
        </div>
        {!editing && (
          <PasswordField
            value={form.password}
            onChange={(value) => set("password", value)}
          />
        )}
        <div className="field">
          Role
          <div className="portal-role-picker">
            {[
              {
                value: "staff",
                title: "Staff",
                copy: "Works in the areas you choose below.",
              },
              {
                value: "admin",
                title: "Administrator",
                copy: "Full access, including team and settings.",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`portal-check${self ? " is-disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  disabled={self}
                  checked={form.role === option.value}
                  onChange={() => set("role", option.value)}
                />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.copy}</small>
                </span>
              </label>
            ))}
          </div>
          {self && (
            <small>You cannot change your own role or deactivate yourself.</small>
          )}
        </div>
        <PermissionPicker
          value={form.permissions}
          onChange={(value) => set("permissions", value)}
          disabled={form.role === "admin"}
        />
        {editing && !self && (
          <label className="portal-check portal-status-toggle">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            <span>
              <strong>Account active</strong>
              <small>
                Deactivated members are signed out and cannot sign in until
                you reactivate them.
              </small>
            </span>
          </label>
        )}
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
            {busy ? "Saving…" : editing ? "Save changes" : "Create account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordDialog({ member, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/team/${member.id}/password`, {
        method: "POST",
        body: { password },
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
      title="Reset password"
      description={`Set a new password for ${member.name}.`}
      onClose={onClose}
      size="sm"
    >
      {done ? (
        <>
          <p className="portal-success-note" role="status">
            <Icon name="check" size={16} /> Password updated. Share it with{" "}
            {member.name.split(" ")[0]} privately.
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
          <PasswordField
            label="New password"
            value={password}
            onChange={setPassword}
          />
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
              {busy ? "Saving…" : "Reset password"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function useTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/team")
      .then((data) => setMembers(data.members))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return { members, setMembers, loading, error, setError };
}

export default function SettingsTeam({ adding, onAddingChange }) {
  const { user } = useAuth();
  const { members, setMembers, loading, error, setError } = useTeam();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removeError, setRemoveError] = useState("");
  const [busy, setBusy] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return members.filter(
      (m) =>
        (filter === "all" ||
          (filter === "inactive" ? !m.active : m.active && m.role === filter)) &&
        (!term || `${m.name} ${m.email}`.toLowerCase().includes(term)),
    );
  }, [members, query, filter]);
  const staff = members.filter((m) => m.role === "staff");

  const upsert = (member) =>
    setMembers((list) =>
      list.some((m) => m.id === member.id)
        ? list.map((m) => (m.id === member.id ? member : m))
        : [...list, member],
    );

  async function togglePermission(member, key) {
    const next = member.permissions.includes(key)
      ? member.permissions.filter((k) => k !== key)
      : [...member.permissions, key];
    setBusy(`${member.id}:${key}`);
    setError("");
    try {
      const data = await api(`/team/${member.id}`, {
        method: "PATCH",
        body: { permissions: next },
      });
      upsert(data.member);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    setBusy(removing.id);
    setRemoveError("");
    try {
      await api(`/team/${removing.id}`, { method: "DELETE" });
      setMembers((list) => list.filter((m) => m.id !== removing.id));
      setRemoving(null);
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setBusy("");
    }
  }

  if (loading) return <LoadingState>Loading your team…</LoadingState>;

  return (
    <>
      <SummaryStrip
        items={[
          { label: "Team members", value: members.length, icon: "users" },
          {
            label: "Administrators",
            value: members.filter((m) => m.role === "admin").length,
            icon: "shield",
          },
          {
            label: "Staff",
            value: staff.length,
            icon: "key",
            tone: "info",
          },
          {
            label: "Deactivated",
            value: members.filter((m) => !m.active).length,
            icon: "alert",
            tone: "muted",
          },
        ]}
      />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <Toolbar>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search name or email"
        />
        <Segmented
          label="Filter team"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Everyone", count: members.length },
            { value: "admin", label: "Admins" },
            { value: "staff", label: "Staff" },
            { value: "inactive", label: "Deactivated" },
          ]}
        />
      </Toolbar>
      <Card
        title="Team members"
        subtitle="Only administrators can add people or change access"
        className="portal-table-card"
      >
        {!visible.length ? (
          <EmptyState icon="users" title="No one matches">
            Try another search or filter.
          </EmptyState>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-data-table is-responsive">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th>Status</th>
                  <th>Last sign-in</th>
                  <th className="is-actions">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => {
                  const self = m.id === user?.id;
                  return (
                    <tr key={m.id} className={m.active ? "" : "is-muted"}>
                      <td data-label="Member">
                        <div className="portal-cell-person">
                          <Avatar name={m.name} size="sm" />
                          <div>
                            <strong>
                              {m.name}
                              {self && (
                                <span className="portal-you-chip">You</span>
                              )}
                            </strong>
                            <small>{m.email}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <span
                          className={`portal-role-badge${m.role === "admin" ? " is-admin" : ""}`}
                        >
                          {m.role === "admin" ? "Administrator" : "Staff"}
                        </span>
                      </td>
                      <td data-label="Access">
                        {m.role === "admin" ? (
                          <span className="portal-muted">Every area</span>
                        ) : (
                          <span className="portal-access-count">
                            {m.permissions.length} of {PERMISSIONS.length}{" "}
                            areas
                          </span>
                        )}
                      </td>
                      <td data-label="Status">
                        <span
                          className={`portal-status portal-status-${m.active ? "confirmed" : "closed"}`}
                        >
                          <span
                            className="portal-status-dot"
                            aria-hidden="true"
                          />
                          {m.active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td data-label="Last sign-in" className="is-num">
                        {m.lastLoginAt ? (
                          formatDate(m.lastLoginAt)
                        ) : (
                          <span className="portal-muted">Never</span>
                        )}
                      </td>
                      <td className="is-actions">
                        <div className="portal-row-actions">
                          <button
                            type="button"
                            className="portal-icon-btn"
                            aria-label={`Edit ${m.name}`}
                            title="Edit role and access"
                            onClick={() => setEditing(m)}
                          >
                            <Icon name="edit" size={15} />
                          </button>
                          {!self && (
                            <>
                              <button
                                type="button"
                                className="portal-icon-btn"
                                aria-label={`Reset password for ${m.name}`}
                                title="Reset password"
                                onClick={() => setResetting(m)}
                              >
                                <Icon name="key" size={15} />
                              </button>
                              <button
                                type="button"
                                className="portal-icon-btn is-danger"
                                aria-label={`Remove ${m.name}`}
                                title="Remove from team"
                                onClick={() => {
                                  setRemoveError("");
                                  setRemoving(m);
                                }}
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card
        title="Access matrix"
        subtitle="Tick an area to give a staff member access. Changes save immediately."
      >
        {!staff.length ? (
          <EmptyState icon="key" title="No staff accounts yet">
            Add a team member with the Staff role to choose what they can work
            on.
          </EmptyState>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-matrix">
              <thead>
                <tr>
                  <th>Staff member</th>
                  {PERMISSIONS.map((item) => (
                    <th key={item.key} title={item.description}>
                      <Icon name={item.icon} size={15} />
                      <span>{item.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((m) => (
                  <tr key={m.id} className={m.active ? "" : "is-muted"}>
                    <th scope="row">
                      <div className="portal-cell-person">
                        <Avatar name={m.name} size="sm" />
                        <div>
                          <strong>{m.name}</strong>
                          <small>
                            {m.active
                              ? `${m.permissions.length} of ${PERMISSIONS.length} areas`
                              : "Deactivated"}
                          </small>
                        </div>
                      </div>
                    </th>
                    {PERMISSIONS.map((item) => {
                      const on = m.permissions.includes(item.key);
                      return (
                        <td key={item.key}>
                          <label
                            className={`portal-matrix-toggle${on ? " is-on" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={busy === `${m.id}:${item.key}`}
                              onChange={() => togglePermission(m, item.key)}
                              aria-label={`${item.label} access for ${m.name}`}
                            />
                            <Icon name={on ? "check" : "plus"} size={14} />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {(adding || editing) && (
        <MemberDialog
          member={editing}
          self={editing?.id === user?.id}
          onClose={() => {
            setEditing(null);
            onAddingChange(false);
          }}
          onSaved={(member) => {
            upsert(member);
            setEditing(null);
            onAddingChange(false);
          }}
        />
      )}
      {resetting && (
        <ResetPasswordDialog
          member={resetting}
          onClose={() => setResetting(null)}
        />
      )}
      {removing && (
        <ConfirmDialog
          title="Remove from the team?"
          confirmLabel="Remove member"
          busy={busy === removing.id}
          error={removeError}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        >
          <strong>{removing.name}</strong> will lose access to the workspace
          and their sign-in will be deleted. To pause access instead, edit
          them and turn off <em>Account active</em>.
        </ConfirmDialog>
      )}
    </>
  );
}
