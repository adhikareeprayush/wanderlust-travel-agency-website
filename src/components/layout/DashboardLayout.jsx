import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Brand from "../Brand";
import Icon from "../Icon";
import { useAuth } from "../../context/useAuth";
import { api } from "../../api/client";
import DashboardProfileMenu from "../dashboard/DashboardProfileMenu";

const primary = [
  { to: "/dashboard", label: "Overview", icon: "globe", end: true },
  {
    to: "/dashboard/bookings",
    label: "Bookings",
    icon: "calendar",
    permission: "bookings",
  },
  { to: "/dashboard/tours", label: "Journeys", icon: "pin", permission: "tours" },
  {
    to: "/dashboard/departures",
    label: "Departures",
    icon: "clock",
    permission: "departures",
  },
  {
    to: "/dashboard/enquiries",
    label: "Enquiries",
    icon: "mail",
    permission: "enquiries",
  },
];
const secondary = [
  {
    to: "/dashboard/guests",
    label: "Travellers",
    icon: "users",
    permission: "guests",
  },
  {
    to: "/dashboard/guides",
    label: "Guides",
    icon: "shield",
    permission: "guides",
  },
  {
    to: "/dashboard/suppliers",
    label: "Suppliers",
    icon: "leaf",
    permission: "suppliers",
  },
  {
    to: "/dashboard/analytics",
    label: "Analytics",
    icon: "chart",
    permission: "analytics",
  },
  {
    to: "/dashboard/settings",
    label: "Team & settings",
    icon: "settings",
    admin: true,
  },
];
const allItems = [...primary, ...secondary];

function SidebarGroup({ title, items, onNavigate, badges = {} }) {
  return (
    <div className="portal-nav-group">
      <p className="portal-nav-caption">{title}</p>
      <nav aria-label={title}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `portal-nav-link${isActive ? " active" : ""}`
            }
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
            {badges[item.to] > 0 && (
              <span
                className="portal-nav-indicator"
                aria-label={`${badges[item.to]} new`}
              />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { user, can, isAdmin } = useAuth();
  const allowed = (item) =>
    item.admin ? isAdmin : !item.permission || can(item.permission);
  const canEnquiries = can("enquiries");
  const [open, setOpen] = useState(false);
  const [newEnquiries, setNewEnquiries] = useState(0);
  const current =
    allItems.find((item) => item.to === pathname)?.label || "Overview";
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WT";
  useEffect(() => {
    if (!canEnquiries) return undefined;
    const controller = new AbortController();
    api("/enquiries", { signal: controller.signal })
      .then((data) =>
        setNewEnquiries(
          data.enquiries.filter((row) => row.status === "new").length,
        ),
      )
      .catch(() => {});
    return () => controller.abort();
  }, [pathname, canEnquiries]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="portal-shell admin-shell">
      {open && (
        <button
          className="portal-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`portal-sidebar${open ? " is-open" : ""}`}
        id="portal-sidebar"
      >
        <div className="portal-sidebar-top">
          <Brand light />
          <button
            className="portal-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="portal-sidebar-scroll">
          <SidebarGroup
            title="WORKSPACE"
            items={primary.filter(allowed)}
            badges={{ "/dashboard/enquiries": newEnquiries }}
            onNavigate={() => setOpen(false)}
          />
          {secondary.some(allowed) && (
            <SidebarGroup
              title={isAdmin ? "OPERATIONS & TEAM" : "OPERATIONS"}
              items={secondary.filter(allowed)}
              onNavigate={() => setOpen(false)}
            />
          )}
        </div>
        <div className="portal-sidebar-bottom">
          <NavLink
            to="/"
            className="portal-view-site"
            onClick={() => setOpen(false)}
          >
            View website <Icon name="northeast" size={16} />
          </NavLink>
        </div>
      </aside>
      <div className="portal-content">
        <header className="portal-header">
          <div className="portal-header-left">
            <button
              className="portal-menu-button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="portal-sidebar"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" size={22} />
            </button>
            <div>
              <span className="portal-breadcrumb">
                WANDERLUST <span>/</span> WORKSPACE
              </span>
              <h1>{current}</h1>
            </div>
          </div>
          <div className="portal-header-actions">
            <span className="portal-header-date">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <DashboardProfileMenu initials={initials} user={user} />
          </div>
        </header>
        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
