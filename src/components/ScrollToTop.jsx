import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const labels = {
      "/": "Travel beyond the ordinary",
      "/packages": "Our journeys",
      "/about": "Our story",
      "/contact": "Plan your trip",
      "/login": "Sign in",
      "/register": "Create account",
    };
    document.title = `Wanderlust — ${labels[pathname] || (pathname.startsWith("/dashboard") ? "Operations" : pathname.startsWith("/account") ? "Your account" : "Your journey")}`;
  }, [pathname]);
  return null;
}
