import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { EmptyState } from "./dashboard/DashboardUi";

export const RequireAuth = () => {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center font-poppins text-[#757095]">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // Team accounts work in the workspace; the traveller account area is not for them.
  if (user.role === "staff" || user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export const RequireStaff = () => {
  const { user, ready, isStaff } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center font-poppins text-[#757095]">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isStaff) {
    return <Navigate to="/account" replace />;
  }
  return <Outlet />;
};

// Shows a clear message instead of a failing page when a staff member
// opens an area that has not been granted to them. The server enforces it too.
export const RequirePermission = ({ permission, admin = false, children }) => {
  const { can, isAdmin } = useAuth();
  if (admin ? isAdmin : can(permission)) return children;
  return (
    <div className="portal-page">
      <div className="portal-card">
        <EmptyState
          icon="shield"
          title="This area isn't part of your access"
          action={
            <Link className="portal-btn portal-btn-secondary" to="/dashboard">
              Back to overview
            </Link>
          }
        >
          {admin
            ? "Only administrators can open this page."
            : "Ask an administrator to add it to your permissions if you need it."}
        </EmptyState>
      </div>
    </div>
  );
};

const ProtectedRoute = RequireStaff;
export default ProtectedRoute;
