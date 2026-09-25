import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const UserMenu = ({ light = false }) => {
  const { user, logout, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const initials =
    user.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${
          light
            ? "border-white/30 bg-white/10 text-white"
            : "border-black/10 bg-white text-[#181433]"
        }`}
      >
        <span className="hidden text-sm font-medium sm:inline">
          {user.name}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          {initials}
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white text-[#181433] shadow-xl">
          <div className="border-b border-black/5 px-4 py-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-[#757095]">{user.email}</p>
          </div>
          <div className="p-2">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f9fafc]"
            >
              Account
            </Link>
            <Link
              to="/account/bookings"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f9fafc]"
            >
              My trips
            </Link>
            {isStaff ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm hover:bg-[#f9fafc]"
              >
                Dashboard
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
                navigate("/");
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-primary hover:bg-primary/5"
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserMenu;
