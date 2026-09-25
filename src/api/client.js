const TOKEN_KEY = "wanderlust_token_v1";
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
const base = import.meta.env.VITE_API_URL || "";
export async function api(
  path,
  { method = "GET", body, auth = true, signal } = {},
) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const bookingId = path.match(/^\/bookings\/([a-f0-9]{24})(?:$|\/)/)?.[1];
  if (bookingId) {
    const access = sessionStorage.getItem(`booking-access:${bookingId}`);
    if (access) headers["X-Booking-Token"] = access;
  }
  let res;
  try {
    res = await fetch(`${base}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "We couldn’t connect. Please check your connection and try again.",
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(
      data.issues?.[0]?.message ||
        data.message ||
        "Something went wrong. Please try again.",
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}
