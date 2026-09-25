import { useEffect, useState } from "react";
import { api } from "../api/client";
export function useTours(query = "") {
  const [state, setState] = useState({ tours: [], loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    api(`/tours?${query}`, { auth: false, signal: controller.signal })
      .then((data) =>
        setState({ tours: data.tours, loading: false, error: "" }),
      )
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ tours: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [query]);
  return state;
}
