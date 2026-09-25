import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";

import AuthContext from "./authState";
async function linkGuestRequests() {
  const keys = Object.keys(sessionStorage).filter((key) =>
    key.startsWith("booking-access:"),
  );
  await Promise.allSettled(
    keys.map((key) =>
      api("/bookings/" + key.slice("booking-access:".length) + "/claim", {
        method: "POST",
      }),
    ),
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(data.token);
      if (data.user.role === "customer") await linkGuestRequests();
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: payload,
        auth: false,
      });
      setToken(data.token);
      if (data.user.role === "customer") await linkGuestRequests();
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await api("/auth/profile", { method: "PATCH", body: payload });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: Boolean(user),
      isStaff: user?.role === "staff" || user?.role === "admin",
    }),
    [user, ready, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
