import { createRoot } from "react-dom/client";
import "./index.css";
import "./portal.css";
import App from "./App.jsx";
import { imageUrl } from "./lib/imagekit";

// Background photography in CSS reads this variable.
document.documentElement.style.setProperty(
  "--hero-image",
  `url("${imageUrl("/images/hero-mountains.jpg", { width: 2000 })}")`,
);

createRoot(document.getElementById("root")).render(<App />);
